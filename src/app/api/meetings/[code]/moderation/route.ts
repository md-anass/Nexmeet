import { NextResponse } from "next/server";
import { DataPacket_Kind, RoomServiceClient } from "livekit-server-sdk";
import { hashSessionSecret } from "@/lib/participant-session";
import { participantSelectorFromRequest, resolveParticipantCredentials } from "@/lib/participant-session-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { firstRpcRow } from "@/lib/waiting-room";

type RouteContext = { params: Promise<{ code: string }> };
type Action = "mute" | "mute_all" | "remove" | "ask_unmute" | "ask_all_unmute";

function fail(status: number, error: string) { return NextResponse.json({ error }, { status }); }

export async function POST(request: Request, { params }: RouteContext) {
  const { code } = await params;
  if (!/^[a-z0-9]{10,16}$/.test(code)) return fail(404, "Meeting not found.");
  const selector = participantSelectorFromRequest(request);
  const credentials = selector ? await resolveParticipantCredentials(code, selector, true) : null;
  const supabase = await createSupabaseServerClient();
  if (!credentials || !supabase) return fail(401, "Your meeting session is invalid or expired.");
  const tokenHash = hashSessionSecret(credentials.rawSecret);
  const { data: contextData, error: contextError } = await supabase.rpc("get_participant_meeting_context", {
    requested_participant_key: credentials.participantKey,
    requested_session_token_hash: tokenHash,
    requested_meeting_code: code,
  }).maybeSingle();
  const context = firstRpcRow(contextData);
  if (contextError || !context || context.status !== "active") return fail(404, "This meeting is no longer available.");
  const { data: hostData, error: hostError } = await supabase.rpc("get_current_host_participant_key", { meeting_code: code });
  const hostRow = firstRpcRow(hostData);
  const hostKey = typeof hostData === "string" ? hostData : hostRow?.current_host_participant_key;
  if (hostError || hostKey !== credentials.participantKey) return fail(403, "Only the current host can moderate this meeting.");

  const body = await request.json().catch(() => null) as { action?: Action; targetIdentity?: string } | null;
  const action = body?.action;
  if (!action || !["mute", "mute_all", "remove", "ask_unmute", "ask_all_unmute"].includes(action)) return fail(400, "Unsupported moderation action.");
  const roomName = typeof context.room_name === "string" ? context.room_name : null;
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!roomName || !url || !apiKey || !apiSecret) return fail(503, "Video moderation is not configured.");
  const rooms = new RoomServiceClient(url, apiKey, apiSecret);
  const participants = await rooms.listParticipants(roomName);
  const targets = action === "mute_all" || action === "ask_all_unmute"
    ? participants.filter((participant) => participant.identity !== credentials.participantKey)
    : participants.filter((participant) => participant.identity === body?.targetIdentity && participant.identity !== credentials.participantKey);
  if ((action === "mute" || action === "remove" || action === "ask_unmute") && targets.length !== 1) return fail(404, "Participant not found.");
  if (action === "remove") {
    await Promise.all(targets.map((participant) => rooms.removeParticipant(roomName, participant.identity)));
    return NextResponse.json({ ok: true, affected: targets.length });
  }
  if (action === "mute" || action === "mute_all") {
    const results = await Promise.allSettled(targets.flatMap((participant) => participant.tracks.filter((track) => String(track.source).toLowerCase().includes("microphone")).map((track) => rooms.mutePublishedTrack(roomName, participant.identity, track.sid, true))));
    return NextResponse.json({ ok: true, affected: results.filter((result) => result.status === "fulfilled").length, failed: results.filter((result) => result.status === "rejected").length });
  }
  const payload = new TextEncoder().encode(JSON.stringify({ type: "host_request_unmute", meetingCode: code, requestId: crypto.randomUUID() }));
  await rooms.sendData(roomName, payload, DataPacket_Kind.RELIABLE, { destinationIdentities: targets.map((participant) => participant.identity) });
  return NextResponse.json({ ok: true, affected: targets.length });
}
