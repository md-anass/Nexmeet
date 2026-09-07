import { NextResponse } from "next/server";
import { getParticipantAuth, isValidMeetingCode, isUuid, rpcRows, safeTimestamp, stringValue } from "@/lib/waiting-room";

type RouteContext = { params: Promise<{ code: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { code } = await params;
  if (!isValidMeetingCode(code)) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  const auth = await getParticipantAuth(code, request);
  if (!auth) return NextResponse.json({ error: "Your meeting session is invalid or expired." }, { status: 401 });

  const { data, error } = await auth.supabase.rpc("get_pending_waiting_room_entries", {
    requested_participant_key: auth.participantKey,
    requested_session_token_hash: auth.tokenHash,
    requested_meeting_code: code,
  });
  if (error) return NextResponse.json({ error: "Unable to load waiting room entries." }, { status: 400 });
  const entries = rpcRows(data).flatMap((row) => {
    const entryId = stringValue(row, "entry_id", "waiting_room_entry_id");
    const participantKey = stringValue(row, "participant_key");
    const displayName = stringValue(row, "display_name", "participant_display_name");
    const requestedAt = safeTimestamp(row, "requested_at");
    return isUuid(entryId) && participantKey && displayName && requestedAt ? [{ entryId, participantKey, displayName, requestedAt }] : [];
  });
  return NextResponse.json({ entries });
}
