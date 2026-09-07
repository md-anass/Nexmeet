"use client";

import { useState } from "react";

export type PendingWaitingRoomEntry = { entryId: string; displayName: string; requestedAt: string };

export function WaitingRoomHostPanel({ entries, onDecision }: { entries: PendingWaitingRoomEntry[]; onDecision: (entryId: string, decision: "admit" | "reject") => Promise<void> }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  if (entries.length === 0) return null;

  async function decide(entryId: string, decision: "admit" | "reject") {
    if (busy) return;
    setBusy(entryId);
    setError("");
    try { await onDecision(entryId, decision); } catch { setError("Unable to update a request. Please try again."); } finally { setBusy(null); }
  }

  return <section aria-label="Waiting room requests" className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-3 z-40 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-cyan-300/20 bg-[#081126]/95 p-4 shadow-2xl backdrop-blur sm:left-auto sm:right-6"><p className="text-sm font-semibold text-white">Waiting room</p><p className="mt-1 text-xs text-slate-400">{entries.length} request{entries.length === 1 ? "" : "s"} waiting</p><div className="mt-3 grid gap-2">{entries.map((entry) => <div key={entry.entryId} className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><p className="truncate text-sm font-medium text-white">{entry.displayName}</p><div className="mt-2 flex gap-2"><button type="button" onClick={() => void decide(entry.entryId, "admit")} disabled={Boolean(busy)} className="flex-1 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-50">Admit</button><button type="button" onClick={() => void decide(entry.entryId, "reject")} disabled={Boolean(busy)} className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Reject</button></div></div>)}</div>{error && <p role="alert" className="mt-3 text-xs text-red-200">{error}</p>}</section>;
}
