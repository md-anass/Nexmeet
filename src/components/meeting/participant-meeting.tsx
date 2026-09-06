"use client";

import { useEffect, useRef, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer, StartAudio, useLocalParticipant, useParticipants, useRoomContext, useTracks } from "@livekit/components-react";
import { RoomEvent, Track } from "livekit-client";
import { NexMeetBrand } from "@/components/brand/nexmeet-brand";
import { MeetingControls } from "@/components/meeting/meeting-controls";
import { MeetingStage } from "@/components/meeting/meeting-stage";
import { MeetingTopBar } from "@/components/meeting/meeting-top-bar";
import { ParticipantsPanel } from "@/components/meeting/participants-panel";
import { NexMeetMeetingLoader } from "@/components/meeting/nexmeet-meeting-loader";
import { PrejoinMediaPreview, type PrejoinMediaHandle } from "@/components/meeting/prejoin-media-preview";

type ParticipantMeetingProps = { meetingCode: string; meetingTitle: string; displayName: string; autoReconnect?: boolean; isHost?: boolean; shareLink?: string };
type TokenResponse = { token: string; serverUrl: string };

export function ParticipantMeeting({ meetingCode, meetingTitle, displayName, autoReconnect = false, isHost = false, shareLink = "" }: ParticipantMeetingProps) {
  const prejoinRef = useRef<PrejoinMediaHandle>(null);
  const [tokenResponse, setTokenResponse] = useState<TokenResponse | null>(null);
  const [mediaChoices, setMediaChoices] = useState({ cameraEnabled: true, microphoneEnabled: true });
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [left, setLeft] = useState(false);
  const reconnectAttempted = useRef(false);

  useEffect(() => {
    if (!autoReconnect || reconnectAttempted.current) return;
    reconnectAttempted.current = true;
    void startMeeting();
  }, [autoReconnect]);

  async function startMeeting() {
    if (joining) return;
    setJoining(true);
    setJoinError("");
    try {
      const response = await fetch(`/api/meetings/${meetingCode}/livekit-token`, { method: "POST" });
      if (!response.ok) {
        if (process.env.NODE_ENV === "development") console.warn(`[NexMeet LiveKit] token request failed status=${response.status} category=token_endpoint`);
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

  if (!tokenResponse) {
    if (autoReconnect && !joinError) return <NexMeetMeetingLoader label="Reconnecting to your meeting..." />;
    return <>
      <div className="min-h-[100dvh] bg-[#020817] px-5 py-8 text-white sm:px-10"><NexMeetBrand className="mx-auto max-w-lg" /><div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-10"><p className="text-sm font-medium text-cyan-300">Meeting lobby</p><p className="mt-2 text-2xl font-semibold">{meetingTitle}</p><p className="mt-1 text-sm text-slate-400">{displayName} · Ready to join</p>
      <PrejoinMediaPreview ref={prejoinRef} displayName={displayName} />
      {joinError && <p role="alert" className="mt-4 rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-200">{joinError}</p>}
      <button type="button" onClick={() => void startMeeting()} disabled={joining} className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-slate-950 hover:from-cyan-300 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60">{joining ? "Starting meeting..." : autoReconnect ? "Retry connection" : "Join meeting"}</button></div></div>
    </>;
  }

  return <LiveKitRoom token={tokenResponse.token} serverUrl={tokenResponse.serverUrl} connect audio={mediaChoices.microphoneEnabled} video={mediaChoices.cameraEnabled} onConnected={() => { void markParticipantStatus(meetingCode, "joined"); }} onError={(error) => { if (process.env.NODE_ENV === "development") console.warn(`[NexMeet LiveKit] connection error name=${error.name} message=${error.message}`); setJoinError("We could not connect you to the meeting."); }}>
    <LiveMeetingRoom meetingTitle={meetingTitle} displayName={displayName} meetingCode={meetingCode} isHost={isHost} shareLink={shareLink} onLeft={() => setLeft(true)} />
  </LiveKitRoom>;
}

async function markParticipantStatus(meetingCode: string, status: "joined" | "left") {
  await fetch(`/api/meetings/${meetingCode}/participant-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

function LiveMeetingRoom({ meetingTitle, displayName, meetingCode, isHost, shareLink, onLeft }: { meetingTitle: string; displayName: string; meetingCode: string; isHost: boolean; shareLink: string; onLeft: () => void }) {
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
  const screenShareSupported = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getDisplayMedia);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const logConnectionState = async () => {
      const roomFingerprint = await fingerprint(room.name);
      const participantFingerprint = await fingerprint(localParticipant.identity);
      console.log(`[NexMeet LiveKit] connectionState=${room.state} roomFingerprint=${roomFingerprint} localParticipantFingerprint=${participantFingerprint} remoteParticipantCount=${room.remoteParticipants.size}`);
    };
    const handleParticipantConnected = () => console.log("[NexMeet LiveKit] remote participant connected");
    const handleParticipantDisconnected = () => console.log("[NexMeet LiveKit] remote participant disconnected");
    const handleRoomConnected = () => { void logConnectionState(); };

    void logConnectionState();
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    room.on(RoomEvent.Connected, handleRoomConnected);
    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.off(RoomEvent.Connected, handleRoomConnected);
    };
  }, [localParticipant.identity, room]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    void fingerprint(room.name).then((roomFingerprint) => {
      console.log(`[NexMeet LiveKit] roomFingerprint=${roomFingerprint} remoteParticipantCount=${remoteParticipants.length}`);
    });
  }, [remoteParticipants.length, room]);

  async function leaveMeeting() {
    if (leaving) return;
    setLeaving(true);
    for (const publication of room.localParticipant.trackPublications.values()) {
      if (publication.track) await room.localParticipant.unpublishTrack(publication.track, true);
    }
    await room.disconnect();
    await markParticipantStatus(meetingCode, "left");
    onLeft();
  }

  async function toggleScreenShare() {
    if (screenSharePending || !screenShareSupported) return;
    setScreenSharePending(true);
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled, {
        audio: true,
        systemAudio: "include",
      });
      if (process.env.NODE_ENV === "development" && !isScreenShareEnabled) {
        console.log(`[NexMeet ScreenShare] videoPublication=${Boolean(localParticipant.getTrackPublication(Track.Source.ScreenShare))} audioPublication=${Boolean(localParticipant.getTrackPublication(Track.Source.ScreenShareAudio))}`);
      }
    } catch {
      // Picker cancellation and unavailable capture devices are non-fatal.
    } finally {
      setScreenSharePending(false);
    }
  }

  return <div className="isolate min-h-[100dvh] overflow-hidden bg-[#020817] text-white"><MeetingTopBar title={meetingTitle} shareLink={shareLink} participantCount={participants.length} /><main className="flex min-h-[calc(100dvh-4rem)] flex-col px-3 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-4 sm:px-7 sm:pb-32 sm:pt-6"><MeetingStage localParticipant={localParticipant} remoteParticipants={remoteParticipants} cameraTracks={cameraTracks} screenShareTrack={screenShareTrack} displayName={displayName} cameraEnabled={isCameraEnabled} microphoneEnabled={isMicrophoneEnabled} isHost={isHost} /></main><MeetingControls microphoneEnabled={isMicrophoneEnabled} cameraEnabled={isCameraEnabled} screenShareEnabled={isScreenShareEnabled} screenSharePending={screenSharePending} screenShareSupported={screenShareSupported} peopleOpen={peopleOpen} leaving={leaving} onToggleMicrophone={() => void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)} onToggleCamera={() => void localParticipant.setCameraEnabled(!isCameraEnabled)} onToggleScreenShare={() => void toggleScreenShare()} onTogglePeople={() => setPeopleOpen((open) => !open)} onLeave={() => void leaveMeeting()} />{peopleOpen && <ParticipantsPanel participants={participants} localParticipant={localParticipant} displayName={displayName} isHost={isHost} onClose={() => setPeopleOpen(false)} />}<StartAudio label="Enable meeting audio" className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-cyan-300/30 bg-[#081126] px-4 py-3 text-sm font-semibold text-white shadow-xl sm:bottom-24" /><RoomAudioRenderer /></div>;
}

async function fingerprint(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 12);
}
