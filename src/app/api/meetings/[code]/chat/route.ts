import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeParticipantCookie, hashSessionSecret, PARTICIPANT_SESSION_COOKIE } from "@/lib/participant-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ code: string }> };
type ChatRow = {
  message_id?: unknown;
  sender_participant_key?: unknown;
  sender_display_name?: unknown;
  recipient_participant_key?: unknown;
  recipient_display_name?: unknown;
  is_private?: unknown;
  message?: unknown;
  created_at?: unknown;
};

function validCode(code: string) {
  return /^[a-z0-9]{10,16}$/.test(code);
}

function normalizeRows(value: unknown) {
  const rows = Array.isArray(value) ? value : value && typeof value === "object" ? [value] : [];
  return rows.flatMap((value) => {
    const row = value as ChatRow;
    if (
      typeof row.message_id !== "string" ||
      typeof row.sender_participant_key !== "string" ||
      typeof row.sender_display_name !== "string" ||
      typeof row.message !== "string" ||
      typeof row.created_at !== "string" ||
      typeof row.is_private !== "boolean"
    ) return [];
    return [{
      messageId: row.message_id,
      senderParticipantKey: row.sender_participant_key,
      senderDisplayName: row.sender_display_name,
      recipientParticipantKey: typeof row.recipient_participant_key === "string" ? row.recipient_participant_key : null,
      recipientDisplayName: typeof row.recipient_display_name === "string" ? row.recipient_display_name : null,
      isPrivate: row.is_private,
      message: row.message,
      createdAt: row.created_at,
    }];
  });
}

async function getCredentials(code: string) {
  const supabase = await createSupabaseServerClient();
  const credentials = decodeParticipantCookie((await cookies()).get(PARTICIPANT_SESSION_COOKIE)?.value, code);
  if (!supabase || !credentials) return null;
  return { supabase, credentials, tokenHash: hashSessionSecret(credentials.rawSecret) };
}

export async function GET(_: Request, { params }: RouteContext) {
  const { code } = await params;
  if (!validCode(code)) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  const auth = await getCredentials(code);
  if (!auth) return NextResponse.json({ error: "Your meeting session is invalid or expired." }, { status: 401 });

  const { data, error } = await auth.supabase.rpc("get_chat_messages", {
    requested_participant_key: auth.credentials.participantKey,
    requested_session_token_hash: auth.tokenHash,
    requested_meeting_code: code,
  });
  if (error) return NextResponse.json({ error: "Unable to load chat messages." }, { status: 400 });
  return NextResponse.json({ messages: normalizeRows(data) });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { code } = await params;
  if (!validCode(code)) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  const auth = await getCredentials(code);
  if (!auth) return NextResponse.json({ error: "Your meeting session is invalid or expired." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }
  const payload = body && typeof body === "object" ? body as { message?: unknown; recipientParticipantKey?: unknown } : {};
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const recipient = payload.recipientParticipantKey === null || payload.recipientParticipantKey === undefined
    ? null
    : typeof payload.recipientParticipantKey === "string" ? payload.recipientParticipantKey : undefined;
  if (!message) return NextResponse.json({ error: "Enter a message." }, { status: 400 });
  if (message.length > 2000) return NextResponse.json({ error: "Messages must be 2000 characters or fewer." }, { status: 400 });
  if (recipient === undefined || recipient === auth.credentials.participantKey) return NextResponse.json({ error: "That recipient is not available." }, { status: 400 });

  const { error } = await auth.supabase.rpc("send_chat_message", {
    requested_participant_key: auth.credentials.participantKey,
    requested_session_token_hash: auth.tokenHash,
    requested_meeting_code: code,
    requested_message: message,
    requested_recipient_participant_key: recipient,
  });
  if (error) return NextResponse.json({ error: "Unable to send this message." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
