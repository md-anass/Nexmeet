import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { CopyLinkButton } from "@/components/shared/copy-link-button";
import { GuestJoinForm } from "@/components/shared/guest-join-form";
import { ParticipantMeeting } from "@/components/meeting/participant-meeting";
import { formatMeetingDuration, normalizePublicMeeting } from "@/lib/meeting-lifecycle";
import { decodeParticipantCookie, hashSessionSecret, PARTICIPANT_SESSION_COOKIE } from "@/lib/participant-session";
import { createSupabaseServerClient, getAuthenticatedUser } from "@/lib/supabase/server";
import type { ParticipantSession } from "@/types/participant-session";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ code: string }> };
export default async function MeetingLobbyPage({ params }: PageProps) {
  const { code } = await params;
  if (!/^[a-z0-9]{10,16}$/.test(code)) notFound();

  const supabase = await createSupabaseServerClient();
  if (!supabase) notFound();

  const { data: meetingData, error } = await supabase.rpc("get_public_meeting_by_code", { meeting_code: code }).maybeSingle();
  const meeting = normalizePublicMeeting(meetingData);
  if (error || !meeting) notFound();

  const user = await getAuthenticatedUser();
  const { data: ownedMeeting } = user
    ? await supabase.from("meetings").select("host_user_id, started_at").eq("public_code", code).maybeSingle()
    : { data: null };
  const isHost = Boolean(user && ownedMeeting?.host_user_id === user.id);
  const startedAt = meeting.startedAt ?? ownedMeeting?.started_at ?? null;
  const hostName = meeting.hostDisplayName?.trim() || "Host";
  let participantSession: ParticipantSession | null = null;
  const cookieValue = (await cookies()).get(PARTICIPANT_SESSION_COOKIE)?.value;
  const participantCookie = decodeParticipantCookie(cookieValue, code);
  if (participantCookie) {
    const { data: session, error: sessionError } = await supabase.rpc("get_participant_session", {
      requested_participant_key: participantCookie.participantKey,
      requested_session_token_hash: hashSessionSecret(participantCookie.rawSecret),
    }).maybeSingle();
    if (!sessionError && session && (session as ParticipantSession).status !== "left") participantSession = session as ParticipantSession;
  }
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const shareLink = host ? `${protocol}://${host}/m/${meeting.publicCode}` : `/m/${meeting.publicCode}`;

  if (meeting.status === "active" && participantSession) {
    return <ParticipantMeeting meetingCode={meeting.publicCode} meetingTitle={meeting.title} displayName={participantSession.display_name} startedAt={startedAt} autoReconnect={participantSession.status === "joined"} isHost={isHost} shareLink={shareLink} />;
  }

  return (
    <main className="min-h-screen px-6 py-8 sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col justify-center">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950">NexMeet</Link>
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-12">
          {meeting.status === "ended" ? (
            <><p className="text-sm font-medium text-slate-500">Meeting unavailable</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">This meeting has ended.</h1><p className="mt-6 text-sm text-slate-500">Total duration</p><p className="mt-1 text-3xl font-semibold tabular-nums text-slate-950">{formatMeetingDuration(meeting.startedAt, meeting.endedAt) ?? "Calculating duration..."}</p><Link href="/" className="mt-8 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Return home</Link></>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">Meeting lobby</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{meeting.title}</h1></div>{isHost && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Host</span>}</div>
              <p className="mt-4 text-sm text-slate-600">Hosted by {hostName}</p>
              {participantSession ? (
                <>
                  <p className="mt-8 text-lg font-semibold text-slate-950">{participantSession.display_name}</p>
                  <p className="mt-1 text-sm text-emerald-700">Ready to join</p>
                  <ParticipantMeeting meetingCode={meeting.publicCode} meetingTitle={meeting.title} displayName={participantSession.display_name} startedAt={startedAt} autoReconnect={participantSession.status === "joined"} />
                </>
              ) : (
                <GuestJoinForm meetingCode={meeting.publicCode} />
              )}
              <p className="mt-3 text-center text-xs text-slate-500">Meeting code: <span className="font-semibold tracking-wide text-slate-700">{meeting.publicCode}</span></p>
              <CopyLinkButton link={shareLink} />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
