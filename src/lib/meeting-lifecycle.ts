export type MeetingLifecycle = {
  status: "active" | "ended";
  startedAt: string | null;
  endedAt: string | null;
};

export type PublicMeeting = MeetingLifecycle & {
  title: string;
  publicCode: string;
  hostDisplayName: string | null;
  accessMode: "everyone" | "approval_required";
};

function validTimestamp(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) ? value : null;
}

function firstRow(value: unknown): Record<string, unknown> | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && typeof candidate === "object" ? candidate as Record<string, unknown> : null;
}

export function normalizeMeetingLifecycle(value: unknown): MeetingLifecycle | null {
  const row = firstRow(value);
  if (!row || (row.status !== "active" && row.status !== "ended")) return null;
  return { status: row.status, startedAt: validTimestamp(row.started_at), endedAt: validTimestamp(row.ended_at) };
}

export function normalizePublicMeeting(value: unknown): PublicMeeting | null {
  const row = firstRow(value);
  const lifecycle = normalizeMeetingLifecycle(value);
  if (!row || !lifecycle || typeof row.title !== "string" || typeof row.public_code !== "string") return null;
  return {
    ...lifecycle,
    title: row.title,
    publicCode: row.public_code,
    hostDisplayName: typeof row.host_display_name === "string" ? row.host_display_name : null,
    accessMode: row.access_mode === "approval_required" ? "approval_required" : "everyone",
  };
}

export function formatMeetingDuration(startedAt: string | null, endedAt: string | null) {
  if (!startedAt || !endedAt) return null;
  const durationMs = Math.max(0, Date.parse(endedAt) - Date.parse(startedAt));
  if (!Number.isFinite(durationMs)) return null;
  const seconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours > 0
    ? [hours, minutes, remainder].map((value) => String(value).padStart(2, "0")).join(":")
    : [minutes, remainder].map((value) => String(value).padStart(2, "0")).join(":");
}
