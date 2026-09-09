"use client";

import { FormEvent, useActionState, useRef, useState } from "react";
import { ArrowRight, CalendarClock } from "lucide-react";
import { createScheduledMeeting, type MeetingActionState } from "@/app/(app)/dashboard/actions";
import { MeetingAccessFields } from "@/components/shared/meeting-access-fields";
import { Alert, Button, Input } from "@/components/ui";

const initialState: MeetingActionState = { error: "" };

function localScheduleIso(dateValue: string, timeValue: string) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeValue);
  if (!dateMatch || !timeMatch) return null;
  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const value = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (
    value.getFullYear() !== year || value.getMonth() !== month - 1 || value.getDate() !== day ||
    value.getHours() !== hour || value.getMinutes() !== minute || value.getTime() <= Date.now()
  ) return null;
  return value.toISOString();
}

export function ScheduleMeetingForm({ embedded = false }: { embedded?: boolean }) {
  const [state, formAction, pending] = useActionState(createScheduledMeeting, initialState);
  const [clientError, setClientError] = useState("");
  const scheduledForRef = useRef<HTMLInputElement>(null);

  function prepareSchedule(event: FormEvent<HTMLFormElement>) {
    const form = new FormData(event.currentTarget);
    const scheduledFor = localScheduleIso(String(form.get("local_date") ?? ""), String(form.get("local_time") ?? ""));
    if (!scheduledFor) {
      event.preventDefault();
      setClientError("Choose a valid future date and time.");
      return;
    }
    if (scheduledForRef.current) scheduledForRef.current.value = scheduledFor;
    setClientError("");
  }

  return (
    <form action={formAction} onSubmit={prepareSchedule} className={embedded ? "px-1 pb-1" : "h-full rounded-[var(--nm-radius-xl)] border border-[rgb(var(--nm-border))] bg-[rgb(var(--nm-surface))] p-5 shadow-[var(--nm-shadow-sm)] sm:p-6"} aria-busy={pending}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[var(--nm-radius-md)] bg-violet-50 text-violet-600"><CalendarClock className="size-5" aria-hidden="true" /></span>
        <div><h2 className="nm-card-heading">Schedule a meeting</h2><p className="mt-1 text-sm leading-6 text-[rgb(var(--nm-text-muted))]">Plan ahead using the date and time in your current timezone.</p></div>
      </div>
      <input ref={scheduledForRef} type="hidden" name="scheduled_for" />
      <label className="mt-6 block text-sm font-semibold text-[rgb(var(--nm-text-primary))]">
        Meeting title
        <Input name="title" type="text" maxLength={120} placeholder="Weekly study session" required className="mt-2" />
      </label>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[rgb(var(--nm-text-primary))]">Date<Input name="local_date" type="date" required className="mt-2" /></label>
        <label className="text-sm font-semibold text-[rgb(var(--nm-text-primary))]">Time<Input name="local_time" type="time" required className="mt-2" /></label>
      </div>
      <div className="mt-5"><MeetingAccessFields scheduled /></div>
      {(clientError || state.error) && <Alert tone="error" className="mt-4">{clientError || state.error}</Alert>}
      <Button type="submit" size="lg" disabled={pending} className="mt-5 w-full sm:w-auto">
        {pending ? "Scheduling..." : "Schedule meeting"}
        {!pending && <ArrowRight className="size-4" aria-hidden="true" />}
      </Button>
    </form>
  );
}
