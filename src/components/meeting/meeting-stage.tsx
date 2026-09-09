import { VideoTrack } from "@livekit/components-react";
import type { TrackReference } from "@livekit/components-react";
import type { LocalParticipant, Participant } from "livekit-client";
import { ParticipantTile } from "@/components/meeting/participant-tile";
import type { ReactionType } from "@/components/meeting/meeting-ephemeral";
import { Users } from "lucide-react";
import styles from "./meeting-stage.module.css";

type MeetingStageProps = { localParticipant: LocalParticipant; remoteParticipants: Participant[]; cameraTracks: TrackReference[]; screenShareTrack?: TrackReference; displayName: string; cameraEnabled: boolean; microphoneEnabled: boolean; currentHostParticipantKey: string | null; reactions: Record<string, ReactionType>; };

export function MeetingStage({ localParticipant, remoteParticipants, cameraTracks, screenShareTrack, displayName, cameraEnabled, microphoneEnabled, currentHostParticipantKey, reactions }: MeetingStageProps) {
  const localTrack = cameraTracks.find((track) => track.participant.identity === localParticipant.identity);
  const participantCount = remoteParticipants.length + 1;
  const tileProps = (participant: Participant | LocalParticipant, isLocal = false) => ({
    participant,
    track: cameraTracks.find((track) => track.participant.identity === participant.identity),
    displayName: isLocal ? displayName : participant.name || "Participant",
    isLocal,
    cameraEnabled: isLocal ? cameraEnabled : Boolean(cameraTracks.some((track) => track.participant.identity === participant.identity)),
    microphoneEnabled: isLocal ? microphoneEnabled : participant.isMicrophoneEnabled,
    isHost: participant.identity === currentHostParticipantKey,
    handRaised: participant.attributes["nexmeet.handRaised"] === "true",
    reaction: reactions[participant.identity],
  });

  if (screenShareTrack) return <section className={styles.stage} aria-label="Meeting stage"><div className={styles.shareStage}><div className={styles.sharedScreen}><VideoTrack trackRef={screenShareTrack} className="size-full object-contain" /><span className={styles.screenLabel}>{screenShareTrack.participant.name || "Screen share"}</span></div><div className={styles.filmstrip}><ParticipantTile {...tileProps(localParticipant, true)} />{remoteParticipants.map((participant) => <ParticipantTile key={participant.identity} {...tileProps(participant)} />)}</div></div></section>;

  const gridClass = participantCount === 1 ? `${styles.grid} ${styles.soloGrid}` : participantCount === 2 ? `${styles.grid} ${styles.twoGrid}` : participantCount === 4 ? `${styles.grid} ${styles.fourGrid}` : `${styles.grid} ${styles.manyGrid}`;
  return <section className={styles.stage} aria-label="Meeting stage"><div className={gridClass}><ParticipantTile {...tileProps(localParticipant, true)} />{remoteParticipants.map((participant) => <ParticipantTile key={participant.identity} {...tileProps(participant)} />)}</div>{participantCount === 1 && <p className={styles.soloStatus}><Users aria-hidden="true" />Waiting for others to join</p>}</section>;
}
