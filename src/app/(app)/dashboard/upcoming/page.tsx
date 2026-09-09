import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { fetchDashboardData } from "@/lib/dashboard-data";
import { MeetingCard } from "@/components/shared/meeting-card";
import { DashboardHeroActions } from "@/components/shared/dashboard-actions";
import { EmptyState } from "@/components/ui";
import { UpcomingMeetingsSkeleton } from "./loading";

export const dynamic = "force-dynamic";

async function UpcomingMeetingsContent() {
  const { upcomingMeetings } = await fetchDashboardData();

  if (upcomingMeetings.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock className="size-8 text-violet-500" />}
        title="No upcoming meetings"
        description="You haven't scheduled any meetings yet. Choose a date and time to invite your participants in advance."
        action={<DashboardHeroActions compact />}
        className="border border-slate-200/90 bg-white shadow-sm"
      />
    );
  }

  return (
    <div className="grid gap-3.5">
      {upcomingMeetings.map((meeting, index) => (
        <MeetingCard
          key={meeting.public_code}
          meeting={meeting}
          featured={index === 0}
        />
      ))}
    </div>
  );
}

export default function UpcomingMeetingsPage() {
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
            <span className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Workspace schedule
            </p>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Upcoming meetings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Scheduled conversations ready to start or share.
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <DashboardHeroActions compact />
        </div>
      </div>

      {/* Streamed dynamic meetings list */}
      <Suspense fallback={<UpcomingMeetingsSkeleton />}>
        <UpcomingMeetingsContent />
      </Suspense>
    </div>
  );
}
