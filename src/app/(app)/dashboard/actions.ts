"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, getAuthenticatedUser } from "@/lib/supabase/server";

export type MeetingActionState = { error: string };

const ALLOWED_ACCESS_MODES = ["everyone", "approval_required"] as const;
type MeetingFields = { title: string; accessMode: (typeof ALLOWED_ACCESS_MODES)[number]; password: string | null };

function meetingFields(formData: FormData): MeetingFields | MeetingActionState {
  const title = String(formData.get("title") ?? "").trim();
  if (!title || title.length > 120) return { error: "Enter a meeting title using 120 characters or fewer." } as const;
  const requestedAccessMode = String(formData.get("access_mode") ?? "");
  const accessMode = ALLOWED_ACCESS_MODES.includes(requestedAccessMode as (typeof ALLOWED_ACCESS_MODES)[number])
    ? requestedAccessMode as (typeof ALLOWED_ACCESS_MODES)[number]
    : "everyone";
  const requirePassword = formData.get("require_password") === "on";
  const password = requirePassword ? String(formData.get("password") ?? "") : null;
  const confirmPassword = requirePassword ? String(formData.get("confirm_password") ?? "") : null;
  if (requirePassword && (!password || !confirmPassword || password.length < 4 || password.length > 128 || password !== confirmPassword)) {
    return { error: "Enter matching meeting passwords between 4 and 128 characters." } as const;
  }
  return { title, accessMode, password } as const;
}

function publicCodeFromRpc(data: unknown) {
  if (typeof data === "string") return data;
  const candidate = Array.isArray(data) ? data[0] : data;
  return candidate && typeof candidate === "object" && typeof (candidate as { public_code?: unknown }).public_code === "string"
    ? (candidate as { public_code: string }).public_code
    : null;
}

export async function createMeeting(_: MeetingActionState, formData: FormData): Promise<MeetingActionState> {
  const fields = meetingFields(formData);
  if ("error" in fields) return { error: fields.error };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Meetings are not configured yet." };

  const { data, error } = await supabase.rpc("create_meeting", {
    requested_title: fields.title,
    requested_access_mode: fields.accessMode,
    requested_password: fields.password,
  }).maybeSingle();
  const publicCode = publicCodeFromRpc(data);
  if (!error && publicCode) redirect(`/m/${publicCode}`);
  return { error: "We could not create your meeting. Please try again." };
}

export async function createScheduledMeeting(_: MeetingActionState, formData: FormData): Promise<MeetingActionState> {
  const fields = meetingFields(formData);
  if ("error" in fields) return { error: fields.error };
  const scheduledFor = String(formData.get("scheduled_for") ?? "");
  const scheduledTimestamp = Date.parse(scheduledFor);
  if (!scheduledFor || !Number.isFinite(scheduledTimestamp) || new Date(scheduledTimestamp).toISOString() !== scheduledFor || scheduledTimestamp <= Date.now()) {
    return { error: "Choose a valid future date and time." };
  }
  if (!await getAuthenticatedUser()) return { error: "Sign in to schedule a meeting." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Meetings are not configured yet." };
  const { data, error } = await supabase.rpc("create_scheduled_meeting", {
    requested_title: fields.title,
    requested_access_mode: fields.accessMode,
    requested_password: fields.password,
    requested_scheduled_for: scheduledFor,
  });
  const publicCode = publicCodeFromRpc(data);
  if (!error && publicCode) redirect(`/m/${publicCode}`);
  return { error: "We could not schedule your meeting. Please try again." };
}

export async function cancelScheduledMeeting(_: MeetingActionState, formData: FormData): Promise<MeetingActionState> {
  const publicCode = String(formData.get("public_code") ?? "");
  if (!/^[a-z0-9]{10,16}$/.test(publicCode)) return { error: "This meeting is unavailable." };
  if (!await getAuthenticatedUser()) return { error: "Sign in to cancel this meeting." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Meetings are not configured yet." };
  const { data, error } = await supabase.rpc("cancel_scheduled_meeting", { requested_public_code: publicCode });
  if (error || data !== true) return { error: "We could not cancel this meeting." };
  revalidatePath("/dashboard");
  revalidatePath(`/m/${publicCode}`);
  redirect("/dashboard");
}
