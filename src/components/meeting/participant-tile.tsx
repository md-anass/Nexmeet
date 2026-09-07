import type { TrackReference } from "@livekit/components-react";
import { VideoTrack } from "@livekit/components-react";
import type { Participant } from "livekit-client";
import { MicOff } from "lucide-react";
import type { ReactionType } from "@/components/meeting/meeting-ephemeral";

type ParticipantTileProps = { participant: Participant; track?: TrackReference; displayName: string; isLocal?: boolean; cameraEnabled: boolean; microphoneEnabled?: boolean; isHost?: boolean; handRaised?: boolean; reaction?: ReactionType; className?: string };

export function ParticipantTile({ participant, track, displayName, isLocal = false, cameraEnabled, microphoneEnabled = true, isHost = false, handRaised = false, reaction, className = "" }: ParticipantTileProps) {
  const name = isLocal ? displayName : participant.name || "Participant";
  const initials = name.trim().slice(0, 1).toUpperCase() || "N";
  const showVideo = Boolean(track?.publication?.isSubscribed && track?.publication?.isEnabled && !track?.publication?.isMuted && cameraEnabled);

  return <div className={`relative aspect-video min-h-0 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0b1224] shadow-2xl shadow-black/20 ${className}`}>
    {showVideo ? <VideoTrack trackRef={track} className={`size-full object-cover ${isLocal ? "mirror" : ""}`} /> : <div className="flex size-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_center,rgba(38,84,153,0.28),transparent_56%)] px-4 text-center text-white"><div className="flex size-20 items-center justify-center rounded-full border border-cyan-300/30 bg-gradient-to-br from-cyan-400/25 to-violet-500/25 text-2xl font-semibold">{initials}</div><p className="text-xs text-slate-400">Camera off</p></div>}
    {reaction && <span aria-label={`${name} reacted ${reaction}`} className="absolute right-4 top-4 rounded-full bg-[#020817]/80 px-3 py-2 text-2xl shadow-lg">{reaction}</span>}
    {handRaised && <span aria-label={`${name} has raised their hand`} className="absolute left-4 top-4 rounded-full bg-cyan-300/20 px-2.5 py-1.5 text-lg text-cyan-100">✋</span>}
    <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2"><span className="rounded-lg bg-[#020817]/75 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur">{name}{isLocal && <span className="ml-1.5 text-cyan-300">You</span>}</span><span className="flex items-center gap-1.5">{isHost && <span className="rounded-lg bg-cyan-300/15 px-2 py-1 text-[10px] font-semibold text-cyan-200">Host</span>}{!microphoneEnabled && <span className="rounded-lg bg-red-500/80 p-1.5 text-white" title="Microphone off"><MicOff className="size-3" /></span>}</span></div>
  </div>;
}
