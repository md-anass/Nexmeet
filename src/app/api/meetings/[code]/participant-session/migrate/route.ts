import { NextResponse } from "next/server";
import { generateParticipantSelector, hashSessionSecret } from "@/lib/participant-session";
import { expireLegacyParticipantCookie, resolveParticipantCredentials, writeParticipantCredentials } from "@/lib/participant-session-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ code: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { code } = await params;
  const destination = new URL(`/m/${code}`, request.url);
  if (!/^[a-z0-9]{10,16}$/.test(code)) return NextResponse.redirect(destination);

  const credentials = await resolveParticipantCredentials(code);
  const supabase = await createSupabaseServerClient();
  if (!credentials || !supabase) return NextResponse.redirect(destination);
  const { data: meeting, error: meetingError } = await supabase.rpc("get_public_meeting_by_code", { meeting_code: code }).maybeSingle();
  if (meetingError || !meeting || typeof meeting !== "object" || (meeting as { status?: unknown }).status !== "active") {
    return NextResponse.redirect(destination);
  }

  const { data, error } = await supabase.rpc("resume_participant_session", {
    requested_meeting_code: code,
    requested_participant_key: credentials.participantKey,
    requested_session_token_hash: hashSessionSecret(credentials.rawSecret),
  }).maybeSingle();
  const row = data && typeof data === "object" ? data as Record<string, unknown> : null;
  if (error || !row || (row.status !== "joined" && row.status !== "lobby")) {
    return NextResponse.redirect(destination);
  }

  const selector = generateParticipantSelector();
  await writeParticipantCredentials(selector, {
    meetingCode: code,
    participantKey: credentials.participantKey,
    secret: credentials.rawSecret,
  });
  await expireLegacyParticipantCookie();
  destination.searchParams.set("participant", selector);
  return NextResponse.redirect(destination);
}
