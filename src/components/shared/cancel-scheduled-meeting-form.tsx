"use client";

import { useActionState, useState } from "react";
import { cancelScheduledMeeting, type MeetingActionState } from "@/app/(app)/dashboard/actions";
import { Alert, Button, DialogBackdrop, DialogPanel } from "@/components/ui";

const initialState: MeetingActionState = { error: "" };

export function CancelScheduledMeetingForm({ publicCode }: { publicCode: string }) {
  const [state, formAction, pending] = useActionState(cancelScheduledMeeting, initialState);
  const [confirming, setConfirming] = useState(false);

  return (
    <div>
      <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(true)} className="text-red-700 hover:bg-red-50 hover:text-red-800">Cancel</Button>
      {confirming && <DialogBackdrop><DialogPanel aria-labelledby={`cancel-${publicCode}`}><h2 id={`cancel-${publicCode}`} className="nm-section-heading">Cancel scheduled meeting?</h2><p className="nm-body-secondary mt-2">Participants will no longer be able to join from this invite.</p><form action={formAction} className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><input type="hidden" name="public_code" value={publicCode} /><Button type="button" variant="secondary" onClick={() => setConfirming(false)} disabled={pending}>Keep meeting</Button><Button type="submit" variant="destructive" disabled={pending}>{pending ? "Cancelling..." : "Cancel meeting"}</Button></form>{state.error && <Alert tone="error" className="mt-3">{state.error}</Alert>}</DialogPanel></DialogBackdrop>}
    </div>
  );
}
