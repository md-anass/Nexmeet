"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveKitRoom, RoomAudioRenderer, StartAudio, useLocalParticipant, useParticipants, useRoomContext, useTracks } from "@livekit/components-react";
import { ConnectionState, Room, RoomEvent, Track, type LocalParticipant, type Participant, type RoomEventCallbacks } from "livekit-client";
import { NexMeetBrand } from "@/components/brand/nexmeet-brand";
import { NexMeetLogo } from "@/components/brand/nexmeet-logo";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { MeetingControls } from "@/components/meeting/meeting-controls";
import { MeetingStage } from "@/components/meeting/meeting-stage";
import { MeetingTopBar } from "@/components/meeting/meeting-top-bar";
import { ParticipantsPanel } from "@/components/meeting/participants-panel";
import { ChatPanel } from "@/components/meeting/chat-panel";
import { NexMeetMeetingLoader } from "@/components/meeting/nexmeet-meeting-loader";
import { PrejoinMediaPreview, type PrejoinMediaHandle } from "@/components/meeting/prejoin-media-preview";
import { WaitingRoomHostPanel, type PendingWaitingRoomEntry } from "@/components/meeting/waiting-room-host-panel";
import { formatMeetingDuration } from "@/lib/meeting-lifecycle";
import { readMediaPreferences, writeMediaPreferences } from "@/lib/media-preferences";
import { HAND_RAISED_ATTRIBUTE, isReactionType, REACTION_TOPIC, type ReactionType } from "@/components/meeting/meeting-ephemeral";
import prejoinStyles from "./prejoin-lobby.module.css";

type ParticipantMeetingProps = { meetingCode: string; meetingTitle: string; displayName: string; startedAt: string | null; participantSelector: string; accessMode?: "everyone" | "approval_required"; autoReconnect?: boolean; autoJoin?: boolean; isHost?: boolean; shareLink?: string };
type TokenResponse = { token: string; serverUrl: string };
type MeetingEndedStatus = { status: "ended"; startedAt: string | null; endedAt: string | null };

export function ParticipantMeeting({ meetingCode, meetingTitle, displayName, startedAt, participantSelector, accessMode = "everyone", autoReconnect = false, autoJoin = false, isHost = false, shareLink = "" }: ParticipantMeetingProps) {
  const prejoinRef = useRef<PrejoinMediaHandle>(null);
  const [tokenResponse, setTokenResponse] = useState<TokenResponse | null>(null);
  const [mediaChoices, setMediaChoices] = useState(() => readMediaPreferences(meetingCode));
  const [authoritativeStartedAt, setAuthoritativeStartedAt] = useState(startedAt);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [left, setLeft] = useState(false);
  const [endedStatus, setEndedStatus] = useState<MeetingEndedStatus | null>(null);
  const reconnectAttempted = useRef(false);

  useEffect(() => {
    if ((!autoReconnect && !autoJoin) || reconnectAttempted.current) return;
    reconnectAttempted.current = true;
    void startMeeting();
  }, [autoReconnect, autoJoin]);

  async function startMeeting() {
    if (joining) return;
    setJoining(true);
    setJoinError("");
    try {
      const response = await fetch(`/api/meetings/${meetingCode}/livekit-token`, { method: "POST", headers: { "x-nexmeet-participant-selector": participantSelector } });
      if (!response.ok) {
        throw new Error("token_request_failed");
      }
      const nextToken = (await response.json()) as TokenResponse;
      if (!nextToken.token || !nextToken.serverUrl) throw new Error("invalid_token_response");
      setMediaChoices(prejoinRef.current?.getState() ?? mediaChoices);
      prejoinRef.current?.stop();
      setTokenResponse(nextToken);
    } catch {
      setJoinError("Unable to join the meeting. Please try again.");
    } finally {
      setJoining(false);
    }
  }

  if (left) {
    return <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center"><p className="font-semibold text-slate-950">You left the meeting.</p><button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Return to lobby</button></div>;
  }

  if (endedStatus) return <MeetingEndedScreen meetingTitle={meetingTitle} startedAt={endedStatus.startedAt ?? authoritativeStartedAt} endedAt={endedStatus.endedAt} />;

  if (!tokenResponse) {
    if ((autoReconnect || autoJoin) && !joinError) return <NexMeetMeetingLoader label={autoReconnect ? "Reconnecting to your meeting..." : "Joining your meeting..."} />;
    const initials = displayName.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "N";
    return <main className={prejoinStyles.page}>
      <div className={prejoinStyles.shell}>
        <header className={prejoinStyles.header}><NexMeetLogo size={48} className={prejoinStyles.brand} /><span className={prejoinStyles.stageLabel}>Device check</span></header>
        <div className={prejoinStyles.content}>
          <section className={prejoinStyles.intro}>
            <p className={prejoinStyles.eyebrow}>Almost there</p>
            <h1 className={prejoinStyles.title}>Look good.<span>Sound ready.</span></h1>
            <p className={prejoinStyles.copy}>Check your camera and microphone before entering. You can change both at any time once you’re in the meeting.</p>
            <div className={prejoinStyles.identity}><span className={prejoinStyles.avatar}>{initials}</span><span><strong>{displayName}</strong><small>Joining {meetingTitle}</small></span></div>
          </section>
          <div className={prejoinStyles.panelWrap}>
            <section className={prejoinStyles.panel} aria-labelledby="prejoin-meeting-title">
              <div className={prejoinStyles.panelHead}><div><p className={prejoinStyles.panelKicker}>Meeting lobby</p><h2 id="prejoin-meeting-title" className={prejoinStyles.meetingTitle}>{meetingTitle}</h2></div><span className={prejoinStyles.readyBadge}><CheckCircle2 aria-hidden="true" /><span>Ready to join</span></span></div>
              <PrejoinMediaPreview ref={prejoinRef} displayName={displayName} meetingCode={meetingCode} />
              {joinError && <p role="alert" className={prejoinStyles.error}>{joinError}</p>}
              <button type="button" onClick={() => void startMeeting()} disabled={joining} className={prejoinStyles.joinButton}><span>{joining ? (startedAt ? "Joining meeting..." : "Starting meeting...") : autoReconnect ? "Retry connection" : !startedAt && isHost ? "Start Meeting" : "Join Meeting"}</span><ArrowRight aria-hidden="true" /></button>
              <p className={prejoinStyles.privacy}><ShieldCheck aria-hidden="true" />Your device preview stays on this screen until you join.</p>
            </section>
          </div>
        </div>
      </div>
    </main>;
  }

  return <LiveKitRoom token={tokenResponse.token} serverUrl={tokenResponse.serverUrl} connect audio={mediaChoices.microphoneEnabled} video={mediaChoices.cameraEnabled} onConnected={() => { void (async () => { await markParticipantStatus(meetingCode, participantSelector, "joined"); try { const response = await fetch(`/api/meetings/${meetingCode}/meeting-status`, { cache: "no-store" }); if (!response.ok) return; const result = await response.json() as { startedAt?: unknown }; if (typeof result.startedAt === "string") setAuthoritativeStartedAt(result.startedAt); } catch { /* Keep the existing lifecycle value during a transient status failure. */ } })(); }} onError={() => { setJoinError("We could not connect you to the meeting."); }}>
    <LiveMeetingRoom meetingTitle={meetingTitle} displayName={displayName} meetingCode={meetingCode} participantSelector={participantSelector} startedAt={authoritativeStartedAt} accessMode={accessMode} shareLink={shareLink} onLeft={() => setLeft(true)} onEnded={(status) => setEndedStatus(status)} />
  </LiveKitRoom>;
}

async function markParticipantStatus(meetingCode: string, participantSelector: string, status: "joined" | "left") {
  await fetch(`/api/meetings/${meetingCode}/participant-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-nexmeet-participant-selector": participantSelector },
    body: JSON.stringify({ status }),
  });
}

function LiveMeetingRoom({ meetingTitle, displayName, meetingCode, participantSelector, startedAt, accessMode, shareLink, onLeft, onEnded }: { meetingTitle: string; displayName: string; meetingCode: string; participantSelector: string; startedAt: string | null; accessMode: "everyone" | "approval_required"; shareLink: string; onLeft: () => void; onEnded: (status: MeetingEndedStatus) => void }) {
  const room = useRoomContext();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();
  const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: false });
  const cameraTracks = tracks.filter((track) => track.source === Track.Source.Camera);
  const screenShareTrack = tracks.find((track) => track.source === Track.Source.ScreenShare);
  const remoteParticipants = participants.filter((participant) => participant.identity !== localParticipant.identity);
  const [leaving, setLeaving] = useState(false);
  const [screenSharePending, setScreenSharePending] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [leavePromptOpen, setLeavePromptOpen] = useState(false);
  const [ending, setEnding] = useState(false);
  const [hostCheckPending, setHostCheckPending] = useState(false);
  const [endError, setEndError] = useState("");
  const [currentHostParticipantKey, setCurrentHostParticipantKey] = useState<string | null>(null);
  const [pendingEntries, setPendingEntries] = useState<PendingWaitingRoomEntry[]>([]);
  const pendingPollInFlight = useRef(false);
  const [reactions, setReactions] = useState<Record<string, ReactionType>>({});
  const [handRaised, setHandRaised] = useState(() => localParticipant.attributes[HAND_RAISED_ATTRIBUTE] === "true");
  const hostPollInFlight = useRef(false);
  const meetingEnded = useRef(false);
  const reactionTimers = useRef<Record<string, number>>({});
  const lastReactionAt = useRef(0);
  const screenShareSupported = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getDisplayMedia);

  useEffect(() => {
    const handleAttributesChanged = (_changed: Record<string, string>, participant: Participant | LocalParticipant) => {
      if (participant.identity === localParticipant.identity) setHandRaised(participant.attributes[HAND_RAISED_ATTRIBUTE] === "true");
    };
    room.on(RoomEvent.ParticipantAttributesChanged, handleAttributesChanged);
    return () => { room.off(RoomEvent.ParticipantAttributesChanged, handleAttributesChanged); };
  }, [localParticipant, room]);

  const showReaction = useCallback((identity: string, reaction: ReactionType) => {
    const existingTimer = reactionTimers.current[identity];
    if (existingTimer) window.clearTimeout(existingTimer);
    setReactions((current) => ({ ...current, [identity]: reaction }));
    reactionTimers.current[identity] = window.setTimeout(() => {
      setReactions((current) => {
        const next = { ...current };
        delete next[identity];
        return next;
      });
      delete reactionTimers.current[identity];
    }, 2500);
  }, []);

  useEffect(() => {
    const handleDataReceived = (...args: Parameters<RoomEventCallbacks["dataReceived"]>) => {
      const [payload, participant, , topic] = args;
      if (!participant || topic !== REACTION_TOPIC) return;
      try {
        const value: unknown = JSON.parse(new TextDecoder().decode(payload));
        if (!value || typeof value !== "object" || !isReactionType((value as { reaction?: unknown }).reaction)) return;
        showReaction(participant.identity, (value as { reaction: ReactionType }).reaction);
      } catch {
        // Ignore malformed or unknown ephemeral payloads.
      }
    };
    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => { room.off(RoomEvent.DataReceived, handleDataReceived); };
  }, [room, showReaction]);

  async function sendReaction(reaction: ReactionType) {
    if (room.state !== ConnectionState.Connected) return;
    if (Date.now() - lastReactionAt.current < 800) return;
    lastReactionAt.current = Date.now();
    showReaction(localParticipant.identity, reaction);
    try {
      await localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: "reaction", reaction })), { topic: REACTION_TOPIC, reliable: false });
    } catch {
      // A transient data-channel failure should not affect the meeting.
    }
  }

  async function toggleHand() {
    if (room.state !== ConnectionState.Connected) return;
    const next = !handRaised;
    try {
      await localParticipant.setAttributes({ ...localParticipant.attributes, [HAND_RAISED_ATTRIBUTE]: String(next) });
      setHandRaised(next);
    } catch {
      // Keep the current state if LiveKit cannot update attributes.
    }
  }

  useEffect(() => {
    let disposed = false;

    async function refreshCurrentHost() {
      if (hostPollInFlight.current) return;
      hostPollInFlight.current = true;
      try {
        const response = await fetch(`/api/meetings/${meetingCode}/current-host`, { cache: "no-store" });
        if (!response.ok || disposed) return;
        const result = (await response.json()) as { currentHostParticipantKey?: unknown };
        setCurrentHostParticipantKey(typeof result.currentHostParticipantKey === "string" ? result.currentHostParticipantKey : null);
      } catch {
        // Keep the last known host during a temporary status-request failure.
      } finally {
        hostPollInFlight.current = false;
      }
    }

    void refreshCurrentHost();
    const interval = window.setInterval(() => void refreshCurrentHost(), 2500);
    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [meetingCode]);

  const isCurrentHost = currentHostParticipantKey === localParticipant.identity;

  useEffect(() => {
    let disposed = false;
    async function refreshPending() {
      if (accessMode !== "approval_required" || !isCurrentHost || pendingPollInFlight.current) return;
      pendingPollInFlight.current = true;
      try {
        const response = await fetch(`/api/meetings/${meetingCode}/waiting-room/pending`, { cache: "no-store", headers: { "x-nexmeet-participant-selector": participantSelector } });
        if (!response.ok || disposed) return;
        const result = (await response.json()) as { entries?: PendingWaitingRoomEntry[] };
        setPendingEntries(Array.isArray(result.entries) ? result.entries : []);
      } catch {
        // Preserve the last known requests during transient polling failures.
      } finally {
        pendingPollInFlight.current = false;
      }
    }
    void refreshPending();
    const interval = window.setInterval(() => void refreshPending(), 2000);
    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [accessMode, isCurrentHost, meetingCode]);

  async function decideWaitingRoom(entryId: string, decision: "admit" | "reject") {
    const response = await fetch(`/api/meetings/${meetingCode}/waiting-room/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-nexmeet-participant-selector": participantSelector },
      body: JSON.stringify({ entryId, decision }),
    });
    if (!response.ok) throw new Error("decision_failed");
    const result = await response.json() as { entryId?: unknown; status?: unknown };
    if (result.entryId !== entryId || result.status !== (decision === "admit" ? "admitted" : "rejected")) {
      throw new Error("invalid_decision_response");
    }
    setPendingEntries((entries) => entries.filter((entry) => entry.entryId !== entryId));
  }

  async function checkCurrentHost() {
    try {
      const response = await fetch(`/api/meetings/${meetingCode}/current-host`, { cache: "no-store" });
      if (!response.ok) return undefined;
      const result = (await response.json()) as { currentHostParticipantKey?: unknown };
      const key = typeof result.currentHostParticipantKey === "string" ? result.currentHostParticipantKey : null;
      setCurrentHostParticipantKey(key);
      return key;
    } catch {
      return undefined;
    }
  }

  useEffect(() => {
    let disposed = false;
    async function refreshMeetingStatus() {
      try {
        const response = await fetch(`/api/meetings/${meetingCode}/meeting-status`, { cache: "no-store" });
        if (!response.ok || disposed) return;
        const result = (await response.json()) as { status?: unknown; startedAt?: unknown; endedAt?: unknown };
        if (result.status !== "ended" || meetingEnded.current) return;
        meetingEnded.current = true;
        await disconnectAndStopTracks(room);
        if (!disposed) onEnded({ status: "ended", startedAt: typeof result.startedAt === "string" ? result.startedAt : startedAt, endedAt: typeof result.endedAt === "string" ? result.endedAt : null });
      } catch {
        // A transient status request failure should not interrupt the call.
      }
    }

    void refreshMeetingStatus();
    const interval = window.setInterval(() => void refreshMeetingStatus(), 2500);
    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [meetingCode, onEnded, room, startedAt]);

  async function leaveMeeting() {
    if (leaving) return;
    setLeaving(true);
    await disconnectAndStopTracks(room);
      await markParticipantStatus(meetingCode, participantSelector, "left");
    onLeft();
  }

  async function endMeeting() {
    if (ending) return;
    setEnding(true);
    setEndError("");
    try {
      const response = await fetch(`/api/meetings/${meetingCode}/end`, { method: "POST", headers: { "x-nexmeet-participant-selector": participantSelector } });
      const result = (await response.json()) as { startedAt?: unknown; endedAt?: unknown; error?: unknown };
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "end_failed");
      meetingEnded.current = true;
      await disconnectAndStopTracks(room);
      onEnded({ status: "ended", startedAt: typeof result.startedAt === "string" ? result.startedAt : startedAt, endedAt: typeof result.endedAt === "string" ? result.endedAt : null });
    } catch {
      setEndError("We could not end the meeting. Please try again.");
      setEnding(false);
    }
  }

  async function handleLeaveClick() {
    if (leaving || ending || hostCheckPending) return;
    setHostCheckPending(true);
    const latestHostKey = await checkCurrentHost();
    setHostCheckPending(false);
    const hostKey = latestHostKey === undefined ? currentHostParticipantKey : latestHostKey;
    const isCurrentHost = hostKey === localParticipant.identity;
    if (isCurrentHost) {
      setLeavePromptOpen(true);
      return;
    }
    await leaveMeeting();
  }

  async function toggleScreenShare() {
    if (screenSharePending || !screenShareSupported || room.state !== ConnectionState.Connected) return;
    setScreenSharePending(true);
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled, {
        audio: true,
        systemAudio: "include",
      });
    } catch {
      // Picker cancellation and unavailable capture devices are non-fatal.
    } finally {
      setScreenSharePending(false);
    }
  }

  async function toggleMicrophone() {
    const nextEnabled = !isMicrophoneEnabled;
    try {
      await localParticipant.setMicrophoneEnabled(nextEnabled);
      writeMediaPreferences(meetingCode, { cameraEnabled: isCameraEnabled, microphoneEnabled: nextEnabled });
    } catch {
      // Preserve the last successful preference when the device transition fails.
    }
  }

  async function toggleCamera() {
    const nextEnabled = !isCameraEnabled;
    try {
      await localParticipant.setCameraEnabled(nextEnabled);
      writeMediaPreferences(meetingCode, { cameraEnabled: nextEnabled, microphoneEnabled: isMicrophoneEnabled });
    } catch {
      // Preserve the last successful preference when the device transition fails.
    }
  }

  return <div className="isolate flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden bg-[#020817] text-white" style={{ background: "radial-gradient(circle at 14% 8%, rgba(6, 182, 212, .16), transparent 31rem), radial-gradient(circle at 86% 92%, rgba(124, 58, 237, .18), transparent 35rem), linear-gradient(145deg, #020817 0%, #061126 54%, #05071a 100%)" }}><MeetingTopBar title={meetingTitle} meetingCode={meetingCode} shareLink={shareLink} participantCount={participants.length} startedAt={startedAt} /><main className={`relative flex min-h-0 flex-1 overflow-hidden px-3 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-4 transition-[padding] duration-200 sm:px-7 sm:pb-32 sm:pt-6 ${peopleOpen || chatOpen ? "sm:pr-[25rem]" : ""}`}><MeetingStage localParticipant={localParticipant} remoteParticipants={remoteParticipants} cameraTracks={cameraTracks} screenShareTrack={screenShareTrack} displayName={displayName} cameraEnabled={isCameraEnabled} microphoneEnabled={isMicrophoneEnabled} currentHostParticipantKey={currentHostParticipantKey} reactions={reactions} /><MeetingControls microphoneEnabled={isMicrophoneEnabled} cameraEnabled={isCameraEnabled} screenShareEnabled={isScreenShareEnabled} screenSharePending={screenSharePending} screenShareSupported={screenShareSupported} peopleOpen={peopleOpen} chatOpen={chatOpen} chatUnreadCount={chatUnreadCount} handRaised={handRaised} leaving={leaving || ending || hostCheckPending} onToggleMicrophone={() => void toggleMicrophone()} onToggleCamera={() => void toggleCamera()} onToggleScreenShare={() => void toggleScreenShare()} onTogglePeople={() => { setPeopleOpen((open) => !open); setChatOpen(false); }} onToggleChat={() => { setChatOpen((open) => !open); setPeopleOpen(false); }} onToggleHand={() => void toggleHand()} onReaction={(reaction) => void sendReaction(reaction)} onLeave={() => void handleLeaveClick()} />{peopleOpen && <ParticipantsPanel participants={participants} localParticipant={localParticipant} displayName={displayName} currentHostParticipantKey={currentHostParticipantKey} onClose={() => setPeopleOpen(false)} />}<WaitingRoomHostPanel entries={isCurrentHost ? pendingEntries : []} onDecision={async (entryId, decision) => { await decideWaitingRoom(entryId, decision); }} /><ChatPanel open={chatOpen} meetingCode={meetingCode} participantSelector={participantSelector} participants={participants} localParticipant={localParticipant} onClose={() => setChatOpen(false)} onUnreadChange={setChatUnreadCount} /></main><StartAudio label="Enable meeting audio" className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-cyan-300/30 bg-[#0b152b] px-4 py-3 text-sm font-semibold text-white shadow-xl sm:bottom-24" /><RoomAudioRenderer />{leavePromptOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-5" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="leave-meeting-title" className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b152b] p-5 shadow-2xl"><h2 id="leave-meeting-title" className="text-lg font-semibold text-white">Leave meeting?</h2><p className="mt-2 text-sm text-slate-400">You are the current host.</p>{endError && <p role="alert" className="mt-3 text-sm text-red-200">{endError}</p>}<div className="mt-5 grid gap-2"><button type="button" onClick={() => { setLeavePromptOpen(false); void leaveMeeting(); }} disabled={ending || leaving} className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">Leave meeting</button><button type="button" onClick={() => void endMeeting()} disabled={ending || leaving} className="rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-400">{ending ? "Ending meeting..." : "End meeting for everyone"}</button><button type="button" onClick={() => { setLeavePromptOpen(false); setEndError(""); }} disabled={ending} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5">Cancel</button></div></div></div>}</div>;
}

async function disconnectAndStopTracks(room: Room) {
  for (const publication of room.localParticipant.trackPublications.values()) {
    if (publication.track) await room.localParticipant.unpublishTrack(publication.track, true);
  }
  await room.disconnect();
}

function MeetingEndedScreen({ meetingTitle, startedAt, endedAt }: { meetingTitle: string; startedAt: string | null; endedAt: string | null }) {
  const router = useRouter();
  return <main className="flex min-h-[100dvh] items-center justify-center bg-[#020817] px-5 py-10 text-center text-white"><div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl"><NexMeetBrand className="justify-center" /><p className="mt-8 text-sm font-medium text-cyan-300">{meetingTitle}</p><h1 className="mt-2 text-3xl font-semibold">Meeting ended</h1><p className="mt-5 text-sm text-slate-400">Total duration</p><p className="mt-1 text-3xl font-semibold tabular-nums text-white">{formatMeetingDuration(startedAt, endedAt) ?? "Calculating duration..."}</p><button type="button" onClick={() => router.push("/dashboard")} className="mt-8 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200">Return to dashboard</button></div></main>;
}
