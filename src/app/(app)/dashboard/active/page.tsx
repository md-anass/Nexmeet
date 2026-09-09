import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Radio } from "lucide-react";
import { fetchDashboardData } from "@/lib/dashboard-data";
import { MeetingCard } from "@/components/shared/meeting-card";
import { DashboardHeroActions } from "@/components/shared/dashboard-actions";
import { EmptyState } from "@/components/ui";
import { ActiveMeetingsSkeleton } from "./loading";

export const dynamic = "force-dynamic";

async function ActiveMeetingsContent() {
  const { activeMeetings } = await fetchDashboardData();

  if (activeMeetings.length === 0) {
    return (
      <EmptyState
        icon={<Radio className="size-8 text-cyan-500" />}
        title="No active meetings"
        description="There are no rooms currently in progress. Start an instant meeting or join when a participant begins."
        action={<DashboardHeroActions compact />}
        className="border border-slate-200/90 bg-white shadow-sm"
      />
    );
  }

  return (
    <div className="grid gap-3.5">
      {activeMeetings.map((meeting) => (
        <div
          key={meeting.public_code}
          className="rounded-2xl ring-2 ring-cyan-400/30 shadow-[0_0_24px_rgba(6,182,212,0.1)]"
        >
          <MeetingCard meeting={meeting} featured />
        </div>
      ))}
    </div>
  );
}

export default function ActiveMeetingsPage() {
  return (
    <div className="mx-auto w-full max-w-[88rem]">
      {/* Immediate Page Header Shell */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="group mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            </span>
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

        <div className="self-start sm:self-auto">
          <DashboardHeroActions compact />
        </div>
      </div>

      {/* Streamed dynamic active meetings list */}
      <Suspense fallback={<ActiveMeetingsSkeleton />}>
        <ActiveMeetingsContent />
      </Suspense>
    </div>
  );
}
