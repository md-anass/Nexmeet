"use client";
import Link from "next/link";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { formatDashboardDateTime, formatDashboardDuration } from "@/lib/meeting-lifecycle";
import { CancelScheduledMeetingForm } from "@/components/shared/cancel-scheduled-meeting-form";
import { LocalDateTime } from "@/components/shared/local-date-time";

type Meeting = { public_code: string; title: string; status: "active" | "scheduled" | "ended" | "cancelled"; created_at: string; started_at: string | null; ended_at: string | null; scheduled_for: string | null; cancelled_at: string | null; access_mode: string; requires_password: boolean };

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const [copied, setCopied] = useState(false);
  const link = `/m/${meeting.public_code}`;
  const label = meeting.status === "scheduled" ? "Scheduled" : meeting.status === "cancelled" ? "Cancelled" : meeting.status === "ended" ? "Ended" : "Active";
  const sectionLabel = meeting.status === "scheduled" ? "Upcoming" : meeting.status === "active" ? "Active" : "Past";
  async function copy() { try { await navigator.clipboard.writeText(`${window.location.origin}${link}`); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch {} }
  return <article className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-semibold text-slate-950">{meeting.title}</h3><p className="mt-1 text-xs text-slate-500">{label} · {meeting.access_mode === "approval_required" ? "Approval required" : "Everyone"}{meeting.requires_password ? " · Password protected" : ""}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{sectionLabel}</span></div><dl className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2"><div><dt className="text-xs text-slate-400">Created</dt><dd>{formatDashboardDateTime(meeting.created_at)}</dd></div>{meeting.scheduled_for && <div><dt className="text-xs text-slate-400">Scheduled</dt><dd><LocalDateTime value={meeting.scheduled_for} /></dd></div>}{meeting.started_at && <div><dt className="text-xs text-slate-400">Started</dt><dd>{formatDashboardDateTime(meeting.started_at)}</dd></div>}{meeting.ended_at && <div><dt className="text-xs text-slate-400">Ended</dt><dd>{formatDashboardDateTime(meeting.ended_at)}</dd></div>}{meeting.cancelled_at && <div><dt className="text-xs text-slate-400">Cancelled</dt><dd>{formatDashboardDateTime(meeting.cancelled_at)}</dd></div>}{meeting.ended_at && <div><dt className="text-xs text-slate-400">Duration</dt><dd>{formatDashboardDuration(meeting.started_at, meeting.ended_at)}</dd></div>}</dl><p className="mt-4 text-xs text-slate-500">Code: <span className="font-semibold tracking-wide text-slate-700">{meeting.public_code}</span></p><div className="mt-4 flex flex-wrap gap-2"><Link href={link} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Open meeting</Link>{(meeting.status === "active" || meeting.status === "scheduled") && <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "Copied" : "Copy invite"}</button>}{meeting.status === "scheduled" && <CancelScheduledMeetingForm publicCode={meeting.public_code} />}</div></article>;
}
