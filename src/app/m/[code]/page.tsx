import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CopyLinkButton } from "@/components/shared/copy-link-button";
import { GuestJoinForm } from "@/components/shared/guest-join-form";
import { ParticipantMeeting } from "@/components/meeting/participant-meeting";
import { WaitingRoomGate } from "@/components/meeting/waiting-room-gate";
import { MeetingPasswordGate } from "@/components/shared/meeting-password-gate";
import { formatMeetingDuration, normalizePublicMeeting } from "@/lib/meeting-lifecycle";
import { hashSessionSecret, validateParticipantSelector } from "@/lib/participant-session";
import { resolveParticipantCredentials } from "@/lib/participant-session-server";
import { createSupabaseServerClient, getAuthenticatedUser } from "@/lib/supabase/server";
import type { ParticipantSession } from "@/types/participant-session";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { StartScheduledMeetingForm } from "@/components/shared/start-scheduled-meeting-form";
import { CancelScheduledMeetingForm } from "@/components/shared/cancel-scheduled-meeting-form";
import { ScheduledMeetingStatusWatcher } from "@/components/shared/scheduled-meeting-status-watcher";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ code: string }>; searchParams: Promise<{ participant?: string }> };
export default async function MeetingLobbyPage({ params, searchParams }: PageProps) {
  const { code } = await params;
  const { participant: suppliedSelector } = await searchParams;
  const participantSelector = validateParticipantSelector(suppliedSelector) ? suppliedSelector : null;
  if (!/^[a-z0-9]{10,16}$/.test(code)) notFound();

  const supabase = await createSupabaseServerClient();
  if (!supabase) notFound();

  const { data: meetingData, error } = await supabase.rpc("get_public_meeting_by_code", { meeting_code: code }).maybeSingle();
  const meeting = normalizePublicMeeting(meetingData);
  if (error || !meeting) notFound();

  const user = await getAuthenticatedUser();
  const { data: ownedMeeting } = user
    ? await supabase.from("meetings").select("host_user_id, started_at, access_mode").eq("public_code", code).maybeSingle()
    : { data: null };
  const isHost = Boolean(user && ownedMeeting?.host_user_id === user.id);
  const accessMode = meeting.accessMode === "approval_required" || ownedMeeting?.access_mode === "approval_required"
    ? "approval_required"
    : "everyone";
  const startedAt = meeting.startedAt ?? ownedMeeting?.started_at ?? null;
  const hostName = meeting.hostDisplayName?.trim() || "Host";
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const shareLink = host ? `${protocol}://${host}/m/${meeting.publicCode}` : `/m/${meeting.publicCode}`;

  if (meeting.status === "scheduled") {
    return (
      <main className="min-h-screen px-6 py-8 sm:px-10"><ScheduledMeetingStatusWatcher meetingCode={meeting.publicCode} /><div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col justify-center"><Link href="/" className="text-lg font-semibold tracking-tight text-slate-950">NexMeet</Link><section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-12"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">Scheduled meeting</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{meeting.title}</h1></div>{isHost && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Owner</span>}</div><p className="mt-4 text-sm text-slate-600">Hosted by {hostName}</p>{meeting.scheduledFor && <p className="mt-6 text-lg font-semibold text-slate-950"><LocalDateTime value={meeting.scheduledFor} /></p>}<p className="mt-2 text-sm text-slate-600">This meeting has not started yet.</p>{isHost && meeting.scheduledFor && <StartScheduledMeetingForm meetingCode={meeting.publicCode} scheduledFor={meeting.scheduledFor} />}<CopyLinkButton link={shareLink} />{isHost && <div className="mt-4 flex justify-end"><CancelScheduledMeetingForm publicCode={meeting.publicCode} /></div>}<p className="mt-3 text-center text-xs text-slate-500">Meeting code: <span className="font-semibold tracking-wide text-slate-700">{meeting.publicCode}</span></p></section></div></main>
    );
  }

  if (meeting.status === "cancelled") {
    return <main className="min-h-screen px-6 py-8 sm:px-10"><div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col justify-center"><Link href="/" className="text-lg font-semibold tracking-tight text-slate-950">NexMeet</Link><section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-12"><p className="text-sm font-medium text-slate-500">Meeting unavailable</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Meeting cancelled</h1><p className="mt-4 text-lg text-slate-700">{meeting.title}</p><p className="mt-2 text-sm text-slate-600">This scheduled meeting was cancelled and cannot be joined.</p><Link href="/" className="mt-8 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Return home</Link></section></div></main>;
  }

  if (meeting.status === "ended") {
    return <main className="min-h-screen px-6 py-8 sm:px-10"><div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col justify-center"><Link href="/" className="text-lg font-semibold tracking-tight text-slate-950">NexMeet</Link><section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-12"><p className="text-sm font-medium text-slate-500">Meeting unavailable</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">This meeting has ended.</h1><p className="mt-6 text-sm text-slate-500">Total duration</p><p className="mt-1 text-3xl font-semibold tabular-nums text-slate-950">{formatMeetingDuration(meeting.startedAt, meeting.endedAt) ?? "Calculating duration..."}</p><Link href="/" className="mt-8 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Return home</Link></section></div></main>;
  }

  let participantSession: ParticipantSession | null = null;
  const participantCookie = await resolveParticipantCredentials(code, suppliedSelector === undefined ? undefined : suppliedSelector);
  if (participantCookie) {
    const { data: session, error: sessionError } = await supabase.rpc("resume_participant_session", {
      requested_meeting_code: code,
      requested_participant_key: participantCookie.participantKey,
      requested_session_token_hash: hashSessionSecret(participantCookie.rawSecret),
    }).maybeSingle();
    if (!sessionError && session && (session as ParticipantSession).status !== "left") participantSession = session as ParticipantSession;
  }
  if (participantSession && participantCookie?.source === "legacy") redirect(`/api/meetings/${code}/participant-session/migrate`);

  if (participantSession) {
    const passwordVerified = participantSession.password_verified_at != null;
    if (meeting.requiresPassword && !isHost && !passwordVerified) {
      return <main className="min-h-screen px-6 py-8"><div className="mx-auto max-w-xl"><MeetingPasswordGate meetingCode={meeting.publicCode} participantSelector={participantSelector!} /></div></main>;
    }
    if (accessMode === "approval_required" && !isHost && participantSession.status !== "joined") {
      return <WaitingRoomGate meetingCode={meeting.publicCode} meetingTitle={meeting.title} displayName={participantSession.display_name} startedAt={startedAt} shareLink={shareLink} participantSelector={participantSelector!} />;
    }
    return <ParticipantMeeting meetingCode={meeting.publicCode} meetingTitle={meeting.title} displayName={participantSession.display_name} startedAt={startedAt} accessMode={accessMode} autoReconnect={participantSession.status === "joined"} isHost={isHost} shareLink={shareLink} participantSelector={participantSelector!} />;
  }

  return (
    <main className="min-h-screen px-6 py-8 sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col justify-center">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950">NexMeet</Link>
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-12">
          <>
              <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">Meeting lobby</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{meeting.title}</h1></div>{isHost && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Host</span>}</div>
              <p className="mt-4 text-sm text-slate-600">Hosted by {hostName}</p>
              <GuestJoinForm meetingCode={meeting.publicCode} approvalRequired={accessMode === "approval_required" && !isHost} creatorNewMeeting={isHost && !startedAt} requiresPassword={meeting.requiresPassword && !isHost} />
              <p className="mt-3 text-center text-xs text-slate-500">Meeting code: <span className="font-semibold tracking-wide text-slate-700">{meeting.publicCode}</span></p>
              <CopyLinkButton link={shareLink} />
            </>
        </section>
      </div>
    </main>
  );
}
