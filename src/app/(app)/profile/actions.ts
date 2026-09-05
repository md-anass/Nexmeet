"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProfileActionState = { error: string; success: string };

export async function updateProfile(_: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName || displayName.length > 100) return { error: "Enter a display name using 100 characters or fewer.", success: "" };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured yet.", success: "" };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { error: "Your session has expired. Please sign in again.", success: "" };

  const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", userData.user.id);
  if (error) return { error: "We could not update your profile. Please try again.", success: "" };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { error: "", success: "Profile updated successfully." };
}
