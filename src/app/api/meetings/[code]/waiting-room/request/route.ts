import { NextResponse } from "next/server";
import { firstRpcRow, getParticipantAuth, hasActiveMeetingContext, isValidMeetingCode, isUuid, safeTimestamp, stringValue } from "@/lib/waiting-room";

type RouteContext = { params: Promise<{ code: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const { code } = await params;
  if (!isValidMeetingCode(code)) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  const auth = await getParticipantAuth(code, request);
  if (!auth) return NextResponse.json({ error: "Your meeting session is invalid or expired." }, { status: 401 });
  if (!await hasActiveMeetingContext(auth, code)) return NextResponse.json({ error: "This meeting is not available." }, { status: 409 });

  const { data, error } = await auth.supabase.rpc("request_meeting_join_approval", {
    requested_participant_key: auth.participantKey,
    requested_session_token_hash: auth.tokenHash,
    requested_meeting_code: code,
  });
  const row = firstRpcRow(data);
  const entryId = stringValue(row ?? {}, "entry_id", "waiting_room_entry_id");
  const status = stringValue(row ?? {}, "waiting_status", "status");
  const requestedAt = safeTimestamp(row ?? {}, "requested_at");
  if (error || !isUuid(entryId) || !status || !requestedAt) {
    return NextResponse.json({ error: "Unable to request meeting access." }, { status: 400 });
  }
  return NextResponse.json({ waitingRoomEntryId: entryId, status, requestedAt });
}
