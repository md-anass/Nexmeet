"use client";

import { useActionState, useState } from "react";
import { cancelScheduledMeeting, type MeetingActionState } from "@/app/(app)/dashboard/actions";

const initialState: MeetingActionState = { error: "" };

export function CancelScheduledMeetingForm({ publicCode }: { publicCode: string }) {
  const [state, formAction, pending] = useActionState(cancelScheduledMeeting, initialState);
  const [confirming, setConfirming] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setConfirming(true)} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Cancel</button>
      {confirming && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby={`cancel-${publicCode}`}><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id={`cancel-${publicCode}`} className="text-xl font-semibold text-slate-950">Cancel scheduled meeting?</h2><p className="mt-2 text-sm text-slate-600">Participants will no longer be able to join from this invite.</p><form action={formAction} className="mt-6 flex flex-wrap justify-end gap-2"><input type="hidden" name="public_code" value={publicCode} /><button type="button" onClick={() => setConfirming(false)} disabled={pending} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Keep meeting</button><button type="submit" disabled={pending} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60">{pending ? "Cancelling..." : "Cancel meeting"}</button></form>{state.error && <p role="alert" className="mt-3 text-sm text-red-700">{state.error}</p>}</div></div>}
    </div>
  );
}
