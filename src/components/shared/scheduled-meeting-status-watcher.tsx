"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 2_500;

export function ScheduledMeetingStatusWatcher({ meetingCode }: { meetingCode: string }) {
  const router = useRouter();
  const transitionStarted = useRef(false);

  useEffect(() => {
    let disposed = false;

    async function pollStatus() {
      if (disposed || transitionStarted.current || document.visibilityState === "hidden") return;
      try {
        const response = await fetch(`/api/meetings/${meetingCode}/meeting-status`, { cache: "no-store" });
        if (!response.ok || disposed) return;
        const result = await response.json() as { status?: unknown };
        if (result.status !== "active" && result.status !== "cancelled" && result.status !== "ended") return;
        transitionStarted.current = true;
        router.refresh();
      } catch {
        // Keep the scheduled screen and retry after a transient status failure.
      }
    }

    const interval = window.setInterval(() => void pollStatus(), POLL_INTERVAL_MS);
    const handleVisibilityChange = () => { if (document.visibilityState === "visible") void pollStatus(); };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    void pollStatus();

    return () => {
      disposed = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [meetingCode, router]);

  return null;
}
