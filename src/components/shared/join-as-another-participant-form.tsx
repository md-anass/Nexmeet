"use client";

import { useActionState } from "react";
import { joinMeeting } from "@/app/m/[code]/actions";
import type { GuestJoinActionState } from "@/types/participant-session";

const initialState: GuestJoinActionState = { error: "" };

export function JoinAsAnotherParticipantForm({ meetingCode, displayName, participantSelector }: { meetingCode: string; displayName: string; participantSelector: string }) {
  const [state, formAction, pending] = useActionState(joinMeeting, initialState);
  return <form action={formAction} className="mt-4 text-center">
    <input type="hidden" name="meetingCode" value={meetingCode} />
    <input type="hidden" name="displayName" value={displayName} />
    <input type="hidden" name="joinIntent" value="new_participant" />
    <input type="hidden" name="participantSelector" value={participantSelector} />
    {state.error && <p role="alert" className="mb-2 text-sm text-red-700">{state.error}</p>}
    <button type="submit" disabled={pending} className="text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-950 disabled:opacity-60">
      {pending ? "Joining..." : "Join as another participant"}
    </button>
  </form>;
}
