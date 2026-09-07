import { NextResponse } from "next/server";
import { getParticipantAuth, hasActiveMeetingContext } from "@/lib/waiting-room";

type RouteContext = { params: Promise<{ code: string }> };
export async function POST(request: Request, { params }: RouteContext) {
  const { code } = await params;
  if (!/^[a-z0-9]{10,16}$/.test(code)) return NextResponse.json({ verified: false }, { status: 404 });
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  if (typeof body?.password !== "string" || body.password.length < 4 || body.password.length > 128) return NextResponse.json({ verified: false }, { status: 400 });
  const auth = await getParticipantAuth(code, request);
  if (!auth) return NextResponse.json({ verified: false }, { status: 401 });
  if (!await hasActiveMeetingContext(auth, code)) return NextResponse.json({ verified: false }, { status: 409 });
  const { data, error } = await auth.supabase.rpc("verify_meeting_password", {
    requested_participant_key: auth.participantKey,
    requested_session_token_hash: auth.tokenHash,
    requested_meeting_code: code,
    requested_password: body.password,
  });
  if (error) return NextResponse.json({ verified: false });
  const verified = data === true || (data && typeof data === "object" && Object.values(data as Record<string, unknown>).some((value) => value === true));
  return NextResponse.json({ verified });
}
