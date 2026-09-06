"use client";

import { useState } from "react";
import { Check, Copy, Users } from "lucide-react";
import { NexMeetBrand } from "@/components/brand/nexmeet-brand";

export function MeetingTopBar({ title, shareLink, participantCount }: { title: string; shareLink: string; participantCount: number }) {
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

  return <header className="flex min-h-16 items-center justify-between gap-4 border-b border-white/10 bg-[#050b1a]/85 px-4 py-3 backdrop-blur-xl sm:px-7">
    <div className="flex min-w-0 items-center gap-2.5"><NexMeetBrand compact className="scale-110" /><div className="hidden h-7 w-px bg-white/10 sm:block" /><p className="min-w-0 truncate text-sm font-medium text-slate-200">{title}</p></div>
    <div className="flex shrink-0 items-center gap-2"><span className="hidden items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300 sm:inline-flex"><i className="size-1.5 rounded-full bg-emerald-300" />Connected</span><button type="button" onClick={() => void copyInvite()} title="Copy meeting invite" aria-label="Copy meeting invite" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/60">{copied ? <Check className="size-4 text-emerald-300" /> : <Copy className="size-4" />}{copied ? "Copied" : "Share"}</button><span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300" title={`${participantCount} participant${participantCount === 1 ? "" : "s"}`}><Users className="size-4" />{participantCount}</span></div>
  </header>;
}
