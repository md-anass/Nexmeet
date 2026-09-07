import { NextResponse } from "next/server";
import { normalizeMeetingLifecycle, normalizePublicMeeting } from "@/lib/meeting-lifecycle";
import { hashSessionSecret } from "@/lib/participant-session";
import { participantSelectorFromRequest, resolveParticipantCredentials } from "@/lib/participant-session-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ code: string }> };
type ParticipantSessionRow = { meeting_id: string; status: string };
type MeetingContextRow = { meeting_id: string; status: string };

export async function POST(request: Request, { params }: RouteContext) {
  const { code } = await params;
  if (!/^[a-z0-9]{10,16}$/.test(code)) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });

  const selector = participantSelectorFromRequest(request);
  const credentials = selector ? await resolveParticipantCredentials(code, selector, true) : null;
  const supabase = await createSupabaseServerClient();
  if (!credentials || !supabase) return NextResponse.json({ error: "Your meeting session is invalid or expired." }, { status: 401 });

  const tokenHash = hashSessionSecret(credentials.rawSecret);
  const { data: sessionData, error: sessionError } = await supabase.rpc("get_participant_session", {
    requested_participant_key: credentials.participantKey,
    requested_session_token_hash: tokenHash,
  }).maybeSingle();
  const session = sessionData as ParticipantSessionRow | null;
  if (sessionError || !session || session.status === "left") return NextResponse.json({ error: "Your meeting session is invalid or expired." }, { status: 401 });

  const { data: contextData, error: contextError } = await supabase.rpc("get_participant_meeting_context", {
    requested_participant_key: credentials.participantKey,
    requested_session_token_hash: tokenHash,
    requested_meeting_code: code,
  }).maybeSingle();
  const context = contextData as MeetingContextRow | null;
  if (contextError || !context || context.meeting_id !== session.meeting_id || context.status !== "active") {
    return NextResponse.json({ error: "This meeting is no longer available." }, { status: 404 });
  }

  const { data: endData, error } = await supabase.rpc("end_meeting_as_current_host", {
    requested_participant_key: credentials.participantKey,
    requested_session_token_hash: tokenHash,
    requested_meeting_code: code,
  });
  if (error) return NextResponse.json({ error: "Only the current host can end this meeting." }, { status: 403 });

  const endedResult = normalizeMeetingLifecycle(endData);
  const { data: statusData } = await supabase.rpc("get_public_meeting_by_code", { meeting_code: code }).maybeSingle();
  const status = normalizePublicMeeting(statusData);
  return NextResponse.json({ status: "ended", startedAt: endedResult?.startedAt ?? status?.startedAt ?? null, endedAt: endedResult?.endedAt ?? status?.endedAt ?? null });
}
