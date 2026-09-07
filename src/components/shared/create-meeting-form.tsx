"use client";

import { useActionState } from "react";
import { createMeeting, type MeetingActionState } from "@/app/(app)/dashboard/actions";

const initialState: MeetingActionState = { error: "" };

export function CreateMeetingForm() {
  const [state, formAction, pending] = useActionState(createMeeting, initialState);

  return (
    <form action={formAction} className="mt-6 max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <label className="block text-sm font-medium text-slate-700">
        Meeting title
        <input name="title" type="text" maxLength={120} placeholder="Weekly Study Session" required className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10" />
      </label>
      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-slate-700">Who can join?</legend>
        <div className="mt-2 grid gap-2">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-white p-3 has-[:checked]:border-slate-900 has-[:checked]:ring-2 has-[:checked]:ring-slate-900/10">
            <input name="access_mode" type="radio" value="everyone" defaultChecked className="mt-1 accent-slate-950" />
            <span><span className="block text-sm font-medium text-slate-900">Everyone can join</span><span className="mt-1 block text-xs text-slate-500">Anyone with the meeting link can join directly.</span></span>
          </label>
          <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-white p-3 has-[:checked]:border-slate-900 has-[:checked]:ring-2 has-[:checked]:ring-slate-900/10">
            <input name="access_mode" type="radio" value="approval_required" className="mt-1 accent-slate-950" />
            <span><span className="block text-sm font-medium text-slate-900">Host approval required</span><span className="mt-1 block text-xs text-slate-500">Participants must request approval before entering.</span></span>
          </label>
        </div>
      </fieldset>
      {state.error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="mt-4 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Creating..." : "Create meeting"}</button>
    </form>
  );
}
