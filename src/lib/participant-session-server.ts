import "server-only";

import { cookies } from "next/headers";
import {
  decodeParticipantCookie,
  encodeParticipantCookie,
  getParticipantCookieIssuedAt,
  getParticipantCookieName,
  PARTICIPANT_SESSION_COOKIE,
  PARTICIPANT_SESSION_MAX_AGE,
  validateParticipantSelector,
} from "@/lib/participant-session";

export type ParticipantCredentialSource = "selector" | "legacy";
const MAX_SELECTOR_COOKIES = 12;

function selectorFromCookieName(name: string) {
  const prefix = `${PARTICIPANT_SESSION_COOKIE}_`;
  const selector = name.startsWith(prefix) ? name.slice(prefix.length) : null;
  return validateParticipantSelector(selector) ? selector : null;
}

export async function resolveParticipantCredentials(code: string, selector?: string | null, expireInvalid = false) {
  const cookieStore = await cookies();
  if (selector !== undefined && selector !== null) {
    if (!validateParticipantSelector(selector)) return null;
    const credentials = decodeParticipantCookie(cookieStore.get(getParticipantCookieName(selector))?.value, code);
    if (!credentials && expireInvalid) cookieStore.delete(getParticipantCookieName(selector));
    return credentials ? { ...credentials, selector, source: "selector" as const } : null;
  }

  const credentials = decodeParticipantCookie(cookieStore.get(PARTICIPANT_SESSION_COOKIE)?.value, code);
  return credentials ? { ...credentials, selector: null, source: "legacy" as const } : null;
}

export async function writeParticipantCredentials(selector: string, payload: { meetingCode: string; participantKey: string; secret: string }) {
  const cookieStore = await cookies();
  const selectorCookies = cookieStore.getAll()
    .flatMap((cookie) => {
      const existingSelector = selectorFromCookieName(cookie.name);
      if (!existingSelector || existingSelector === selector) return [];
      return [{ name: cookie.name, issuedAt: getParticipantCookieIssuedAt(cookie.value) }];
    })
    .sort((a, b) => b.issuedAt - a.issuedAt);
  for (const cookie of selectorCookies.slice(MAX_SELECTOR_COOKIES - 1)) cookieStore.delete(cookie.name);

  cookieStore.set(getParticipantCookieName(selector), encodeParticipantCookie({ ...payload, issuedAt: Date.now() }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PARTICIPANT_SESSION_MAX_AGE,
  });
}

export async function expireLegacyParticipantCookie() {
  (await cookies()).delete(PARTICIPANT_SESSION_COOKIE);
}

export async function expireParticipantCredentials(selector: string) {
  if (validateParticipantSelector(selector)) (await cookies()).delete(getParticipantCookieName(selector));
}

export function participantSelectorFromRequest(request: Request) {
  const value = request.headers.get("x-nexmeet-participant-selector");
  return validateParticipantSelector(value) ? value : null;
}
