import { LockKeyhole, UserCheck, UsersRound } from "lucide-react";
import { Input } from "@/components/ui";

export function MeetingAccessFields({ scheduled = false }: { scheduled?: boolean }) {
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-sm font-semibold text-[rgb(var(--nm-text-primary))]">Who can join?</legend>
        <p className="mt-1 text-xs leading-5 text-[rgb(var(--nm-text-muted))]">Choose how people enter this meeting.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="group flex min-h-24 cursor-pointer gap-3 rounded-[var(--nm-radius-md)] border border-[rgb(var(--nm-border))] bg-[rgb(var(--nm-surface))] p-4 transition-[border-color,box-shadow,background-color] hover:border-[rgb(var(--nm-border-strong))] has-[:checked]:border-[rgb(var(--nm-accent-blue))] has-[:checked]:bg-blue-50/60 has-[:checked]:ring-2 has-[:checked]:ring-[rgb(var(--nm-accent-blue)/0.12)]">
            <input name="access_mode" type="radio" value="everyone" defaultChecked className="mt-1 size-4 shrink-0 accent-blue-600" />
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--nm-text-primary))]"><UsersRound className="size-4 text-blue-600" aria-hidden="true" />Everyone</span>
              <span className="mt-1.5 block text-xs leading-5 text-[rgb(var(--nm-text-muted))]">Anyone with the invite can join {scheduled ? "after it starts" : "directly"}.</span>
            </span>
          </label>
          <label className="group flex min-h-24 cursor-pointer gap-3 rounded-[var(--nm-radius-md)] border border-[rgb(var(--nm-border))] bg-[rgb(var(--nm-surface))] p-4 transition-[border-color,box-shadow,background-color] hover:border-[rgb(var(--nm-border-strong))] has-[:checked]:border-[rgb(var(--nm-accent-violet))] has-[:checked]:bg-violet-50/60 has-[:checked]:ring-2 has-[:checked]:ring-[rgb(var(--nm-accent-violet)/0.12)]">
            <input name="access_mode" type="radio" value="approval_required" className="mt-1 size-4 shrink-0 accent-violet-600" />
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--nm-text-primary))]"><UserCheck className="size-4 text-violet-600" aria-hidden="true" />Approval required</span>
              <span className="mt-1.5 block text-xs leading-5 text-[rgb(var(--nm-text-muted))]">You decide who enters from the waiting room.</span>
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-[var(--nm-radius-md)] border border-[rgb(var(--nm-border))] bg-[rgb(var(--nm-surface-secondary)/0.55)] p-4">
        <label className="flex min-h-6 cursor-pointer items-center gap-3 text-sm font-semibold text-[rgb(var(--nm-text-primary))]">
          <input name="require_password" type="checkbox" className="size-4 rounded accent-blue-600" />
          <LockKeyhole className="size-4 text-[rgb(var(--nm-text-muted))]" aria-hidden="true" />
          Add a meeting password
        </label>
        <p className="ml-11 mt-1 text-xs leading-5 text-[rgb(var(--nm-text-muted))]">Guests will enter it before they can continue.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-[rgb(var(--nm-text-secondary))]">Password<Input name="password" type="password" minLength={4} maxLength={128} autoComplete="new-password" placeholder="4–128 characters" className="mt-2 bg-white" /></label>
          <label className="text-xs font-semibold text-[rgb(var(--nm-text-secondary))]">Confirm password<Input name="confirm_password" type="password" minLength={4} maxLength={128} autoComplete="new-password" placeholder="Repeat password" className="mt-2 bg-white" /></label>
        </div>
        <p className="mt-2 text-xs text-[rgb(var(--nm-text-muted))]">Passwords are case-sensitive.</p>
      </fieldset>
    </div>
  );
}
