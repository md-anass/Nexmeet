"use client";

import { useState } from "react";
import { Check, Copy, ShieldCheck, Users } from "lucide-react";
import { NexMeetLogo } from "@/components/brand/nexmeet-logo";
import { MeetingTimer } from "@/components/meeting/meeting-timer";

export function MeetingTopBar({ title, meetingCode, shareLink, participantCount, startedAt }: { title: string; meetingCode: string; shareLink: string; participantCount: number; startedAt: string | null }) {
  const [copied, setCopied] = useState(false);

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return <header className="grid h-16 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-white/[0.08] bg-[#060c1d]/92 px-4 shadow-[0_10px_34px_rgba(0,0,0,.13)] backdrop-blur-xl sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:px-6">
    <div className="flex min-w-0 items-center gap-3"><NexMeetLogo markOnly size={32} /><div className="hidden h-8 w-px bg-white/10 sm:block" /><div className="min-w-0"><p className="min-w-0 truncate text-[0.9rem] font-semibold tracking-[-0.02em] text-slate-100">{title}</p><p className="mt-0.5 hidden truncate font-mono text-[0.66rem] font-medium tracking-[0.08em] text-slate-500 sm:block">Code: {meetingCode}</p></div></div>
    <div className="hidden items-center justify-center gap-3 sm:flex"><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-200"><ShieldCheck className="size-4" />Secure meeting</span><span className="h-5 w-px bg-white/10" /><span className="inline-flex rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-slate-200"><MeetingTimer startedAt={startedAt} /></span></div>
    <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2"><span className="hidden items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-400/[0.09] px-3 py-1.5 text-xs font-semibold text-emerald-300 lg:inline-flex"><i className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.9)]" />Connected</span><span className="inline-flex shrink-0 rounded-xl border border-white/10 bg-white/[0.055] px-2 py-2 text-slate-200 sm:hidden"><MeetingTimer startedAt={startedAt} /></span><button type="button" onClick={() => void copyInvite()} title="Copy meeting invite" aria-label="Copy meeting invite" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-2 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/25 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 max-[640px]:hidden sm:px-3">{copied ? <Check className="size-4 text-emerald-300" /> : <Copy className="size-4" />}{copied ? "Copied" : "Share"}</button><span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.055] px-2 py-2 text-xs font-semibold text-slate-300 max-[640px]:hidden sm:px-3" title={`${participantCount} participant${participantCount === 1 ? "" : "s"}`}><Users className="size-4" />{participantCount}</span></div>
  </header>;
}
