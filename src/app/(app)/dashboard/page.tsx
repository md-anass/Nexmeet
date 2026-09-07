import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateMeetingForm } from "@/components/shared/create-meeting-form";
import { MeetingCard } from "@/components/shared/meeting-card";
import { ScheduleMeetingForm } from "@/components/shared/schedule-meeting-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
type OwnedMeeting = { public_code: string; title: string; status: "active" | "scheduled" | "ended" | "cancelled"; created_at: string; started_at: string | null; ended_at: string | null; scheduled_for: string | null; cancelled_at: string | null; access_mode: "everyone" | "approval_required" | string; requires_password: boolean };

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData.user;
  if (authError || !user) redirect("/login");
  const [{ data: profile }, { data: meetings, error: meetingsError }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    supabase.rpc("get_owned_meetings"),
  ]);
  const displayName = profile?.display_name?.trim() || user.email?.split("@")[0] || "there";
  const ownedMeetings = (Array.isArray(meetings) ? meetings : meetings ? [meetings] : []).flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const value = row as Record<string, unknown>;
    const status = typeof value.status === "string" ? value.status.trim().toLowerCase() : "";
    if (!(["active", "scheduled", "ended", "cancelled"] as const).includes(status as OwnedMeeting["status"])) return [];
    return [{ ...value, status } as OwnedMeeting];
  });
  const upcomingMeetings = ownedMeetings
    .filter((meeting) => meeting.status === "scheduled")
    .sort((a, b) => Date.parse(a.scheduled_for ?? "") - Date.parse(b.scheduled_for ?? ""));
  const activeMeetings = ownedMeetings.filter((meeting) => meeting.status === "active");
  const pastMeetings = ownedMeetings
    .filter((meeting) => meeting.status === "ended" || meeting.status === "cancelled")
    .sort((a, b) => Date.parse(b.cancelled_at ?? b.ended_at ?? b.created_at) - Date.parse(a.cancelled_at ?? a.ended_at ?? a.created_at));

  return (
    <main className="min-h-screen px-6 py-6 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950">NexMeet</Link>
          <div className="flex items-center gap-2">
            <Link href="/profile" className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-900/5">Profile</Link>
            <form action="/auth/signout" method="post"><button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Log out</button></form>
          </div>
        </header>
        <section className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-12">
          <p className="text-sm font-medium text-slate-500">Your NexMeet space</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{displayName ? `Welcome, ${displayName}` : "Welcome to NexMeet"}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Your private meeting workspace is ready.</p>
          <CreateMeetingForm />
          <ScheduleMeetingForm />
          {meetingsError ? <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">We could not load your meetings right now.</p> : <div className="mt-10 space-y-10"><section><h2 className="text-2xl font-semibold text-slate-950">Upcoming Meetings</h2><div className="mt-4 grid gap-4">{upcomingMeetings.length ? upcomingMeetings.map((meeting) => <MeetingCard key={meeting.public_code} meeting={meeting} />) : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No upcoming meetings yet.</p>}</div></section><section><h2 className="text-2xl font-semibold text-slate-950">Active Meetings</h2><div className="mt-4 grid gap-4">{activeMeetings.length ? activeMeetings.map((meeting) => <MeetingCard key={meeting.public_code} meeting={meeting} />) : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No active meetings yet.</p>}</div></section><section><h2 className="text-2xl font-semibold text-slate-950">Past Meetings</h2><div className="mt-4 grid gap-4">{pastMeetings.length ? pastMeetings.map((meeting) => <MeetingCard key={meeting.public_code} meeting={meeting} />) : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No past meetings yet.</p>}</div></section></div>}
        </section>
      </div>
    </main>
  );
}
