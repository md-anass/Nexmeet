import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/shared/profile-form";
import { createSupabaseServerClient, getAuthenticatedUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  const supabase = await createSupabaseServerClient();
  const { data } = supabase ? await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle() : { data: null };
  const displayName = data?.display_name ?? user.user_metadata?.full_name ?? "";

  return (
    <main className="min-h-screen px-6 py-6 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-slate-950">NexMeet</Link>
          <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-950">Back to dashboard</Link>
        </header>
        <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-10">
          <div className="flex items-center gap-4">
            <div aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-500">{displayName.slice(0, 1).toUpperCase() || "N"}</div>
            <div><h1 className="text-3xl font-semibold tracking-tight text-slate-950">Profile</h1><p className="mt-1 text-sm text-slate-500">Manage your NexMeet account details.</p></div>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Email</p><p className="mt-2 text-sm text-slate-700">{user.email}</p><p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Member since</p><p className="mt-2 text-sm text-slate-700">{new Date(user.created_at).toLocaleDateString("en", { dateStyle: "medium" })}</p></div>
          <ProfileForm displayName={displayName} />
        </section>
      </div>
    </main>
  );
}
