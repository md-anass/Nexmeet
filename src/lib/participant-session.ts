import { createHash, randomBytes } from "node:crypto";

export const PARTICIPANT_SESSION_COOKIE = "nexmeet_participant_session";
export const PARTICIPANT_SESSION_MAX_AGE = 60 * 60 * 12;

type ParticipantCookiePayload = {
  meetingCode: string;
  participantKey: string;
  secret: string;
};

export function createSessionSecret() {
  const rawSecret = randomBytes(32).toString("hex");
  return { rawSecret, tokenHash: hashSessionSecret(rawSecret) };
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
    return { participantKey: payload.participantKey, rawSecret: payload.secret };
  } catch {
    return null;
  }
}
