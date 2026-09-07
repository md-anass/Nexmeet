import { createHash, randomBytes } from "node:crypto";

export const PARTICIPANT_SESSION_COOKIE = "nexmeet_participant_session";
export const PARTICIPANT_SESSION_MAX_AGE = 60 * 60 * 12;
export const PARTICIPANT_SELECTOR_HEADER = "x-nexmeet-participant-selector";
const PARTICIPANT_SELECTOR_PATTERN = /^[a-f0-9]{32}$/;

type ParticipantCookiePayload = {
  meetingCode: string;
  participantKey: string;
  secret: string;
  issuedAt?: number;
};

export function createSessionSecret() {
  const rawSecret = randomBytes(32).toString("hex");
  return { rawSecret, tokenHash: hashSessionSecret(rawSecret) };
}

export function generateParticipantSelector() {
  return randomBytes(16).toString("hex");
}

export function validateParticipantSelector(value: unknown): value is string {
  return typeof value === "string" && PARTICIPANT_SELECTOR_PATTERN.test(value);
}

export function getParticipantCookieName(selector: string) {
  if (!validateParticipantSelector(selector)) throw new Error("Invalid participant selector.");
  return `${PARTICIPANT_SESSION_COOKIE}_${selector}`;
}

export function hashSessionSecret(rawSecret: string) {
  return createHash("sha256").update(rawSecret, "utf8").digest("hex");
}

export function encodeParticipantCookie(payload: ParticipantCookiePayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeParticipantCookie(value: string | undefined, meetingCode: string) {
  if (!value) return null;

  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<ParticipantCookiePayload>;
    if (
      payload.meetingCode !== meetingCode ||
      typeof payload.participantKey !== "string" ||
      payload.participantKey.length === 0 ||
      typeof payload.secret !== "string" ||
      !/^[a-f0-9]{64}$/.test(payload.secret)
    ) {
      return null;
    }
    return {
      participantKey: payload.participantKey,
      rawSecret: payload.secret,
      issuedAt: typeof payload.issuedAt === "number" && Number.isFinite(payload.issuedAt) ? payload.issuedAt : null,
    };
  } catch {
    return null;
  }
}

export function getParticipantCookieIssuedAt(value: string) {
  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<ParticipantCookiePayload>;
    return typeof payload.issuedAt === "number" && Number.isFinite(payload.issuedAt) ? payload.issuedAt : 0;
  } catch {
    return 0;
  }
}
