export type MeetingLifecycle = {
  status: "active" | "scheduled" | "ended" | "cancelled";
  startedAt: string | null;
  endedAt: string | null;
  scheduledFor: string | null;
  cancelledAt: string | null;
};

export type PublicMeeting = MeetingLifecycle & {
  title: string;
  publicCode: string;
  hostDisplayName: string | null;
  accessMode: "everyone" | "approval_required";
  requiresPassword: boolean;
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
  if (!row) return null;
  const status = typeof row.status === "string" ? row.status : null;
  if (status !== "active" && status !== "scheduled" && status !== "ended" && status !== "cancelled") return null;
  return {
    status,
    startedAt: validTimestamp(row.started_at),
    endedAt: validTimestamp(row.ended_at),
    scheduledFor: validTimestamp(row.scheduled_for),
    cancelledAt: validTimestamp(row.cancelled_at),
  };
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
    requiresPassword: row.requires_password === true,
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

export function formatDashboardDuration(startedAt: string | null, endedAt: string | null) {
  if (!startedAt || !endedAt) return "—";
  const seconds = Math.max(0, Math.floor((Date.parse(endedAt) - Date.parse(startedAt)) / 1000));
  const hours = Math.floor(seconds / 3600); const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours} hr${hours === 1 ? "" : "s"}${minutes ? ` ${minutes} min` : ""}` : `${minutes} min`;
}

export function formatDashboardDateTime(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(timestamp);
}
