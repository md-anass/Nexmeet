import Link from "next/link";
import { ArrowRight, Link2, ShieldCheck } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getAuthenticatedUser();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_55%)]" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between py-3">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-slate-950 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
          >
            NexMeet
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
            >
              {user ? "Dashboard" : "Sign In"}
            </Link>
            <Link
              href={user ? "/profile" : "/signup"}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
            >
              {user ? "Profile" : "Get Started"}
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
              Private meeting rooms for small groups
            </p>

            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Meet. Connect. Simple.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              Private video meetings for friends, students, and small groups.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
              >
                Create Meeting
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href={user ? "/dashboard" : "/login"}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
              >
                Join Meeting
              </Link>
            </div>

            <p className="mt-5 flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck className="size-4 text-slate-400" />
              No complicated setup. Just create a room and share the link.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,_rgba(15,23,42,0.12),_transparent_42%)] blur-2xl" />

            <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-500">Room preview</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    nexmeet.app/room-427
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Private
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-300">
                  Share this link with people you trust.
                </p>

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <Link2 className="size-4 shrink-0 text-slate-300" />
                  <span className="truncate text-sm font-medium text-slate-100">
                    https://nexmeet.app/room-427
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Step 1
                    </p>
                    <p className="mt-2 text-sm text-slate-100">Create a room</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Step 2
                    </p>
                    <p className="mt-2 text-sm text-slate-100">Share the link</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
