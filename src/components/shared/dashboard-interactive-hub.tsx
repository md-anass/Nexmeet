"use client";

import { DashboardHero } from "@/components/shared/dashboard-hero";
import {
  DashboardQuickActions,
  MeetingActionDialog,
  useMeetingAction,
} from "@/components/shared/dashboard-actions";

interface DashboardInteractiveHubProps {
  displayName: string;
  upcomingCount: number;
  activeCount: number;
  historyCount: number;
}

export function DashboardInteractiveHub({
  displayName,
  upcomingCount,
  activeCount,
  historyCount,
}: DashboardInteractiveHubProps) {
  const { action, openInstant, openScheduled, close } = useMeetingAction();

  return (
    <>
      <DashboardHero
        displayName={displayName}
        upcomingCount={upcomingCount}
        activeCount={activeCount}
        historyCount={historyCount}
        onOpenInstant={openInstant}
        onOpenScheduled={openScheduled}
      />

      <section aria-labelledby="quick-actions-heading" className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Start here</p>
            <h2 id="quick-actions-heading" className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Quick actions
            </h2>
          </div>
          <p className="hidden text-xs text-slate-500 md:block">
            Launch, schedule, or jump into active conversations in one click
          </p>
        </div>
        <DashboardQuickActions onOpenInstant={openInstant} onOpenScheduled={openScheduled} />
      </section>

      <MeetingActionDialog action={action} close={close} />
    </>
  );
}
