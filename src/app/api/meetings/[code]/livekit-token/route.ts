import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AccessToken } from "livekit-server-sdk";
import { decodeParticipantCookie, hashSessionSecret, PARTICIPANT_SESSION_COOKIE } from "@/lib/participant-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ code: string }> };
type ParticipantSessionRow = { session_id: string; meeting_id: string; display_name: string; status: string };
type MeetingContextRow = { meeting_id: string; room_name: string; status: string };

function failure(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

function diagnosticFailure(stage: string, status: number, message: string) {
  if (process.env.NODE_ENV === "development") console.warn(`[NexMeet LiveKit] token request failed stage=${stage} status=${status}`);
  return failure(status, message);
}

export async function POST(request: Request, { params }: RouteContext) {
  void request;
  const { code } = await params;
  if (!/^[a-z0-9]{10,16}$/.test(code)) return diagnosticFailure("meeting_code", 404, "Meeting not found.");

  const config = {
    url: process.env.LIVEKIT_URL,
    apiKey: process.env.LIVEKIT_API_KEY,
    apiSecret: process.env.LIVEKIT_API_SECRET,
  };
  if (!config.url || !config.apiKey || !config.apiSecret) return diagnosticFailure("environment", 503, "Video service is not configured.");

  const cookie = (await cookies()).get(PARTICIPANT_SESSION_COOKIE)?.value;
  const credentials = decodeParticipantCookie(cookie, code);
  if (!credentials) return diagnosticFailure("participant_cookie", 401, "Your meeting session is invalid or expired.");

  const supabase = await createSupabaseServerClient();
  if (!supabase) return diagnosticFailure("supabase_client", 503, "Unable to connect to the meeting service.");

  const tokenHash = hashSessionSecret(credentials.rawSecret);
  const { data: sessionData, error: sessionError } = await supabase.rpc("get_participant_session", {
    requested_participant_key: credentials.participantKey,
    requested_session_token_hash: tokenHash,
  }).maybeSingle();
  const session = sessionData as ParticipantSessionRow | null;
  if (sessionError || !session || session.status === "left") return diagnosticFailure("participant_session", 401, "Your meeting session is invalid or expired.");

  const { data: contextData, error: contextError } = await supabase.rpc("get_participant_meeting_context", {
    requested_participant_key: credentials.participantKey,
    requested_session_token_hash: tokenHash,
    requested_meeting_code: code,
  }).maybeSingle();
  const context = contextData as MeetingContextRow | null;
  if (contextError || !context || context.status !== "active" || context.meeting_id !== session.meeting_id) {
    return diagnosticFailure("meeting_context", 404, "This meeting is no longer available.");
  }

  const accessToken = new AccessToken(config.apiKey, config.apiSecret, {
    identity: credentials.participantKey,
    name: session.display_name,
    ttl: "10m",
  });
  accessToken.addGrant({ roomJoin: true, room: context.room_name, canPublish: true, canSubscribe: true });

  try {
    const token = await accessToken.toJwt();
    if (process.env.NODE_ENV === "development") {
      const roomFingerprint = createHash("sha256").update(context.room_name, "utf8").digest("hex").slice(0, 12);
      const participantFingerprint = createHash("sha256").update(credentials.participantKey, "utf8").digest("hex").slice(0, 12);
      console.log(`[NexMeet LiveKit] meetingCode=${code} roomFingerprint=${roomFingerprint} participantFingerprint=${participantFingerprint} tokenIssued=yes`);
    }
    return NextResponse.json({ token, serverUrl: config.url });
  } catch {
    return diagnosticFailure("token_generation", 500, "Unable to start the meeting.");
  }
}
