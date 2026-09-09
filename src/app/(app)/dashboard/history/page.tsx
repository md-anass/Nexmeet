import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { fetchDashboardData } from "@/lib/dashboard-data";
import { HistoryMeetingList } from "@/components/shared/history-meeting-list";
import { HistoryMeetingsSkeleton } from "./loading";

export const dynamic = "force-dynamic";

async function HistoryMeetingsContent() {
  const { pastMeetings } = await fetchDashboardData();
  return <HistoryMeetingList meetings={pastMeetings} />;
}

export default function MeetingHistoryPage() {
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

      {/* Streamed compact, searchable & filterable meeting list */}
      <Suspense fallback={<HistoryMeetingsSkeleton />}>
        <HistoryMeetingsContent />
      </Suspense>
    </div>
  );
}
