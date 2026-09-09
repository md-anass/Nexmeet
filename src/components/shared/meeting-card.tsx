"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, CalendarClock, Check, Clock3, Copy, History, Link2, LockKeyhole, ShieldCheck, Video } from "lucide-react";
import { CancelScheduledMeetingForm } from "@/components/shared/cancel-scheduled-meeting-form";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { Badge, Button, buttonStyles } from "@/components/ui";
import { formatDashboardDateTime, formatDashboardDuration } from "@/lib/meeting-lifecycle";

type Meeting = { public_code: string; title: string; status: "active" | "scheduled" | "ended" | "cancelled"; created_at: string; started_at: string | null; ended_at: string | null; scheduled_for: string | null; cancelled_at: string | null; access_mode: string; requires_password: boolean };

const statusPresentation = {
  active: { label: "Active", tone: "success" as const, icon: Video },
  scheduled: { label: "Scheduled", tone: "info" as const, icon: CalendarClock },
  ended: { label: "Ended", tone: "neutral" as const, icon: History },
  cancelled: { label: "Cancelled", tone: "destructive" as const, icon: History },
};

export function MeetingCard({ meeting, featured = false, compact = false }: { meeting: Meeting; featured?: boolean; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const link = `/m/${meeting.public_code}`;
  const presentation = statusPresentation[meeting.status];
  const StatusIcon = presentation.icon;
  const actionLabel = meeting.status === "active" ? "Join meeting" : meeting.status === "scheduled" ? "View meeting" : "View details";

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${link}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <article className={`group relative overflow-hidden rounded-[var(--nm-radius-lg)] border bg-[rgb(var(--nm-surface))] ${compact ? "p-5 sm:p-6" : "p-6 sm:p-7"} transition-[border-color,box-shadow,transform] duration-[var(--nm-duration-base)] hover:-translate-y-0.5 hover:border-[rgb(var(--nm-border-strong))] hover:shadow-[var(--nm-shadow-sm)] ${featured ? "border-[rgb(var(--nm-accent-blue)/0.35)] shadow-[var(--nm-shadow-sm)]" : "border-[rgb(var(--nm-border))]"}`}>
      {featured && <div aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,rgb(var(--nm-accent-cyan)),rgb(var(--nm-accent-blue)),rgb(var(--nm-accent-violet)))]" />}
      <div className="flex items-start gap-4">
        <span className={`grid ${compact ? "size-11" : "size-12"} shrink-0 place-items-center rounded-[var(--nm-radius-md)] ${meeting.status === "active" ? "bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100" : meeting.status === "scheduled" ? "bg-violet-50 text-violet-600 ring-1 ring-violet-100" : "bg-[rgb(var(--nm-surface-secondary))] text-[rgb(var(--nm-text-muted))] ring-1 ring-[rgb(var(--nm-border))]"}`}>
          <StatusIcon className="size-[1.35rem]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="nm-card-heading truncate text-[rgb(var(--nm-text-primary))]">{meeting.title}</h3>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[rgb(var(--nm-text-muted))]">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4" aria-hidden="true" />{meeting.access_mode === "approval_required" ? "Approval required" : "Anyone with the invite"}</span>
                {meeting.requires_password && <span className="inline-flex items-center gap-1.5"><LockKeyhole className="size-4" aria-hidden="true" />Password</span>}
              </p>
            </div>
            <Badge tone={presentation.tone}>{presentation.label}</Badge>
          </div>

          <dl className={`${compact ? "mt-5" : "mt-6"} grid gap-x-7 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3`}>
            {meeting.scheduled_for && <div><dt className="nm-caption flex items-center gap-1.5"><CalendarClock className="size-3.5" aria-hidden="true" />Scheduled</dt><dd className="mt-1 font-medium text-[rgb(var(--nm-text-secondary))]"><LocalDateTime value={meeting.scheduled_for} /></dd></div>}
            {meeting.started_at && <div><dt className="nm-caption flex items-center gap-1.5"><Clock3 className="size-3.5" aria-hidden="true" />Started</dt><dd className="mt-1 font-medium text-[rgb(var(--nm-text-secondary))]">{formatDashboardDateTime(meeting.started_at)}</dd></div>}
            {meeting.ended_at && <div><dt className="nm-caption flex items-center gap-1.5"><History className="size-3.5" aria-hidden="true" />Ended</dt><dd className="mt-1 font-medium text-[rgb(var(--nm-text-secondary))]">{formatDashboardDateTime(meeting.ended_at)}</dd></div>}
            {meeting.cancelled_at && <div><dt className="nm-caption flex items-center gap-1.5"><History className="size-3.5" aria-hidden="true" />Cancelled</dt><dd className="mt-1 font-medium text-[rgb(var(--nm-text-secondary))]">{formatDashboardDateTime(meeting.cancelled_at)}</dd></div>}
            {meeting.ended_at && <div><dt className="nm-caption">Duration</dt><dd className="mt-1 font-medium text-[rgb(var(--nm-text-secondary))]">{formatDashboardDuration(meeting.started_at, meeting.ended_at)}</dd></div>}
            {!meeting.scheduled_for && !meeting.started_at && !meeting.ended_at && !meeting.cancelled_at && <div><dt className="nm-caption">Created</dt><dd className="mt-1 font-medium text-[rgb(var(--nm-text-secondary))]">{formatDashboardDateTime(meeting.created_at)}</dd></div>}
          </dl>

          <div className={`${compact ? "mt-5 pt-4" : "mt-6 pt-5"} flex flex-col gap-3 border-t border-[rgb(var(--nm-border))] sm:flex-row sm:items-center sm:justify-between`}>
            <p className="flex min-w-0 items-center gap-2 text-sm text-[rgb(var(--nm-text-muted))]"><Link2 className="size-4 shrink-0" aria-hidden="true" /><span className="truncate">Code <span className="font-mono font-semibold tracking-wide text-[rgb(var(--nm-text-secondary))]">{meeting.public_code}</span></span></p>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={link} className={buttonStyles({ variant: meeting.status === "active" || featured ? "primary" : "secondary", size: "md" })}>{actionLabel}<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
              {(meeting.status === "active" || meeting.status === "scheduled") && <Button type="button" variant="secondary" size="md" onClick={() => void copy()} aria-live="polite">{copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}{copied ? "Copied" : "Copy invite"}</Button>}
              {meeting.status === "scheduled" && <CancelScheduledMeetingForm publicCode={meeting.public_code} />}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
