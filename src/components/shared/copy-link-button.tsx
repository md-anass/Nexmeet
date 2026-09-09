"use client";

import { useState } from "react";

export function CopyLinkButton({ link, variant = "default" }: { link: string; variant?: "default" | "lobby" }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copyLink() {
    setFailed(false);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setFailed(true);
    }
  }

  if (variant === "lobby") return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <output className="min-w-0 flex-1 truncate rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-400">{link}</output>
        <button type="button" onClick={copyLink} className="min-h-11 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/20">{copied ? "Copied" : "Copy link"}</button>
      </div>
      {failed && <p role="status" className="mt-2 text-sm text-slate-400">Copy is unavailable. You can select the link above.</p>}
    </div>
  );

  return (
    <div className="mt-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Shareable link</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <output className="min-w-0 flex-1 truncate rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{link}</output>
        <button type="button" onClick={copyLink} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/20">{copied ? "Copied" : "Copy link"}</button>
      </div>
      {failed && <p role="status" className="mt-2 text-sm text-slate-500">Copy is unavailable. You can select the link above.</p>}
    </div>
  );
}
