import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ActiveMeetingsSkeleton() {
  return (
    <div className="grid gap-3.5" aria-label="Loading active rooms">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-cyan-200/50 bg-white p-5 sm:p-6 shadow-sm ring-1 ring-cyan-400/20 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="size-11 shrink-0 rounded-xl bg-cyan-100/60" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="h-4.5 w-44 rounded-md bg-slate-200" />
                <div className="h-5 w-20 rounded-full bg-cyan-100/70" />
              </div>
              <div className="flex gap-4">
                <div className="h-3.5 w-32 rounded bg-slate-100" />
                <div className="h-3.5 w-24 rounded bg-slate-100" />
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="h-3.5 w-24 rounded bg-slate-100" />
                <div className="h-8 w-24 rounded-lg bg-cyan-500/25" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ActiveLoading() {
  return (
    <div className="mx-auto w-full max-w-[88rem]">
      {/* Immediate Page Header Shell */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="group mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
              Live in progress
            </p>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Active meeting rooms
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time rooms currently in progress.
          </p>
        </div>
      </div>

      <ActiveMeetingsSkeleton />
    </div>
  );
}
