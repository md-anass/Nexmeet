import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, getAuthenticatedUser } from "@/lib/supabase/server";

export type OwnedMeeting = {
  public_code: string;
  title: string;
  status: "active" | "scheduled" | "ended" | "cancelled";
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  scheduled_for: string | null;
  cancelled_at: string | null;
  access_mode: "everyone" | "approval_required" | string;
  requires_password: boolean;
};

export type DashboardCounts = {
  upcoming: number;
  active: number;
  history: number;
  total: number;
};

export const getAuthenticatedProfile = cache(async () => {
  const user = await getAuthenticatedUser();
  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name?.trim() ||
    user.user_metadata?.display_name?.trim?.() ||
    user.user_metadata?.full_name?.trim?.() ||
    user.email?.split("@")[0] ||
    "there";

  return {
    user,
    profile,
    displayName,
  };
});

export const fetchDashboardData = cache(async () => {
  const authProfile = await getAuthenticatedProfile();
  if (!authProfile) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login");
  }

  const { data: meetings, error: meetingsError } = await supabase.rpc("get_owned_meetings");

  const ownedMeetings = (Array.isArray(meetings) ? meetings : meetings ? [meetings] : []).flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const value = row as Record<string, unknown>;
    const status = typeof value.status === "string" ? value.status.trim().toLowerCase() : "";

    if (!(["active", "scheduled", "ended", "cancelled"] as const).includes(status as OwnedMeeting["status"])) {
      return [];
    }

    return [{ ...value, status } as OwnedMeeting];
  });

  const upcomingMeetings = ownedMeetings
    .filter((meeting) => meeting.status === "scheduled")
    .sort((a, b) => Date.parse(a.scheduled_for ?? "") - Date.parse(b.scheduled_for ?? ""));

  const activeMeetings = ownedMeetings.filter((meeting) => meeting.status === "active");

  const pastMeetings = ownedMeetings
    .filter((meeting) => meeting.status === "ended" || meeting.status === "cancelled")
    .sort(
      (a, b) =>
        Date.parse(b.cancelled_at ?? b.ended_at ?? b.created_at) -
        Date.parse(a.cancelled_at ?? a.ended_at ?? a.created_at),
    );

  const counts: DashboardCounts = {
    upcoming: upcomingMeetings.length,
    active: activeMeetings.length,
    history: pastMeetings.length,
    total: ownedMeetings.length,
  };

  return {
    user: authProfile.user,
    profile: authProfile.profile,
    displayName: authProfile.displayName,
    ownedMeetings,
    upcomingMeetings,
    activeMeetings,
    pastMeetings,
    counts,
    meetingsError: !!meetingsError,
  };
});
