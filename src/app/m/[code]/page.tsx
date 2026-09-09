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
import { NexMeetLogo } from "@/components/brand/nexmeet-logo";
import { Globe2, ShieldCheck, Sparkles } from "lucide-react";
import styles from "./meeting-lobby.module.css";

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
  const { data: ownerResult, error: ownerError } = user
    ? await supabase.rpc("is_meeting_owner", { requested_public_code: code })
    : { data: false, error: null };
  const isHost = Boolean(user && !ownerError && ownerResult === true);
  const accessMode = meeting.accessMode;
  const startedAt = meeting.startedAt;
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
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.brand} aria-label="NexMeet home"><NexMeetLogo size={48} /></Link>
        <div className={styles.content}>
          <section className={styles.intro}>
            <p className={styles.eyebrow}><Sparkles aria-hidden="true" />Your meeting is ready</p>
            <h1 className={styles.title}>Meet with clarity.<span>Connect with ease.</span></h1>
            <p className={styles.description}>{isHost ? "Add your name and start the room when you’re ready. Your guests can join from the link you shared." : "Add your name to enter the meeting lobby. You’ll get a chance to prepare your camera and microphone before joining."}</p>
            <div className={styles.facts} aria-label="Meeting benefits">
              <span className={styles.fact}><Globe2 aria-hidden="true" />Browser based</span>
              <span className={styles.fact}><ShieldCheck aria-hidden="true" />Secure access</span>
            </div>
          </section>
          <div className={styles.panelWrap}>
            <section className={styles.panel} aria-labelledby="meeting-lobby-title">
              <div className={styles.panelTop}>
                <div><p className={styles.panelLabel}>Meeting lobby</p><h2 id="meeting-lobby-title" className={styles.meetingTitle}>{meeting.title}</h2><p className={styles.host}>Hosted by <strong>{hostName}</strong></p></div>
                {isHost && <span className={styles.badge}>Host</span>}
              </div>
              <GuestJoinForm meetingCode={meeting.publicCode} approvalRequired={accessMode === "approval_required" && !isHost} creatorNewMeeting={isHost && !startedAt} requiresPassword={meeting.requiresPassword && !isHost} />
              <div className={styles.share}>
                <div className={styles.shareHeader}><span>Invite link</span><code className={styles.code}>{meeting.publicCode}</code></div>
                <CopyLinkButton link={shareLink} variant="lobby" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
