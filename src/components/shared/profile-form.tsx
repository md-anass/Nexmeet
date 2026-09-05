"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileActionState } from "@/app/(app)/profile/actions";

const initialState: ProfileActionState = { error: "", success: "" };

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="block text-sm font-medium text-slate-700">
        Display name
        <input name="displayName" defaultValue={displayName} maxLength={100} required className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10" />
      </label>
      {state.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{state.success}</p>}
      <button disabled={pending} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{pending ? "Saving..." : "Save changes"}</button>
    </form>
  );
}
