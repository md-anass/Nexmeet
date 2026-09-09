"use client";

import { useActionState } from "react";
import { ArrowRight, Video } from "lucide-react";
import { createMeeting, type MeetingActionState } from "@/app/(app)/dashboard/actions";
import { MeetingAccessFields } from "@/components/shared/meeting-access-fields";
import { Alert, Button, Input } from "@/components/ui";

const initialState: MeetingActionState = { error: "" };

export function CreateMeetingForm({ embedded = false }: { embedded?: boolean }) {
  const [state, formAction, pending] = useActionState(createMeeting, initialState);

  return (
    <form action={formAction} className={embedded ? "px-1 pb-1" : "h-full rounded-[var(--nm-radius-xl)] border border-[rgb(var(--nm-border))] bg-[rgb(var(--nm-surface))] p-5 shadow-[var(--nm-shadow-sm)] sm:p-6"} aria-busy={pending}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[var(--nm-radius-md)] bg-blue-50 text-blue-600"><Video className="size-5" aria-hidden="true" /></span>
        <div><h2 className="nm-card-heading">Start an instant meeting</h2><p className="mt-1 text-sm leading-6 text-[rgb(var(--nm-text-muted))]">Create a room now and invite people when you are ready.</p></div>
      </div>
      <label className="mt-6 block text-sm font-semibold text-[rgb(var(--nm-text-primary))]">
        Meeting title
        <Input name="title" type="text" maxLength={120} placeholder="Weekly study session" required className="mt-2" />
      </label>
      <div className="mt-5"><MeetingAccessFields /></div>
      {state.error && <Alert tone="error" className="mt-4">{state.error}</Alert>}
      <Button type="submit" size="lg" disabled={pending} className="mt-5 w-full sm:w-auto">
        {pending ? "Creating..." : "Create meeting"}
        {!pending && <ArrowRight className="size-4" aria-hidden="true" />}
      </Button>
    </form>
  );
}
