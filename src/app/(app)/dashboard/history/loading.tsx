import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function HistoryMeetingsSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading meeting history">
      {/* Toolbar skeleton: search + filter pills */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-pulse">
        <div className="h-9 w-full sm:max-w-xs rounded-xl bg-slate-200" />
        <div className="flex gap-2">
          <div className="h-7 w-16 rounded-full bg-slate-200" />
          <div className="h-7 w-20 rounded-full bg-slate-100" />
          <div className="h-7 w-24 rounded-full bg-slate-100" />
        </div>
      </div>

      {/* 5-6 compact row skeletons */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm divide-y divide-slate-100">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between animate-pulse"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="size-9 shrink-0 rounded-xl bg-slate-100" />
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-44 rounded-md bg-slate-200" />
                  <div className="h-4 w-14 rounded-full bg-slate-100" />
                </div>
                <div className="flex gap-3">
                  <div className="h-3 w-20 rounded bg-slate-100" />
                  <div className="h-3 w-28 rounded bg-slate-100" />
                  <div className="h-3 w-16 rounded bg-slate-100" />
                </div>
              </div>
            </div>

            <div className="h-7 w-24 rounded-lg bg-slate-100 self-end sm:self-center" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HistoryLoading() {
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
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Workspace archive
            </p>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Meeting history
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Archive of completed and cancelled meetings.
          </p>
        </div>
      </div>

      <HistoryMeetingsSkeleton />
    </div>
  );
}
