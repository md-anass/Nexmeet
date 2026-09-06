"use client";

import { Camera, CameraOff, Mic, MicOff, X } from "lucide-react";
import type { LocalParticipant, Participant } from "livekit-client";

type ParticipantsPanelProps = {
  participants: Participant[];
  localParticipant: LocalParticipant;
  displayName: string;
  currentHostParticipantKey: string | null;
  onClose: () => void;
};

export function ParticipantsPanel({ participants, localParticipant, displayName, currentHostParticipantKey, onClose }: ParticipantsPanelProps) {
  return <>
    <button type="button" aria-label="Close participants panel" onClick={onClose} className="fixed inset-0 z-30 bg-black/35 backdrop-blur-[2px] sm:bg-black/20" />
    <aside id="nexmeet-participants-panel" aria-label="Participants" className="fixed inset-x-0 bottom-0 z-40 flex max-h-[min(78dvh,42rem)] min-h-0 flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#081126]/95 p-4 pb-[calc(7rem+env(safe-area-inset-bottom))] text-white shadow-2xl shadow-black/50 backdrop-blur-xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-80 sm:rounded-none sm:border-b-0 sm:border-r-0 sm:border-t-0 sm:p-5 sm:pb-5">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">People</h2>
          <p className="mt-1 text-xs text-slate-400">{participants.length} participant{participants.length === 1 ? "" : "s"}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close participants panel" title="Close participants panel" className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/60"><X className="size-5" /></button>
      </div>
      <ul className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1 [touch-action:pan-y] [-webkit-overflow-scrolling:touch] sm:max-h-[calc(100dvh-8rem)] sm:flex-none">
        {participants.map((participant) => {
          const isLocal = participant.identity === localParticipant.identity;
          const name = isLocal ? displayName : participant.name || "Participant";
          const initials = name.trim().slice(0, 1).toUpperCase() || "N";
          return <li key={participant.identity} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/25 to-violet-500/25 text-sm font-semibold text-cyan-100">{initials}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{name}{isLocal && <span className="ml-1.5 text-cyan-300">(You)</span>}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                {participant.identity === currentHostParticipantKey && <span className="rounded-md bg-cyan-300/15 px-1.5 py-0.5 font-semibold text-cyan-200">Host</span>}
                <span>{participant.isMicrophoneEnabled ? "Mic on" : "Mic off"}</span>
                <span aria-hidden="true">·</span>
                <span>{participant.isCameraEnabled ? "Camera on" : "Camera off"}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-slate-300" aria-label={`${participant.isMicrophoneEnabled ? "Microphone on" : "Microphone off"}, ${participant.isCameraEnabled ? "Camera on" : "Camera off"}`}>
              {participant.isMicrophoneEnabled ? <Mic className="size-4" /> : <MicOff className="size-4 text-red-300" />}
              {participant.isCameraEnabled ? <Camera className="size-4" /> : <CameraOff className="size-4 text-slate-500" />}
            </div>
          </li>;
        })}
      </ul>
    </aside>
  </>;
}
