"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MeetingActionState = { error: string };

const ALLOWED_ACCESS_MODES = ["everyone", "approval_required"] as const;

export async function createMeeting(_: MeetingActionState, formData: FormData): Promise<MeetingActionState> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title || title.length > 120) return { error: "Enter a meeting title using 120 characters or fewer." };
  const requestedAccessMode = String(formData.get("access_mode") ?? "");
  const accessMode = ALLOWED_ACCESS_MODES.includes(requestedAccessMode as (typeof ALLOWED_ACCESS_MODES)[number])
    ? requestedAccessMode as (typeof ALLOWED_ACCESS_MODES)[number]
    : "everyone";
  const requirePassword = formData.get("require_password") === "on";
  const password = requirePassword ? String(formData.get("password") ?? "") : null;
  const confirmPassword = requirePassword ? String(formData.get("confirm_password") ?? "") : null;
  if (requirePassword && (!password || !confirmPassword || password.length < 4 || password.length > 128 || password !== confirmPassword)) {
    return { error: "Enter matching meeting passwords between 4 and 128 characters." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Meetings are not configured yet." };

  const { data, error } = await supabase.rpc("create_meeting", {
    requested_title: title,
    requested_access_mode: accessMode,
    requested_password: password,
  }).maybeSingle();
  const publicCode = data && typeof (data as { public_code?: unknown }).public_code === "string" ? (data as { public_code: string }).public_code : null;
  if (!error && publicCode) redirect(`/m/${publicCode}`);
  return { error: "We could not create your meeting. Please try again." };
}
