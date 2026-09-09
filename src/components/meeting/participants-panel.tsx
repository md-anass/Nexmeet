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
    <button type="button" aria-label="Close participants panel" onClick={onClose} className="absolute inset-0 z-30 bg-black/35 backdrop-blur-[2px] sm:bg-black/10" />
    <aside id="nexmeet-participants-panel" aria-label="Participants" className="absolute inset-x-0 bottom-0 z-40 flex max-h-[min(78dvh,42rem)] min-h-0 flex-col overflow-hidden rounded-t-[28px] border border-white/[0.12] bg-[#09142a]/[0.97] p-4 pb-[calc(7rem+env(safe-area-inset-bottom))] text-white shadow-[0_-20px_65px_rgba(0,0,0,.42)] backdrop-blur-xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[23rem] sm:rounded-none sm:border-b-0 sm:border-r-0 sm:border-t-0 sm:p-6 sm:pb-6 sm:shadow-[-22px_0_65px_rgba(0,0,0,.25)]">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.025em]">People</h2>
          <p className="mt-1 text-xs font-medium text-slate-400">{participants.length} participant{participants.length === 1 ? "" : "s"} in this room</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close participants panel" title="Close participants panel" className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/60"><X className="size-5" /></button>
      </div>
      <ul className="mt-5 min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain pr-1 [touch-action:pan-y] [-webkit-overflow-scrolling:touch] sm:max-h-[calc(100dvh-10rem)] sm:flex-none">
        {participants.map((participant) => {
          const isLocal = participant.identity === localParticipant.identity;
          const name = isLocal ? displayName : participant.name || "Participant";
          const initials = name.trim().slice(0, 1).toUpperCase() || "N";
          return <li key={participant.identity} className="flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.035] px-3.5 py-3.5 transition hover:border-cyan-300/20 hover:bg-white/[0.06]">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-cyan-300/15 bg-gradient-to-br from-cyan-400/25 to-violet-500/30 text-sm font-semibold text-cyan-100 shadow-[0_8px_20px_rgba(37,99,235,.12)]">{initials}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{name}{isLocal && <span className="ml-1.5 text-cyan-300">(You)</span>}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                {participant.identity === currentHostParticipantKey && <span className="rounded-md bg-cyan-300/15 px-1.5 py-0.5 font-semibold text-cyan-200">Host</span>}
                {participant.attributes["nexmeet.handRaised"] === "true" && <span aria-label="Hand raised" className="text-cyan-200">✋ Hand raised</span>}
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
