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

  return <div className={`group relative aspect-video min-h-0 w-full overflow-hidden rounded-[22px] border bg-[#0a1327] shadow-[0_24px_70px_rgba(0,0,0,.28)] max-sm:aspect-auto ${isLocal ? "border-cyan-300/65 shadow-[0_24px_70px_rgba(0,0,0,.28),0_0_0_1px_rgba(34,211,238,.12),0_0_45px_rgba(6,182,212,.13)]" : "border-violet-300/20"} ${className}`}>
    {showVideo ? <VideoTrack trackRef={track} className={`size-full object-cover ${isLocal ? "mirror" : ""}`} /> : <div className="flex size-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_42%,rgba(37,99,235,.3),transparent_42%),radial-gradient(circle_at_75%_75%,rgba(124,58,237,.2),transparent_48%),#0a1327] px-4 text-center text-white"><div className="flex size-24 items-center justify-center rounded-full border border-cyan-300/35 bg-gradient-to-br from-cyan-400/30 to-violet-500/30 text-3xl font-semibold shadow-[0_12px_42px_rgba(37,99,235,.26)]">{initials}</div><p className="text-sm font-medium text-slate-300">Camera off</p></div>}
    <span className={`pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ${isLocal ? "ring-cyan-100/10" : "ring-white/[0.03]"}`} />
    {reaction && <span aria-label={`${name} reacted ${reaction}`} className="absolute right-4 top-4 rounded-full bg-[#020817]/80 px-3 py-2 text-2xl shadow-lg">{reaction}</span>}
    {handRaised && <span aria-label={`${name} has raised their hand`} className="absolute left-4 top-4 rounded-full bg-cyan-300/20 px-2.5 py-1.5 text-lg text-cyan-100">✋</span>}
    <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-[#020817]/90 via-[#0b152b]/80 to-transparent px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md sm:inset-x-4 sm:bottom-4 sm:rounded-xl sm:px-3 sm:py-1.5"><span className="min-w-0 truncate">{name}{isLocal && <span className="ml-1.5 text-cyan-300">You</span>}{isHost && <span className="ml-1.5 text-cyan-200">· Host</span>}</span>{!microphoneEnabled && <span className="shrink-0 rounded-lg bg-red-500/85 p-1 text-white" title="Microphone off"><MicOff className="size-3" /></span>}</div>
  </div>;
}
