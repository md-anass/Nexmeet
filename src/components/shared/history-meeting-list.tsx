"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Clock,
  History,
  LockKeyhole,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import type { OwnedMeeting } from "@/lib/dashboard-data";
import { formatDashboardDateTime, formatDashboardDuration } from "@/lib/meeting-lifecycle";
import { Badge, Button } from "@/components/ui";

const PAGE_SIZE = 12;

export function HistoryMeetingList({ meetings }: { meetings: OwnedMeeting[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ended" | "cancelled">("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const endedCount = useMemo(
    () => meetings.filter((m) => m.status === "ended").length,
    [meetings],
  );
  const cancelledCount = useMemo(
    () => meetings.filter((m) => m.status === "cancelled").length,
    [meetings],
  );

  const filtered = useMemo(() => {
    return meetings.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesCode = m.public_code.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCode) return false;
      }
      return true;
    });
  }, [meetings, statusFilter, searchQuery]);

  const displayedMeetings = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="space-y-4">
      {/* Search and filter toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Search by title or code..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setVisibleCount(PAGE_SIZE);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All ({meetings.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("ended");
              setVisibleCount(PAGE_SIZE);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === "ended"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Ended ({endedCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("cancelled");
              setVisibleCount(PAGE_SIZE);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === "cancelled"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>
      </div>

      {/* Meeting list */}
      {displayedMeetings.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm divide-y divide-slate-100">
          {displayedMeetings.map((meeting) => {
            const isCancelled = meeting.status === "cancelled";
            const dateStr = formatDashboardDateTime(
              meeting.cancelled_at ?? meeting.ended_at ?? meeting.created_at,
            );
            const durationStr = formatDashboardDuration(meeting.started_at, meeting.ended_at);

            return (
              <div
                key={meeting.public_code}
                className="group flex flex-col gap-3 p-4 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Left: icon + title + badges */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <span
                    className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border ${
                      isCancelled
                        ? "border-red-100 bg-red-50 text-red-600"
                        : "border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                  >
                    <History className="size-4" aria-hidden="true" />
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {meeting.title}
                      </p>
                      <Badge tone={isCancelled ? "destructive" : "neutral"} className="text-[0.68rem] px-2 py-0.5">
                        {isCancelled ? "Cancelled" : "Ended"}
                      </Badge>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="font-mono text-slate-600 font-medium">
                        {meeting.public_code}
                      </span>
                      <span>•</span>
                      <span>{dateStr}</span>
                      {durationStr !== "—" && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />
                            {durationStr}
                          </span>
                        </>
                      )}
                      {meeting.access_mode === "approval_required" && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <ShieldCheck className="size-3" />
                            Approval
                          </span>
                        </>
                      )}
                      {meeting.requires_password && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <LockKeyhole className="size-3" />
                            Password
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: action */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    href={`/m/${meeting.public_code}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100"
                  >
                    <span>View details</span>
                    <ArrowUpRight className="size-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <History className="mx-auto size-8 text-slate-400" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            {searchQuery ? "No matching meetings found" : "No meeting history"}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery
              ? "Try adjusting your search terms or filters."
              : "Ended and cancelled meetings will appear here."}
          </p>
          {searchQuery && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="mt-4"
            >
              Reset filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination / Load more */}
      {hasMore && (
        <div className="text-center pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="shadow-sm"
          >
            Show more ({filtered.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
