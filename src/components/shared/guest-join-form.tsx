"use client";

import { useActionState } from "react";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import { joinMeeting } from "@/app/m/[code]/actions";
import type { GuestJoinActionState } from "@/types/participant-session";
import styles from "./guest-join-form.module.css";

const initialState: GuestJoinActionState = { error: "" };

export function GuestJoinForm({ meetingCode, approvalRequired = false, creatorNewMeeting = false, requiresPassword = false }: { meetingCode: string; approvalRequired?: boolean; creatorNewMeeting?: boolean; requiresPassword?: boolean }) {
  const [state, formAction, pending] = useActionState(joinMeeting, initialState);

  return (
    <form action={formAction} className={styles.lobbyForm}>
      <input type="hidden" name="meetingCode" value={meetingCode} />
      <label className={styles.label}>
        Your name
        <span className={styles.inputWrap}>
          <UserRound className={styles.inputIcon} aria-hidden="true" />
          <input name="displayName" type="text" maxLength={80} placeholder="Enter your name" autoComplete="name" required className={styles.input} />
        </span>
      </label>
      {requiresPassword && <p className={styles.note}><LockKeyhole aria-hidden="true" />This meeting requires a password after you enter your name.</p>}
      {state.error && <p role="alert" className={styles.error}>{state.error}</p>}
      <button type="submit" disabled={pending} className={styles.submit}><span>{pending ? (creatorNewMeeting ? "Starting..." : "Joining...") : creatorNewMeeting ? "Start Meeting" : approvalRequired ? "Request to Join" : "Join Meeting"}</span><ArrowRight aria-hidden="true" /></button>
    </form>
  );
}
