import { NextResponse } from "next/server";
import { AccessToken, RoomConfiguration } from "livekit-server-sdk";
import { hashSessionSecret } from "@/lib/participant-session";
import { expireParticipantCredentials, participantSelectorFromRequest, resolveParticipantCredentials } from "@/lib/participant-session-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { booleanValue, firstRpcRow, stringValue } from "@/lib/waiting-room";

type RouteContext = { params: Promise<{ code: string }> };
type ParticipantSessionRow = { session_id: string; meeting_id: string; display_name: string; status: string };
type MeetingContextRow = { meeting_id: string; room_name: string; status: string };

function failure(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}


export async function POST(request: Request, { params }: RouteContext) {
  const { code } = await params;
  if (!/^[a-z0-9]{10,16}$/.test(code)) return failure(404, "Meeting not found.");

  const config = {
    url: process.env.LIVEKIT_URL,
    apiKey: process.env.LIVEKIT_API_KEY,
    apiSecret: process.env.LIVEKIT_API_SECRET,
  };
  if (!config.url || !config.apiKey || !config.apiSecret) return failure(503, "Video service is not configured.");

  const selector = participantSelectorFromRequest(request);
  const credentials = selector ? await resolveParticipantCredentials(code, selector, true) : null;
  if (!credentials) return failure(401, "Your meeting session is invalid or expired.");

  const supabase = await createSupabaseServerClient();
  if (!supabase) return failure(503, "Unable to connect to the meeting service.");

  const tokenHash = hashSessionSecret(credentials.rawSecret);
  const { data: sessionData, error: sessionError } = await supabase.rpc("get_participant_session", {
    requested_participant_key: credentials.participantKey,
    requested_session_token_hash: tokenHash,
  }).maybeSingle();
  const session = sessionData as ParticipantSessionRow | null;
  if (sessionError || !session || session.status === "left") {
    if (selector) await expireParticipantCredentials(selector);
    return failure(401, "Your meeting session is invalid or expired.");
  }

  const { data: contextData, error: contextError } = await supabase.rpc("get_participant_meeting_context", {
    requested_participant_key: credentials.participantKey,
    requested_session_token_hash: tokenHash,
    requested_meeting_code: code,
  }).maybeSingle();
  const context = contextData as MeetingContextRow | null;
  if (contextError || !context || context.status !== "active" || context.meeting_id !== session.meeting_id) {
    if (selector) await expireParticipantCredentials(selector);
    return failure(404, "This meeting is no longer available.");
  }

  const { data: authData } = await supabase.auth.getUser();
  const { data: ownerMeeting } = authData.user
    ? await supabase.from("meetings").select("host_user_id, access_mode, status").eq("public_code", code).maybeSingle()
    : { data: null };
  const ownerBypass = Boolean(
    authData.user &&
    ownerMeeting?.host_user_id === authData.user.id &&
    ownerMeeting.status === "active" &&
    ownerMeeting.access_mode === "approval_required",
  );

  const { data: gateData, error: gateError } = await supabase.rpc("can_participant_join_livekit", {
    requested_participant_key: credentials.participantKey,
    requested_session_token_hash: tokenHash,
    requested_meeting_code: code,
  });
  const gateRow = firstRpcRow(gateData);
  const gateAllowed = typeof gateData === "boolean" ? gateData : booleanValue(gateRow ?? {}, "allowed", "can_join");
  const gateStatus = stringValue(gateRow ?? {}, "status", "access_status", "waiting_status") ?? "not_allowed";
  const denialReason = gateError
    ? "JOIN_GATE_RPC_ERROR"
    : gateStatus === "pending"
      ? "APPROVAL_PENDING"
      : gateStatus === "rejected"
        ? "APPROVAL_REJECTED"
        : gateStatus === "approval_required"
          ? "APPROVAL_REQUIRED"
          : "JOIN_GATE_DENIED";
  if (gateError || (gateAllowed !== true && !ownerBypass)) {
    const message = gateStatus === "pending"
      ? "Your meeting access request is awaiting approval."
      : gateStatus === "rejected"
        ? "Your request to join this meeting was not approved."
        : gateStatus === "approval_required"
          ? "Request access to join this meeting."
          : "You are not allowed to join this meeting yet.";
    return NextResponse.json({ error: message, status: gateStatus, reason: denialReason }, { status: 403 });
  }

  const accessToken = new AccessToken(config.apiKey, config.apiSecret, {
    identity: credentials.participantKey,
    name: session.display_name,
    ttl: "10m",
  });
  accessToken.roomConfig = new RoomConfiguration({ departureTimeout: 120 });
  accessToken.addGrant({ roomJoin: true, room: context.room_name, canPublish: true, canSubscribe: true, canUpdateOwnMetadata: true });

  try {
    const token = await accessToken.toJwt();
    return NextResponse.json({ token, serverUrl: config.url });
  } catch {
    return failure(500, "Unable to start the meeting.");
  }
}
