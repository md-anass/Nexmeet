"use client";

import { useActionState } from "react";
import { joinMeeting } from "@/app/m/[code]/actions";
import type { GuestJoinActionState } from "@/types/participant-session";

const initialState: GuestJoinActionState = { error: "" };

export function GuestJoinForm({ meetingCode }: { meetingCode: string }) {
  const [state, formAction, pending] = useActionState(joinMeeting, initialState);

  return (
    <form action={formAction} className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <input type="hidden" name="meetingCode" value={meetingCode} />
      <label className="block text-sm font-medium text-slate-700">
        Your name
        <input name="displayName" type="text" maxLength={80} placeholder="Enter your name" autoComplete="name" required className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10" />
      </label>
      {state.error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="mt-4 w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Joining..." : "Join meeting"}</button>
    </form>
  );
}
