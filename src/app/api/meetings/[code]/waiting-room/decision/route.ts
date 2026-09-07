import { NextResponse } from "next/server";
import { getParticipantAuth, hasActiveMeetingContext, isUuid, isValidMeetingCode, firstRpcRow, safeTimestamp, stringValue } from "@/lib/waiting-room";

type RouteContext = { params: Promise<{ code: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const { code } = await params;
  if (!isValidMeetingCode(code)) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  const auth = await getParticipantAuth(code, request);
  if (!auth) return NextResponse.json({ error: "Your meeting session is invalid or expired." }, { status: 401 });
  if (!await hasActiveMeetingContext(auth, code)) return NextResponse.json({ error: "This meeting is not available." }, { status: 409 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const payload = body && typeof body === "object" ? body as { entryId?: unknown; decision?: unknown } : {};
  if (typeof payload.entryId !== "string" || !isUuid(payload.entryId) || (payload.decision !== "admit" && payload.decision !== "reject")) {
    return NextResponse.json({ error: "Invalid waiting room decision." }, { status: 400 });
  }

  const { data, error } = await auth.supabase.rpc("decide_waiting_room_entry", {
    requested_participant_key: auth.participantKey,
    requested_session_token_hash: auth.tokenHash,
    requested_meeting_code: code,
    requested_waiting_room_entry_id: payload.entryId,
    requested_decision: payload.decision,
  });
  const row = firstRpcRow(data);
  const entryId = stringValue(row ?? {}, "entry_id", "waiting_room_entry_id");
  const status = stringValue(row ?? {}, "waiting_status", "status");
  const decidedAt = safeTimestamp(row ?? {}, "decided_at");
  const expectedStatus = payload.decision === "admit" ? "admitted" : "rejected";
  if (error || entryId !== payload.entryId || status !== expectedStatus || !decidedAt) return NextResponse.json({ error: "Unable to update waiting room entry." }, { status: 400 });
  return NextResponse.json({ entryId, status, decidedAt });
}
