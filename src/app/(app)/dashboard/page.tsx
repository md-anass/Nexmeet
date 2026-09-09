import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  History,
  Radio,
} from "lucide-react";
import { fetchDashboardData } from "@/lib/dashboard-data";
import { DashboardInteractiveHub } from "@/components/shared/dashboard-interactive-hub";
import { DashboardHeroActions } from "@/components/shared/dashboard-actions";
import { MeetingCard } from "@/components/shared/meeting-card";
import { Alert, Avatar, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const {
    user,
    displayName,
    upcomingMeetings,
    activeMeetings,
    pastMeetings,
    counts,
    meetingsError,
  } = await fetchDashboardData();

  return (
    <div className="mx-auto w-full max-w-[96rem] space-y-7">
      {/* COMPACT TOP HEADER */}
      <header className="flex flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-400">
              NexMeet workspace
            </p>
          </div>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Dashboard
          </h1>
        </div>

        <Link
          href="/profile"
          className="group flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
          aria-label="View user profile settings"
        >
          <Avatar
            name={displayName}
            className="size-8 text-xs ring-1 ring-cyan-500/20"
          />
          <div className="hidden sm:block text-left min-w-0">
            <span className="block max-w-44 truncate text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {displayName}
            </span>
            <span className="block max-w-44 truncate text-[0.68rem] text-slate-400">
              {user.email}
            </span>
          </div>
        </Link>
      </header>

      {/* PREMIUM HERO & QUICK ACTIONS HUB */}
      <DashboardInteractiveHub
        displayName={displayName}
        upcomingCount={counts.upcoming}
        activeCount={counts.active}
        historyCount={counts.history}
      />

      {/* MEETINGS DISPLAY */}
      {meetingsError ? (
        <Alert tone="error" className="mt-6">
          We could not load your meetings right now. Refresh the page to try again.
        </Alert>
      ) : (
        <div className="pt-2">
          <div className="grid items-start gap-7 lg:grid-cols-12">
            {/* LEFT / LARGER: UPCOMING MEETINGS */}
            <section
              id="upcoming"
              aria-labelledby="upcoming-heading"
              className="lg:col-span-7 xl:col-span-8 scroll-mt-24"
            >
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-violet-600">
                    Next up
                  </p>
                  <h2
                    id="upcoming-heading"
                    className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
                  >
                    Upcoming meetings
                  </h2>
                </div>

                {upcomingMeetings.length > 2 && (
                  <Link
                    href="/dashboard/upcoming"
                    className="group inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 transition-colors hover:text-violet-700"
                  >
                    <span>View all ({upcomingMeetings.length})</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
              </div>

              <div className="grid gap-3.5">
                {upcomingMeetings.length > 0 ? (
                  <>
                    {upcomingMeetings.slice(0, 2).map((meeting, index) => (
                      <MeetingCard
                        key={meeting.public_code}
                        meeting={meeting}
                        featured={index === 0}
                      />
                    ))}

                    {upcomingMeetings.length > 2 && (
                      <Link
                        href="/dashboard/upcoming"
                        className="group flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50/50 p-3.5 text-xs font-semibold text-violet-700 transition hover:border-violet-200 hover:bg-violet-100/60"
                      >
                        <span>
                          +{upcomingMeetings.length - 2} more scheduled{" "}
                          {upcomingMeetings.length - 2 === 1 ? "meeting" : "meetings"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-violet-800">
                          <span>See full schedule</span>
                          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    )}
                  </>
                ) : (
                  <EmptyState
                    icon={<CalendarClock className="size-7 text-violet-500" />}
                    title="No upcoming meetings"
                    description="You don't have any scheduled meetings yet. Start now or pick a time that works for everyone."
                    action={<DashboardHeroActions compact />}
                    className="border border-slate-200/90 bg-white shadow-sm"
                  />
                )}
              </div>
            </section>

            {/* RIGHT: ACTIVE ROOMS & ARCHIVE SUMMARY */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              {/* ACTIVE ROOMS */}
              <section
                id="active"
                aria-labelledby="active-heading"
                className="scroll-mt-24"
              >
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-cyan-700">
                      In progress
                    </p>
                    <h2
                      id="active-heading"
                      className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
                    >
                      Active rooms
                    </h2>
                  </div>

                  {activeMeetings.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-cyan-700">
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-cyan-500" />
                      </span>
                      <span>{activeMeetings.length} live</span>
                    </span>
                  )}
                </div>

                <div className="grid gap-3.5">
                  {activeMeetings.length > 0 ? (
                    <>
                      {activeMeetings.slice(0, 2).map((meeting) => (
                        <div
                          key={meeting.public_code}
                          className="rounded-2xl ring-1 ring-cyan-400/30"
                        >
                          <MeetingCard meeting={meeting} compact featured />
                        </div>
                      ))}

                      {activeMeetings.length > 2 && (
                        <Link
                          href="/dashboard/active"
                          className="group flex items-center justify-between rounded-xl border border-cyan-100 bg-cyan-50/50 p-3 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100/60"
                        >
                          <span>+{activeMeetings.length - 2} more active rooms</span>
                          <span className="inline-flex items-center gap-1">
                            <span>Open rooms</span>
                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </Link>
                      )}
                    </>
                  ) : (
                    <EmptyState
                      icon={<Radio className="size-7 text-cyan-500" />}
                      title="No active meetings"
                      description="Meetings in progress will appear here in real time."
                      className="border border-slate-200/90 bg-white shadow-sm"
                    />
                  )}
                </div>
              </section>

              {/* ARCHIVE SUMMARY CARD */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
                      <History className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Meeting history
                      </p>
                      <p className="text-xs text-slate-500">
                        {pastMeetings.length} past or cancelled{" "}
                        {pastMeetings.length === 1 ? "meeting" : "meetings"}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/history"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100"
                  >
                    <span>View archive</span>
                    <ArrowRight className="size-3 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
