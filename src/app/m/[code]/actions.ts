"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSessionSecret, encodeParticipantCookie, PARTICIPANT_SESSION_COOKIE, PARTICIPANT_SESSION_MAX_AGE } from "@/lib/participant-session";
import type { GuestJoinActionState } from "@/types/participant-session";

export async function joinMeeting(_: GuestJoinActionState, formData: FormData): Promise<GuestJoinActionState> {
  const meetingCode = String(formData.get("meetingCode") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!/^[a-z0-9]{10,16}$/.test(meetingCode)) return { error: "This meeting link is invalid." };
  if (!displayName) return { error: "Enter your name to continue." };
  if (displayName.length > 80) return { error: "Your name must be 80 characters or fewer." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Unable to join the meeting. Please try again." };

  const { rawSecret, tokenHash } = createSessionSecret();
  const { data: session, error } = await supabase.rpc("create_participant_session", {
    meeting_code: meetingCode,
    requested_display_name: displayName,
    requested_session_token_hash: tokenHash,
  }).maybeSingle();
  if (error || !session) return { error: "Unable to join the meeting. Please try again." };

  const cookieStore = await cookies();
  cookieStore.set(PARTICIPANT_SESSION_COOKIE, encodeParticipantCookie({
    meetingCode,
    participantKey: (session as { participant_key: string }).participant_key,
    secret: rawSecret,
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PARTICIPANT_SESSION_MAX_AGE,
  });

  redirect(`/m/${meetingCode}`);
}
