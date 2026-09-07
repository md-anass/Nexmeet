"use client";

import { useSyncExternalStore } from "react";
import { formatDashboardDateTime } from "@/lib/meeting-lifecycle";

const formatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function subscribe() {
  return () => undefined;
}

export function LocalDateTime({ value }: { value: string }) {
  const localValue = useSyncExternalStore(
    subscribe,
    () => formatter.format(new Date(value)),
    () => formatDashboardDateTime(value),
  );

  return <time dateTime={value}>{localValue}</time>;
}
