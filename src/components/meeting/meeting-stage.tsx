import { VideoTrack } from "@livekit/components-react";
import type { TrackReference } from "@livekit/components-react";
import type { LocalParticipant, Participant } from "livekit-client";
import { ParticipantTile } from "@/components/meeting/participant-tile";

type MeetingStageProps = { localParticipant: LocalParticipant; remoteParticipants: Participant[]; cameraTracks: TrackReference[]; screenShareTrack?: TrackReference; displayName: string; cameraEnabled: boolean; microphoneEnabled: boolean; isHost: boolean };

export function MeetingStage({ localParticipant, remoteParticipants, cameraTracks, screenShareTrack, displayName, cameraEnabled, microphoneEnabled, isHost }: MeetingStageProps) {
  const localTrack = cameraTracks.find((track) => track.participant.identity === localParticipant.identity);
  const stageClass = screenShareTrack ? "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2 lg:flex-row lg:overflow-visible" : "flex min-h-0 flex-1 overflow-y-auto pb-2";
  const participantCount = remoteParticipants.length + 1;
  const normalGridClass = participantCount === 1
    ? "mx-auto grid w-full max-w-4xl content-center"
    : participantCount === 2
      ? "grid w-full content-center sm:grid-cols-2"
      : participantCount === 4
        ? "grid w-full content-center sm:grid-cols-2"
        : "grid w-full content-center sm:grid-cols-2 xl:grid-cols-3";

  return <div className={stageClass}>
    {screenShareTrack && <div className="relative aspect-video min-h-0 w-full flex-none overflow-hidden rounded-2xl border border-white/10 bg-[#0b1224] shadow-2xl shadow-black/20 lg:aspect-auto lg:min-h-[40vh] lg:flex-1"><VideoTrack trackRef={screenShareTrack} className="size-full object-contain" /><span className="absolute bottom-3 left-3 rounded-lg bg-[#020817]/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">{screenShareTrack.participant.name || "Screen share"}</span></div>}
    <div className={screenShareTrack ? "flex max-w-full gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 lg:w-72 lg:grid-cols-1 lg:overflow-visible" : normalGridClass}>
      <ParticipantTile participant={localParticipant} track={localTrack} displayName={displayName} isLocal cameraEnabled={cameraEnabled} microphoneEnabled={microphoneEnabled} isHost={isHost} className={screenShareTrack ? "min-w-[220px] flex-none lg:min-w-0" : ""} />
      {remoteParticipants.map((participant) => <ParticipantTile key={participant.identity} participant={participant} track={cameraTracks.find((track) => track.participant.identity === participant.identity)} displayName={participant.name || "Participant"} cameraEnabled={Boolean(cameraTracks.some((track) => track.participant.identity === participant.identity))} microphoneEnabled={participant.isMicrophoneEnabled} className={screenShareTrack ? "min-w-[220px] flex-none lg:min-w-0" : ""} />)}
      {remoteParticipants.length === 0 && <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-5 text-center text-sm text-slate-400">Waiting for another participant...</div>}
    </div>
  </div>;
}
