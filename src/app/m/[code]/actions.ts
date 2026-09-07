"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { createSessionSecret, generateParticipantSelector, hashSessionSecret } from "@/lib/participant-session";
import { expireParticipantCredentials, resolveParticipantCredentials, writeParticipantCredentials } from "@/lib/participant-session-server";
import type { GuestJoinActionState } from "@/types/participant-session";

export type ScheduledMeetingActionState = { error: string };

export async function startScheduledMeeting(_: ScheduledMeetingActionState, formData: FormData): Promise<ScheduledMeetingActionState> {
  const meetingCode = String(formData.get("meetingCode") ?? "");
  if (!/^[a-z0-9]{10,16}$/.test(meetingCode)) return { error: "This meeting is unavailable." };
  if (!await getAuthenticatedUser()) return { error: "Sign in to start this meeting." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Unable to start this meeting." };
  const { data, error } = await supabase.rpc("start_scheduled_meeting", { requested_public_code: meetingCode });
  if (error || data !== true) return { error: "This meeting cannot be started yet." };
  revalidatePath(`/m/${meetingCode}`);
  revalidatePath("/dashboard");
  redirect(`/m/${meetingCode}`);
}

export async function joinMeeting(_: GuestJoinActionState, formData: FormData): Promise<GuestJoinActionState> {
  const meetingCode = String(formData.get("meetingCode") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!/^[a-z0-9]{10,16}$/.test(meetingCode)) return { error: "This meeting link is invalid." };
  if (!displayName) return { error: "Enter your name to continue." };
  if (displayName.length > 80) return { error: "Your name must be 80 characters or fewer." };
  const joinIntent = formData.get("joinIntent") === "new_participant" ? "new_participant" : "resume";
  const suppliedSelector = formData.get("participantSelector");

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Unable to join the meeting. Please try again." };

  const { data: meetingData, error: meetingError } = await supabase.rpc("get_public_meeting_by_code", { meeting_code: meetingCode }).maybeSingle();
  const meetingStatus = meetingData && typeof meetingData === "object" ? (meetingData as { status?: unknown }).status : null;
  if (meetingError || meetingStatus !== "active") return { error: "This meeting is not available to join." };

  const existing = joinIntent === "resume" ? await resolveParticipantCredentials(
    meetingCode,
    suppliedSelector === null ? undefined : typeof suppliedSelector === "string" ? suppliedSelector : "",
  ) : null;
  if (existing) {
    const { data: resumed, error: resumeError } = await supabase.rpc("resume_participant_session", {
      requested_meeting_code: meetingCode,
      requested_participant_key: existing.participantKey,
      requested_session_token_hash: hashSessionSecret(existing.rawSecret),
    }).maybeSingle();
    const row = resumed && typeof resumed === "object" ? resumed as Record<string, unknown> : null;
    if (!resumeError && row && typeof row.session_id === "string" &&
      typeof row.meeting_id === "string" && typeof row.participant_key === "string" &&
      typeof row.display_name === "string" &&
      (row.status === "joined" || row.status === "lobby")) {
      const resumedSelector = existing.selector ?? generateParticipantSelector();
      if (!existing.selector) {
        await writeParticipantCredentials(resumedSelector, {
          meetingCode,
          participantKey: existing.participantKey,
          secret: existing.rawSecret,
        });
      }
      redirect(`/m/${meetingCode}?participant=${resumedSelector}`);
    }
    if (existing.selector) await expireParticipantCredentials(existing.selector);
  }

  const { rawSecret, tokenHash } = createSessionSecret();
  const { data: session, error } = await supabase.rpc("create_participant_session", {
    meeting_code: meetingCode,
    requested_display_name: displayName,
    requested_session_token_hash: tokenHash,
  }).maybeSingle();
  if (error || !session) return { error: "Unable to join the meeting. Please try again." };

  const newSelector = generateParticipantSelector();
  await writeParticipantCredentials(newSelector, {
    meetingCode,
    participantKey: (session as { participant_key: string }).participant_key,
    secret: rawSecret,
  });

  redirect(`/m/${meetingCode}?participant=${newSelector}`);
}
