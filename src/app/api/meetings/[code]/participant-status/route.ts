import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeParticipantCookie, hashSessionSecret, PARTICIPANT_SESSION_COOKIE } from "@/lib/participant-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ code: string }> };
type ParticipantSessionRow = { meeting_id: string; status: string };
type MeetingContextRow = { meeting_id: string; status: string };
const allowedStatuses = new Set(["joined", "left"]);

export async function POST(request: Request, { params }: RouteContext) {
  const { code } = await params;
  if (!/^[a-z0-9]{10,16}$/.test(code)) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });

  let requestedStatus: unknown;
  try {
    requestedStatus = (await request.json()).status;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof requestedStatus !== "string" || !allowedStatuses.has(requestedStatus)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const credentials = decodeParticipantCookie((await cookies()).get(PARTICIPANT_SESSION_COOKIE)?.value, code);
  const supabase = await createSupabaseServerClient();
  if (!credentials || !supabase) return NextResponse.json({ error: "Your meeting session is invalid or expired." }, { status: 401 });

  const tokenHash = hashSessionSecret(credentials.rawSecret);
  const { data: sessionData, error: sessionError } = await supabase.rpc("get_participant_session", {
    requested_participant_key: credentials.participantKey,
    requested_session_token_hash: tokenHash,
  }).maybeSingle();
  const session = sessionData as ParticipantSessionRow | null;
  if (sessionError || !session) return NextResponse.json({ error: "Your meeting session is invalid or expired." }, { status: 401 });

  const { data: contextData, error: contextError } = await supabase.rpc("get_participant_meeting_context", {
    requested_participant_key: credentials.participantKey,
    requested_session_token_hash: tokenHash,
    requested_meeting_code: code,
  }).maybeSingle();
  const context = contextData as MeetingContextRow | null;
  if (contextError || !context || context.meeting_id !== session.meeting_id) {
    return NextResponse.json({ error: "This meeting is no longer available." }, { status: 404 });
  }

  const { error } = await supabase.rpc("update_participant_session_status", {
    requested_participant_key: credentials.participantKey,
    requested_session_token_hash: tokenHash,
    requested_status: requestedStatus,
  });
  if (error) return NextResponse.json({ error: "Unable to update meeting status." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
