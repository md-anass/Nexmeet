"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NexMeetBrand } from "@/components/brand/nexmeet-brand";
import { ParticipantMeeting } from "@/components/meeting/participant-meeting";
import { formatMeetingDuration } from "@/lib/meeting-lifecycle";

type WaitingState = "loading" | "waiting" | "admitted" | "rejected" | "ended" | "error";
type LifecycleResponse = { status?: unknown; startedAt?: unknown; endedAt?: unknown };

export function WaitingRoomGate({ meetingCode, meetingTitle, displayName, startedAt, shareLink }: { meetingCode: string; meetingTitle: string; displayName: string; startedAt: string | null; shareLink: string }) {
  const router = useRouter();
  const [state, setState] = useState<WaitingState>("loading");
  const [lifecycle, setLifecycle] = useState({ startedAt, endedAt: null as string | null });
  const stateRef = useRef(state);

  useEffect(() => {
    let disposed = false;
    let statusInFlight = false;
    let lifecycleInFlight = false;
    let requestAttempted = false;

    function applyStatus(status: unknown) {
      if (disposed || stateRef.current === "ended") return;
      const next = status === "pending" ? "waiting" : status === "admitted" || status === "rejected" ? status : "error";
      stateRef.current = next;
      setState(next);
    }

    async function readLifecycle() {
      if (lifecycleInFlight || disposed) return;
      lifecycleInFlight = true;
      try {
        const response = await fetch(`/api/meetings/${meetingCode}/meeting-status`, { cache: "no-store" });
        if (!response.ok || disposed) return;
        const result = (await response.json()) as LifecycleResponse;
        if (disposed) return;
        const nextStartedAt = typeof result.startedAt === "string" ? result.startedAt : null;
        const nextEndedAt = typeof result.endedAt === "string" ? result.endedAt : null;
        setLifecycle({ startedAt: nextStartedAt, endedAt: nextEndedAt });
        if (result.status === "ended") {
          stateRef.current = "ended";
          setState("ended");
        }
      } catch {
        // Waiting-room polling can retry after a transient status failure.
      } finally {
        lifecycleInFlight = false;
      }
    }

    async function readWaitingStatus() {
      if (statusInFlight || disposed) return;
      statusInFlight = true;
      try {
        const response = await fetch(`/api/meetings/${meetingCode}/waiting-room/status`, { cache: "no-store" });
        if (disposed) return;
        if (response.ok) {
          const result = (await response.json()) as { status?: unknown };
          if (disposed) return;
          if (result.status === "not_requested" && !requestAttempted) {
            requestAttempted = true;
            const requestResponse = await fetch(`/api/meetings/${meetingCode}/waiting-room/request`, { method: "POST" });
            if (disposed) return;
            if (requestResponse.ok) {
              const requested = (await requestResponse.json()) as { status?: unknown };
              applyStatus(requested.status);
            } else if (requestResponse.status < 500) {
              applyStatus("error");
            }
          } else {
            applyStatus(result.status);
          }
          return;
        }
        if (response.status < 500) applyStatus("error");
      } catch {
        // Preserve pending state and retry reads after temporary network failures.
      } finally {
        statusInFlight = false;
      }
    }

    void readLifecycle();
    void readWaitingStatus();
    const interval = window.setInterval(() => {
      if (["admitted", "rejected", "ended", "error"].includes(stateRef.current)) return;
      void readLifecycle();
      if (stateRef.current !== "admitted" && stateRef.current !== "rejected" && stateRef.current !== "ended" && stateRef.current !== "error") void readWaitingStatus();
    }, 2000);
    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [meetingCode]);

  if (state === "admitted") {
    return <ParticipantMeeting meetingCode={meetingCode} meetingTitle={meetingTitle} displayName={displayName} startedAt={lifecycle.startedAt} accessMode="approval_required" autoJoin shareLink={shareLink} />;
  }

  return <main className="flex min-h-[100dvh] items-center justify-center bg-[#020817] px-5 py-10 text-white"><div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-center shadow-2xl sm:p-10"><NexMeetBrand className="justify-center" /><p className="mt-8 text-sm font-medium text-cyan-300">{meetingTitle}</p>{state === "ended" ? <><h1 className="mt-2 text-3xl font-semibold">Meeting ended</h1><p className="mt-5 text-sm text-slate-400">Total duration</p><p className="mt-1 text-3xl font-semibold tabular-nums">{formatMeetingDuration(lifecycle.startedAt, lifecycle.endedAt) ?? "Calculating duration..."}</p></> : state === "rejected" ? <><h1 className="mt-2 text-3xl font-semibold">Request declined</h1><p className="mt-4 text-sm text-slate-400">Your request to join was declined.</p></> : state === "error" ? <><h1 className="mt-2 text-3xl font-semibold">Unable to join</h1><p className="mt-4 text-sm text-slate-400">Your meeting request could not be loaded. Please try again.</p></> : <><h1 className="mt-2 text-3xl font-semibold">Waiting for the host</h1><p className="mt-4 text-sm text-slate-400">Waiting for the host to let you in.</p><p className="mt-2 text-sm text-slate-500">{displayName}</p></>}<button type="button" onClick={() => router.push("/")} className="mt-8 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200">{state === "waiting" || state === "loading" ? "Leave" : "Back"}</button></div></main>;
}
