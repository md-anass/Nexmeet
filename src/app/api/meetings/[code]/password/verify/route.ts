import { NextResponse } from "next/server";
import { hashSessionSecret } from "@/lib/participant-session";
import { participantSelectorFromRequest, resolveParticipantCredentials } from "@/lib/participant-session-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ code: string }> };
export async function POST(request: Request, { params }: RouteContext) {
  const { code } = await params;
  if (!/^[a-z0-9]{10,16}$/.test(code)) return NextResponse.json({ verified: false }, { status: 404 });
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  if (typeof body?.password !== "string" || body.password.length < 4 || body.password.length > 128) return NextResponse.json({ verified: false }, { status: 400 });
  const selector = participantSelectorFromRequest(request);
  const credentials = selector ? await resolveParticipantCredentials(code, selector, true) : null;
  const supabase = await createSupabaseServerClient();
  if (!credentials || !supabase) return NextResponse.json({ verified: false }, { status: 401 });
  const { data, error } = await supabase.rpc("verify_meeting_password", {
    requested_participant_key: credentials.participantKey,
    requested_session_token_hash: hashSessionSecret(credentials.rawSecret),
    requested_meeting_code: code,
    requested_password: body.password,
  });
  if (error) return NextResponse.json({ verified: false });
  const verified = data === true || (data && typeof data === "object" && Object.values(data as Record<string, unknown>).some((value) => value === true));
  return NextResponse.json({ verified });
}
