"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  History,
  Radio,
  Video,
  X,
} from "lucide-react";
import { CreateMeetingForm } from "@/components/shared/create-meeting-form";
import { ScheduleMeetingForm } from "@/components/shared/schedule-meeting-form";
import { Button, DialogBackdrop, DialogPanel } from "@/components/ui";
import { cn } from "@/lib/utils";

export type MeetingAction = "instant" | "scheduled" | null;

export function MeetingActionDialog({
  action,
  close,
}: {
  action: MeetingAction;
  close: () => void;
}) {
  useEffect(() => {
    if (!action) return;
    const previousOverflow = document.body.style.overflow;
    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        const panel = document.querySelector<HTMLElement>("[data-meeting-action-dialog]");
        const focusable = panel
          ? Array.from(
              panel.querySelectorAll<HTMLElement>(
                'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
              ),
            )
          : [];
        const first = focusable[0];
        const last = focusable.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [action, close]);

  if (!action) return null;

  return (
    <DialogBackdrop
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="nm-dialog-enter"
    >
      <DialogPanel
        data-meeting-action-dialog
        aria-label={action === "instant" ? "Start an instant meeting" : "Schedule a meeting"}
        className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto p-4 sm:p-5"
      >
        <div className="sticky top-0 z-10 -mx-1 mb-1 flex justify-end bg-[rgb(var(--nm-surface))] px-1 pb-1">
          <Button
            type="button"
            variant="icon"
            onClick={close}
            aria-label="Close meeting form"
            autoFocus
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
        {action === "instant" ? <CreateMeetingForm embedded /> : <ScheduleMeetingForm embedded />}
      </DialogPanel>
    </DialogBackdrop>
  );
}

export function useMeetingAction() {
  const [action, setAction] = useState<MeetingAction>(null);
  const openInstant = useCallback(() => setAction("instant"), []);
  const openScheduled = useCallback(() => setAction("scheduled"), []);
  const close = useCallback(() => setAction(null), []);
  return { action, openInstant, openScheduled, close };
}

export function DashboardHeroActions({ compact = false }: { compact?: boolean }) {
  const controls = useMeetingAction();

  return (
    <>
      <div className={cn("flex gap-3", compact ? "flex-col sm:flex-row" : "flex-col sm:flex-row")}>
        <button
          type="button"
          onClick={controls.openInstant}
          className={cn(
            "group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0",
            compact ? "px-4 py-2.5 text-xs" : "px-5 py-3 text-sm",
          )}
        >
          <Video className="size-4 transition-transform group-hover:scale-110" aria-hidden="true" />
          <span>Start instant meeting</span>
        </button>

        <button
          type="button"
          onClick={controls.openScheduled}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 active:translate-y-0",
            compact ? "px-4 py-2.5 text-xs" : "px-5 py-3 text-sm",
          )}
        >
          <CalendarClock className="size-4 text-slate-500" aria-hidden="true" />
          <span>Schedule meeting</span>
        </button>
      </div>

      <MeetingActionDialog action={controls.action} close={controls.close} />
    </>
  );
}

interface DashboardQuickActionsProps {
  onOpenInstant?: () => void;
  onOpenScheduled?: () => void;
}

export function DashboardQuickActions({
  onOpenInstant,
  onOpenScheduled,
}: DashboardQuickActionsProps) {
  const internalControls = useMeetingAction();
  const handleInstant = onOpenInstant || internalControls.openInstant;
  const handleScheduled = onOpenScheduled || internalControls.openScheduled;

  return (
    <>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Quick Action 1: Start a meeting (blue) */}
        <button
          type="button"
          onClick={handleInstant}
          className="group flex min-h-[5.75rem] items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_12px_24px_rgba(37,99,235,0.08)]"
        >
          <div className="flex items-center gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-transform duration-200 group-hover:scale-105 group-hover:bg-blue-100/70">
              <Video className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                Start a meeting
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                Instant room & invite link
              </span>
            </div>
          </div>
          <ArrowRight
            className="size-4 shrink-0 text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-blue-600"
            aria-hidden="true"
          />
        </button>

        {/* Quick Action 2: Schedule meeting (violet) */}
        <button
          type="button"
          onClick={handleScheduled}
          className="group flex min-h-[5.75rem] items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_12px_24px_rgba(139,92,246,0.08)]"
        >
          <div className="flex items-center gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600 transition-transform duration-200 group-hover:scale-105 group-hover:bg-violet-100/70">
              <CalendarClock className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                Schedule meeting
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                Plan date, time & security
              </span>
            </div>
          </div>
          <ArrowRight
            className="size-4 shrink-0 text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-violet-600"
            aria-hidden="true"
          />
        </button>

        {/* Quick Action 3: Active meetings (cyan) */}
        <Link
          href="/dashboard/active"
          className="group flex min-h-[5.75rem] items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-[0_12px_24px_rgba(6,182,212,0.08)]"
        >
          <div className="flex items-center gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-600 transition-transform duration-200 group-hover:scale-105 group-hover:bg-cyan-100/70">
              <Radio className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors">
                Active meetings
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                Jump into active rooms
              </span>
            </div>
          </div>
          <ArrowRight
            className="size-4 shrink-0 text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-cyan-600"
            aria-hidden="true"
          />
        </Link>

        {/* Quick Action 4: View history (slate/indigo) */}
        <Link
          href="/dashboard/history"
          className="group flex min-h-[5.75rem] items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_12px_24px_rgba(99,102,241,0.08)]"
        >
          <div className="flex items-center gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 transition-transform duration-200 group-hover:scale-105 group-hover:bg-indigo-100/70">
              <History className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                View history
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                Review past conversations
              </span>
            </div>
          </div>
          <ArrowRight
            className="size-4 shrink-0 text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-indigo-600"
            aria-hidden="true"
          />
        </Link>
      </div>

      {!onOpenInstant && (
        <MeetingActionDialog
          action={internalControls.action}
          close={internalControls.close}
        />
      )}
    </>
  );
}
