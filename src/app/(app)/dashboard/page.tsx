import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  const displayName = user.user_metadata?.full_name;

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
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Your private meeting workspace is ready. Create or join a meeting when that feature is available.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Create Meeting</button>
            <button type="button" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:border-slate-300">Join Meeting</button>
          </div>
        </section>
      </div>
    </main>
  );
}
