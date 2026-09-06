"use client";

import { useEffect, useState } from "react";

function elapsedSeconds(startedAt: string | null) {
  if (!startedAt) return 0;
  const startedTime = Date.parse(startedAt);
  if (!Number.isFinite(startedTime)) return 0;
  return Math.max(0, Math.floor((Date.now() - startedTime) / 1000));
}

function formatElapsed(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours > 0
    ? [hours, minutes, remainder].map((value) => String(value).padStart(2, "0")).join(":")
    : [minutes, remainder].map((value) => String(value).padStart(2, "0")).join(":");
}

export function MeetingTimer({ startedAt }: { startedAt: string | null }) {
  const [seconds, setSeconds] = useState(() => elapsedSeconds(startedAt));

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds(elapsedSeconds(startedAt)), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  return <span aria-label={`Meeting duration ${formatElapsed(seconds)}`} className="tabular-nums text-xs font-medium text-slate-300">{formatElapsed(seconds)}</span>;
}
