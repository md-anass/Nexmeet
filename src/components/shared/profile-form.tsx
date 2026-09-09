"use client";

import { useActionState } from "react";
import { AlertCircle, Check, LockKeyhole, UserRound } from "lucide-react";
import { updateProfile, type ProfileActionState } from "@/app/(app)/profile/actions";
import { Spinner } from "@/components/ui";

const initialState: ProfileActionState = { error: "", success: "" };

interface ProfileFormProps {
  displayName: string;
  email: string;
}

export function ProfileForm({ displayName, email }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="space-y-6" aria-busy={pending}>
      {/* Display Name Field */}
      <div className="space-y-2">
        <label
          htmlFor="display-name-input"
          className="block text-sm font-semibold text-slate-800"
        >
          Display name
        </label>
        <div className="relative">
          <input
            id="display-name-input"
            name="displayName"
            type="text"
            defaultValue={displayName}
            maxLength={100}
            autoComplete="name"
            required
            placeholder="e.g. Alex Morgan"
            className="h-11 sm:h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <p className="text-xs text-slate-500">
          This name appears in meeting waiting rooms, participant lists, and invite links.
        </p>
      </div>

      {/* Read-only Email Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="email-readonly-input"
            className="block text-sm font-semibold text-slate-800"
          >
            Email address
          </label>
          <span className="inline-flex items-center gap-1 text-[0.7rem] text-slate-400">
            <LockKeyhole className="size-3" aria-hidden="true" />
            <span>Read-only</span>
          </span>
        </div>
        <input
          id="email-readonly-input"
          type="email"
          value={email}
          readOnly
          disabled
          className="h-11 sm:h-12 w-full cursor-not-allowed rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 text-sm text-slate-500 select-none"
        />
        <p className="text-xs text-slate-400">
          Your email address is managed through your authenticated NexMeet account.
        </p>
      </div>

      {/* Inline Feedback */}
      {state.error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3 text-xs font-medium text-red-800"
        >
          <AlertCircle className="size-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      )}

      {state.success && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs font-medium text-emerald-800"
        >
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-200 text-emerald-700">
            <Check className="size-3 stroke-[3]" aria-hidden="true" />
          </span>
          <span>{state.success}</span>
        </div>
      )}

      {/* Submit Action */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <Spinner className="size-4 text-white" label="Saving profile..." />
              <span>Saving changes...</span>
            </>
          ) : (
            <>
              <UserRound className="size-4" aria-hidden="true" />
              <span>Save changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
