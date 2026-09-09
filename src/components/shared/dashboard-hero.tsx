"use client";

import Link from "next/link";
import {
  CalendarClock,
  Clock3,
  History,
  Radio,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeroProps {
  displayName: string;
  upcomingCount: number;
  activeCount: number;
  historyCount: number;
  onOpenInstant: () => void;
  onOpenScheduled: () => void;
}

export function DashboardHero({
  displayName,
  upcomingCount,
  activeCount,
  historyCount,
  onOpenInstant,
  onOpenScheduled,
}: DashboardHeroProps) {
  return (
    <section
      aria-label="Meeting hub overview"
      className="relative overflow-hidden rounded-[2rem] border border-slate-800/80 bg-[#030712] px-6 py-8 text-white shadow-[0_30px_90px_rgba(2,6,23,0.35)] sm:px-9 sm:py-10 lg:px-11"
    >
      {/* Background gradients and subtle grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 size-[34rem] rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-violet-600/10 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 size-[28rem] rounded-full bg-gradient-to-tr from-violet-600/15 via-blue-500/10 to-transparent blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:44px_44px]"
      />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:items-center">
        {/* Left column: Welcome & CTAs */}
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-3.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
            <Sparkles className="size-3.5 text-cyan-300" aria-hidden="true" />
            <span>Your meeting hub</span>
          </div>

          <h1 className="mt-5 text-[clamp(2.2rem,4.2vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.05em] text-white">
            Welcome back,
            <span className="mt-1 block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {displayName}.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Create a room in seconds, schedule one for later, or continue an active conversation.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-7 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onOpenInstant}
              className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_16px_36px_rgba(37,99,235,0.4)] active:translate-y-0 active:brightness-95"
            >
              <Video className="size-4.5 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
              <span>Start instant meeting</span>
            </button>

            <button
              type="button"
              onClick={onOpenScheduled}
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.07] px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.12] active:translate-y-0"
            >
              <CalendarClock className="size-4.5 text-slate-300" aria-hidden="true" />
              <span>Schedule meeting</span>
            </button>
          </div>

          {/* Feature indicators */}
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-cyan-400" aria-hidden="true" />
              <span>Private access controls</span>
            </span>
            <span className="flex items-center gap-2">
              <UsersRound className="size-4 text-blue-400" aria-hidden="true" />
              <span>Guest-friendly joining</span>
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="size-4 text-violet-400" aria-hidden="true" />
              <span>Instant or scheduled</span>
            </span>
          </div>
        </div>

        {/* Right column: 3 Status Cards */}
        <div className="grid gap-3.5 sm:grid-cols-3 lg:grid-cols-1">
          {/* Card 1: UPCOMING */}
          <Link
            href="/dashboard/upcoming"
            className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4.5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-white/[0.07] hover:shadow-[0_12px_28px_rgba(139,92,246,0.12)]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="grid size-11 place-items-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300 transition-transform duration-200 group-hover:scale-105">
                <CalendarClock className="size-5" aria-hidden="true" />
              </span>
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-400 group-hover:text-violet-300 transition-colors">
                Upcoming
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-white">
              {upcomingCount}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Scheduled conversations
            </p>
          </Link>

          {/* Card 2: LIVE NOW */}
          <Link
            href="/dashboard/active"
            className={cn(
              "group relative block overflow-hidden rounded-2xl border p-4.5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5",
              activeCount > 0
                ? "border-cyan-400/35 bg-cyan-400/[0.08] shadow-[0_0_24px_rgba(6,182,212,0.14)] hover:border-cyan-400/60 hover:shadow-[0_0_32px_rgba(6,182,212,0.22)]"
                : "border-white/10 bg-white/[0.04] hover:border-cyan-400/40 hover:bg-white/[0.07]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-xl border transition-transform duration-200 group-hover:scale-105",
                  activeCount > 0
                    ? "border-cyan-400/30 bg-cyan-400/15 text-cyan-300"
                    : "border-white/10 bg-white/5 text-slate-400",
                )}
              >
                <Radio className="size-5" aria-hidden="true" />
              </span>

              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                  </span>
                )}
                <span
                  className={cn(
                    "text-[0.68rem] font-bold uppercase tracking-[0.16em] transition-colors",
                    activeCount > 0 ? "text-cyan-300 font-extrabold" : "text-slate-400 group-hover:text-cyan-300",
                  )}
                >
                  Live now
                </span>
              </div>
            </div>

            <p
              className={cn(
                "mt-3 text-3xl font-bold tracking-tight",
                activeCount > 0 ? "text-cyan-300" : "text-white",
              )}
            >
              {activeCount}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Active meeting rooms
            </p>
          </Link>

          {/* Card 3: HISTORY */}
          <Link
            href="/dashboard/history"
            className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4.5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-white/[0.07] hover:shadow-[0_12px_28px_rgba(59,130,246,0.12)]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="grid size-11 place-items-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300 transition-transform duration-200 group-hover:scale-105">
                <History className="size-5" aria-hidden="true" />
              </span>
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-400 group-hover:text-blue-300 transition-colors">
                History
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-white">
              {historyCount}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Completed or cancelled
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
