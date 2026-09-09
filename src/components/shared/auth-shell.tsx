import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  LockKeyhole,
  Radio,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  description: string;
  mode?: "login" | "signup";
  children: ReactNode;
}

export function AuthShell({
  title,
  description,
  mode = "signup",
  children,
}: AuthShellProps) {
  const isSignup = mode === "signup";

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#f8fafc] text-slate-900 lg:grid lg:grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1.15fr_0.85fr]">
      {/* LEFT SHOWCASE COLUMN (DESKTOP) */}
      <section
        aria-label="NexMeet showcase"
        className="relative hidden overflow-hidden border-r border-slate-800/80 bg-[#030712] p-10 text-white lg:flex lg:min-h-[100dvh] lg:flex-col lg:justify-between xl:p-14"
      >
        {/* Atmospheric ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-20 size-[32rem] rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-violet-600/10 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-20 size-[30rem] rounded-full bg-gradient-to-tr from-violet-600/20 via-blue-500/10 to-transparent blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:44px_44px]"
        />

        {/* Top Brand & Home Link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            aria-label="NexMeet home"
            className="group relative flex h-14 w-44 items-center overflow-hidden rounded-xl transition-opacity hover:opacity-90"
          >
            <Image
              unoptimized
              src="/brand/logo with name.png"
              alt="NexMeet"
              fill
              sizes="11rem"
              className="scale-[1.8] object-contain object-left"
            />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return home</span>
          </Link>
        </div>

        {/* Middle Showcase Content */}
        <div className="relative z-10 my-auto max-w-xl py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
            <Sparkles className="size-3.5 text-cyan-300" aria-hidden="true" />
            <span>{isSignup ? "Start hosting in seconds" : "Next-generation video meetings"}</span>
          </div>

          <h1 className="mt-6 text-[clamp(2.4rem,4.2vw,3.8rem)] font-extrabold leading-[1.04] tracking-[-0.05em] text-white">
            {isSignup ? (
              <>
                Create your meeting space,{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  frictionless & secure.
                </span>
              </>
            ) : (
              <>
                Your meetings,{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  ready when you are.
                </span>
              </>
            )}
          </h1>

          <p className="mt-5 text-base leading-relaxed text-slate-300">
            {isSignup
              ? "Join NexMeet to host instant or scheduled video meetings. Share a link, invite guests with zero downloads, and maintain total room control."
              : "Welcome back to your private conferencing workspace. Launch rooms, manage participant approvals, and return to ongoing conversations."}
          </p>

          {/* 3 Feature Cards */}
          <div className="mt-9 grid gap-3.5 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
              <span className="grid size-9 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                <Zap className="size-4.5" />
              </span>
              <p className="mt-3 text-xs font-bold text-white">Instant setup</p>
              <p className="mt-1 text-[0.72rem] leading-4 text-slate-400">
                Create a room and share the link in seconds.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
              <span className="grid size-9 place-items-center rounded-xl border border-violet-400/30 bg-violet-400/10 text-violet-300">
                <ShieldCheck className="size-4.5" />
              </span>
              <p className="mt-3 text-xs font-bold text-white">Protected access</p>
              <p className="mt-1 text-[0.72rem] leading-4 text-slate-400">
                Waiting room gates and password security.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
              <span className="grid size-9 place-items-center rounded-xl border border-blue-400/30 bg-blue-400/10 text-blue-300">
                <Radio className="size-4.5" />
              </span>
              <p className="mt-3 text-xs font-bold text-white">LiveKit powered</p>
              <p className="mt-1 text-[0.72rem] leading-4 text-slate-400">
                Ultra-low latency HD video and spatial audio.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom trust footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <LockKeyhole className="size-3.5 text-cyan-400" />
            <span>End-to-end access controls</span>
          </div>
          <p>© {new Date().getFullYear()} NexMeet Inc.</p>
        </div>
      </section>

      {/* RIGHT FORM COLUMN */}
      <section className="relative flex min-h-[100dvh] items-center justify-center p-4 sm:p-8 lg:p-12">
        {/* Soft background radial gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.06),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,0.05),transparent_60%)]"
        />

        <div className="relative w-full max-w-[29.5rem]">
          {/* Mobile Header */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link
              href="/"
              aria-label="NexMeet home"
              className="relative h-11 w-32 overflow-hidden"
            >
              <Image
                unoptimized
                src="/brand/logo with name.png"
                alt="NexMeet"
                fill
                sizes="8rem"
                className="scale-[1.8] object-contain object-left"
              />
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="size-3.5" />
              <span>Home</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="rounded-[2rem] border border-slate-200/90 bg-white/95 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-9">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-400">
                NexMeet Account
              </p>
            </div>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {description}
            </p>

            <div className="mt-7">{children}</div>
          </div>

          {/* Bottom Security Guarantee */}
          <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>256-bit encrypted authentication · Powered by Supabase</span>
          </div>
        </div>
      </section>
    </main>
  );
}
