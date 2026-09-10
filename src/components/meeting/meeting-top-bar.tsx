"use client";

import { useState } from "react";
import { Check, Copy, LockKeyhole, MoreHorizontal, Users } from "lucide-react";
import { NexMeetLogo } from "@/components/brand/nexmeet-logo";
import { MeetingTimer } from "@/components/meeting/meeting-timer";

type Props = { title: string; meetingCode: string; shareLink: string; participantCount: number; startedAt: string | null };

export function MeetingTopBar({ title, meetingCode, shareLink, participantCount, startedAt }: Props) {
  const [copied, setCopied] = useState(false);
  async function copyInvite() { try { await navigator.clipboard.writeText(shareLink); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } }
  return <header className="relative z-20 flex h-[58px] shrink-0 items-center justify-between border-b border-white/10 bg-[#050a16]/95 px-3 text-white shadow-[0_8px_30px_rgba(0,0,0,.25)] backdrop-blur-xl sm:px-5">
    <div className="flex min-w-0 items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-violet-500/25"><NexMeetLogo markOnly size={27} /></div><div className="min-w-0"><h1 className="truncate text-sm font-semibold tracking-tight text-slate-100 sm:text-[15px]">{title}</h1><p className="truncate font-mono text-[10px] tracking-[.12em] text-slate-500">{meetingCode}</p></div></div>
    <div className="hidden items-center gap-4 lg:flex"><span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-300"><i className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.8)]" />Connected</span><span className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-200"><LockKeyhole className="size-3.5" />Secure meeting</span><span className="h-5 w-px bg-white/10" /><span className="font-mono text-xs text-slate-300"><MeetingTimer startedAt={startedAt} /></span></div>
    <div className="flex items-center gap-1.5"><span className="inline-flex items-center rounded-lg border border-white/10 bg-white/[.04] px-2.5 py-2 font-mono text-xs text-slate-300 sm:px-3"><MeetingTimer startedAt={startedAt} /></span><button type="button" onClick={() => void copyInvite()} aria-label="Copy meeting invite" className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/[.08] px-2.5 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/[.16] focus:outline-none focus:ring-2 focus:ring-cyan-300/60 sm:px-3">{copied ? <Check className="size-4 text-emerald-300" /> : <Copy className="size-4" />}<span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span></button><span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-2 text-xs text-slate-300" title={`${participantCount} participants`}><Users className="size-4" />{participantCount}</span><button type="button" aria-label="More meeting options" className="grid size-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/[.08] focus:outline-none focus:ring-2 focus:ring-cyan-300/60"><MoreHorizontal className="size-4" /></button></div>
  </header>;
}
