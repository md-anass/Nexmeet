"use client";

import { useActionState, useEffect, useState } from "react";
import { startScheduledMeeting, type ScheduledMeetingActionState } from "@/app/m/[code]/actions";

const initialState: ScheduledMeetingActionState = { error: "" };
const EARLY_START_MS = 15 * 60 * 1000;

export function StartScheduledMeetingForm({ meetingCode, scheduledFor }: { meetingCode: string; scheduledFor: string }) {
  const [state, formAction, pending] = useActionState(startScheduledMeeting, initialState);
  const [canStart, setCanStart] = useState(false);

  useEffect(() => {
    const updateAvailability = () => setCanStart(Date.now() >= Date.parse(scheduledFor) - EARLY_START_MS);
    const timeout = window.setTimeout(updateAvailability, 0);
    const interval = window.setInterval(() => setCanStart(Date.now() >= Date.parse(scheduledFor) - EARLY_START_MS), 30_000);
    return () => { window.clearTimeout(timeout); window.clearInterval(interval); };
  }, [scheduledFor]);

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="meetingCode" value={meetingCode} />
      <button type="submit" disabled={!canStart || pending} className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Starting..." : "Start Meeting"}</button>
      {!canStart && <p className="mt-3 text-center text-xs text-slate-500">You can start this meeting up to 15 minutes early.</p>}
      {state.error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
