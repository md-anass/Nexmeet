import { cookies } from "next/headers";
import { decodeParticipantCookie, hashSessionSecret, PARTICIPANT_SESSION_COOKIE } from "@/lib/participant-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ParticipantAuth = {
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
  participantKey: string;
  tokenHash: string;
};

export function isValidMeetingCode(code: string) {
  return /^[a-z0-9]{10,16}$/.test(code);
}

export async function getParticipantAuth(code: string): Promise<ParticipantAuth | null> {
  const supabase = await createSupabaseServerClient();
  const cookieValue = (await cookies()).get(PARTICIPANT_SESSION_COOKIE)?.value;
  const credentials = decodeParticipantCookie(cookieValue, code);
  if (!supabase || !credentials) return null;
  return { supabase, participantKey: credentials.participantKey, tokenHash: hashSessionSecret(credentials.rawSecret) };
}

export function firstRpcRow(value: unknown): Record<string, unknown> | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && typeof candidate === "object" ? candidate as Record<string, unknown> : null;
}

export function rpcRows(value: unknown) {
  const rows = Array.isArray(value) ? value : value && typeof value === "object" ? [value] : [];
  return rows.filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object"));
}

export function stringValue(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (typeof row[key] === "string") return row[key];
  }
  return null;
}

export function booleanValue(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (typeof row[key] === "boolean") return row[key];
    if (row[key] === "true") return true;
    if (row[key] === "false") return false;
  }
  return null;
}

export function safeTimestamp(row: Record<string, unknown>, ...keys: string[]) {
  const value = stringValue(row, ...keys);
  return value && Number.isFinite(Date.parse(value)) ? value : null;
}

export function isUuid(value: string | null): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}
