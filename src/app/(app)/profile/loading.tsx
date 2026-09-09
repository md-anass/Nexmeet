export default function ProfileLoading() {
  return (
    <div
      aria-label="Loading profile..."
      role="status"
      className="mx-auto w-full max-w-5xl space-y-8"
    >
      <span className="sr-only">Loading profile settings...</span>

      {/* PAGE HEADER (exact text & dimensions prevent header flicker and layout shift) */}
      <header>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-400">
            Account settings
          </p>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">
          Manage your NexMeet identity, account details, and workspace preferences.
        </p>
      </header>

      {/* IDENTITY HERO CARD (matching exact dark atmosphere, gradients & padding) */}
      <section
        aria-label="Loading identity"
        className="relative overflow-hidden rounded-[2rem] border border-slate-800/80 bg-[#030712] p-6 text-white shadow-[0_24px_70px_rgba(2,6,23,0.3)] sm:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 size-[26rem] rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-violet-600/10 blur-[90px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-1/4 size-[20rem] rounded-full bg-gradient-to-tr from-violet-600/15 via-blue-500/10 to-transparent blur-[80px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:40px_40px]"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="size-20 rounded-full bg-slate-800/90 ring-4 ring-cyan-400/20 shadow-[0_0_24px_rgba(6,182,212,0.2)] animate-pulse shrink-0" />

            <div className="min-w-0 space-y-2.5 animate-pulse">
              <div className="h-5 w-32 rounded-full bg-cyan-400/15" />
              <div className="h-7 w-48 rounded-lg bg-slate-800" />
              <div className="h-4 w-56 rounded bg-slate-800/60" />
            </div>
          </div>

          <div className="self-start sm:self-center">
            <div className="h-8 w-32 rounded-full border border-emerald-400/20 bg-emerald-400/10 animate-pulse" />
          </div>
        </div>
      </section>

      {/* 2-COLUMN PROFILE CONTENT (exact grid gap & column widths) */}
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        {/* LEFT COLUMN: PERSONAL INFORMATION CARD */}
        <section className="rounded-[1.75rem] border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8 space-y-6">
          <div className="flex items-start gap-3.5 border-b border-slate-100 pb-5">
            <div className="size-10 rounded-xl border border-blue-100 bg-blue-50 animate-pulse shrink-0" />
            <div className="space-y-1.5 animate-pulse">
              <div className="h-5 w-44 rounded-md bg-slate-200" />
              <div className="h-3.5 w-64 rounded bg-slate-100" />
            </div>
          </div>

          <div className="space-y-6 animate-pulse">
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-11 sm:h-12 w-full rounded-xl border border-slate-200/80 bg-slate-50/50" />
              <div className="h-3 w-80 max-w-full rounded bg-slate-100" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-11 sm:h-12 w-full rounded-xl border border-slate-200/80 bg-slate-50/50" />
              <div className="h-3 w-72 max-w-full rounded bg-slate-100" />
            </div>

            <div className="pt-1">
              <div className="h-11 w-36 rounded-xl bg-slate-200" />
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: ACCOUNT & SECURITY PANELS */}
        <div className="space-y-6">
          {/* CARD 1: ACCOUNT DETAILS */}
          <section className="rounded-[1.75rem] border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="h-4.5 w-32 rounded bg-slate-200 animate-pulse" />
            <div className="space-y-3 pt-1">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2 animate-pulse">
                <div className="h-3.5 w-24 rounded bg-slate-200" />
                <div className="h-4 w-48 rounded bg-slate-100" />
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2 animate-pulse">
                <div className="h-3.5 w-24 rounded bg-slate-200" />
                <div className="h-4 w-32 rounded bg-slate-100" />
              </div>
            </div>
          </section>

          {/* CARD 2: SECURITY & SESSION */}
          <section className="rounded-[1.75rem] border border-slate-200/90 bg-white p-6 shadow-sm space-y-3">
            <div className="h-4.5 w-36 rounded bg-slate-200 animate-pulse" />
            <div className="h-3.5 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-3.5 w-4/5 rounded bg-slate-100 animate-pulse" />
            <div className="pt-3 border-t border-slate-100 space-y-2 animate-pulse">
              <div className="h-3.5 w-28 rounded bg-slate-100" />
              <div className="h-3.5 w-24 rounded bg-slate-100" />
            </div>
          </section>

          {/* CARD 3: NEXMEET WORKSPACE INFO */}
          <div className="rounded-[1.75rem] border border-cyan-200/60 bg-gradient-to-br from-cyan-50/50 via-blue-50/30 to-violet-50/20 p-5 shadow-sm space-y-2 animate-pulse">
            <div className="h-4 w-36 rounded bg-cyan-200/70" />
            <div className="h-3.5 w-full rounded bg-cyan-100/60" />
            <div className="h-3.5 w-3/4 rounded bg-cyan-100/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
