"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProfileActionState = { error: string; success: string };

function logSupabaseError(stage: string, error: { message: string; code?: string; details?: string; hint?: string } | null) {
  console.error(`Profile update ${stage} failed`, {
    message: error?.message ?? "",
    code: error?.code ?? "",
    details: error?.details ?? "",
    hint: error?.hint ?? "",
  });
}

export async function updateProfile(_: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName || displayName.length > 100) return { error: "Enter a display name using 100 characters or fewer.", success: "" };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured yet.", success: "" };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    logSupabaseError("authentication", userError);
    return { error: "Your session has expired. Please sign in again.", success: "" };
  }

  const authUserId = userData.user.id;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", authUserId)
    .maybeSingle();

  console.info("Profile update identity check", {
    authUserPresent: true,
    authUserId,
    profileRowPresent: Boolean(profile),
    profileIdMatchesAuthUser: profile?.id === authUserId,
  });

  if (profileError) {
    logSupabaseError("profile lookup", profileError);
    return { error: "We could not update your profile. Please try again.", success: "" };
  }
  if (!profile) {
    console.error("Profile update profile lookup failed", {
      message: "No profile row matched the authenticated user.",
      code: "NO_PROFILE_ROW",
      details: `No public.profiles row matched id ${authUserId}.`,
      hint: "Verify the auth user trigger created the profile row.",
    });
    return { error: "We could not update your profile. Please try again.", success: "" };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", authUserId);

  if (updateError) {
    logSupabaseError("UPDATE", updateError);
    return { error: "We could not update your profile. Please try again.", success: "" };
  }

  const { data: updatedProfile, error: verificationError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", authUserId)
    .maybeSingle();

  if (verificationError) {
    logSupabaseError("post-update verification SELECT", verificationError);
    return { error: "We could not update your profile. Please try again.", success: "" };
  }
  if (!updatedProfile) {
    logSupabaseError("post-update verification SELECT", {
      message: "The profile row was not returned after UPDATE.",
      code: "NO_PROFILE_ROW_AFTER_UPDATE",
      details: "The UPDATE returned no error, but the owner row could not be read afterward.",
      hint: "Check the SELECT policy and profile row identity.",
    });
    return { error: "We could not update your profile. Please try again.", success: "" };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { error: "", success: "Profile updated successfully." };
}
