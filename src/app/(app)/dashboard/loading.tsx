export default function DashboardLoading() {
  return (
    <div
      aria-label="Loading workspace..."
      role="status"
      className="mx-auto w-full max-w-[96rem] space-y-6"
    >
      <span className="sr-only">Loading workspace dashboard...</span>

      {/* Thin animated gradient line */}
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-200/60">
        <div className="absolute inset-y-0 left-0 w-1/3 animate-[nm-enter-up_1s_ease-in-out_infinite_alternate] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
      </div>

      {/* Compact Header Shell */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 animate-pulse">
          <div className="h-3 w-28 rounded-full bg-slate-200" />
          <div className="h-6 w-36 rounded-lg bg-slate-200" />
        </div>
        <div className="h-9 w-40 rounded-xl border border-slate-200/90 bg-white animate-pulse" />
      </div>

      {/* Lightweight Dark Hero Placeholder (no massive empty boxes) */}
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-800/80 bg-[#030712] p-6 sm:p-8 text-white min-h-[16rem] flex flex-col justify-center animate-pulse">
        <div className="space-y-4 max-w-lg">
          <div className="h-5 w-32 rounded-full bg-cyan-400/20" />
          <div className="space-y-2">
            <div className="h-8 w-64 rounded-xl bg-slate-800" />
            <div className="h-8 w-48 rounded-xl bg-slate-800" />
          </div>
          <div className="h-4 w-80 max-w-full rounded bg-slate-800/60" />
          <div className="flex gap-3 pt-2">
            <div className="h-10 w-40 rounded-xl bg-slate-800" />
            <div className="h-10 w-36 rounded-xl bg-slate-800/60" />
          </div>
        </div>
      </div>

      {/* Lightweight content placeholder */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl border border-slate-200/80 bg-white p-4 flex items-center gap-3"
          >
            <div className="size-10 rounded-xl bg-slate-100 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 w-24 rounded bg-slate-200" />
              <div className="h-3 w-32 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
