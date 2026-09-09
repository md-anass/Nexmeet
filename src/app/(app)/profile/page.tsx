import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  KeyRound,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { ProfileForm } from "@/components/shared/profile-form";
import { Avatar } from "@/components/ui";
import { getAuthenticatedProfile } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const authProfile = await getAuthenticatedProfile();
  if (!authProfile) redirect("/login");

  const { user, displayName } = authProfile;
  const memberSince = new Date(user.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* PAGE HEADER */}
      <header>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-400">
            Account settings
          </p>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">
          Manage your NexMeet identity, account details, and workspace preferences.
        </p>
      </header>

      {/* IDENTITY HERO CARD */}
      <section
        aria-label="Your NexMeet identity"
        className="relative overflow-hidden rounded-[2rem] border border-slate-800/80 bg-[#030712] p-6 text-white shadow-[0_24px_70px_rgba(2,6,23,0.3)] sm:p-8"
      >
        {/* Atmospheric gradients and subtle grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 size-[26rem] rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-violet-600/10 blur-[90px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-1/4 size-[20rem] rounded-full bg-gradient-to-tr from-violet-600/15 via-blue-500/10 to-transparent blur-[80px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:40px_40px]"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar
                name={displayName || user.email || "NexMeet member"}
                className="size-20 text-2xl font-bold ring-4 ring-cyan-400/30 shadow-[0_0_24px_rgba(6,182,212,0.3)]"
              />
              <span
                className="absolute bottom-1 right-1 size-3.5 rounded-full border-2 border-[#030712] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                title="Account active"
              />
            </div>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-cyan-300">
                <Sparkles className="size-3" aria-hidden="true" />
                <span>NexMeet identity</span>
              </div>
              <p className="mt-1.5 truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
                {displayName || "NexMeet member"}
              </p>
              <p className="truncate text-xs text-slate-400 sm:text-sm">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
              <ShieldCheck className="size-4 text-emerald-400" aria-hidden="true" />
              <span>Account active</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2-COLUMN PROFILE CONTENT */}
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        {/* LEFT COLUMN: EDITABLE PERSONAL INFORMATION */}
        <section
          aria-labelledby="personal-info-heading"
          className="rounded-[1.75rem] border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex items-start gap-3.5 border-b border-slate-100 pb-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
              <UserCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="personal-info-heading"
                className="text-base font-bold text-slate-900 sm:text-lg"
              >
                Personal information
              </h2>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Update your public name recognized by others in meetings.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <ProfileForm displayName={displayName} email={user.email || ""} />
          </div>
        </section>

        {/* RIGHT COLUMN: ACCOUNT & SECURITY PANELS */}
        <div className="space-y-6">
          {/* CARD 1: ACCOUNT DETAILS */}
          <section
            aria-labelledby="account-details-heading"
            className="rounded-[1.75rem] border border-slate-200/90 bg-white p-6 shadow-sm"
          >
            <h3
              id="account-details-heading"
              className="text-sm font-bold tracking-tight text-slate-900"
            >
              Account details
            </h3>

            <dl className="mt-5 space-y-4 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <dt className="flex items-center gap-1.5 font-semibold text-slate-500">
                  <Mail className="size-3.5 text-slate-400" aria-hidden="true" />
                  <span>Primary email</span>
                </dt>
                <dd className="mt-1 break-all font-medium text-slate-800">
                  {user.email}
                </dd>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <dt className="flex items-center gap-1.5 font-semibold text-slate-500">
                  <CalendarDays className="size-3.5 text-slate-400" aria-hidden="true" />
                  <span>Member since</span>
                </dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {memberSince}
                </dd>
              </div>
            </dl>
          </section>

          {/* CARD 2: SECURITY & SESSION */}
          <section
            aria-labelledby="security-heading"
            className="rounded-[1.75rem] border border-slate-200/90 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-blue-600" aria-hidden="true" />
              <h3
                id="security-heading"
                className="text-sm font-bold tracking-tight text-slate-900"
              >
                Security & session
              </h3>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Your NexMeet session is protected with encrypted tokens and secure HTTP-only cookies.
            </p>

            <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-slate-100 text-xs">
              <Link
                href="/security"
                className="group flex items-center justify-between font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span>Security overview</span>
                <ExternalLink className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/privacy"
                className="group flex items-center justify-between font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                <span>Privacy policy</span>
                <ExternalLink className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>

          {/* CARD 3: NEXMEET WORKSPACE INFO */}
          <div className="rounded-[1.75rem] border border-cyan-200/60 bg-gradient-to-br from-cyan-50/50 via-blue-50/30 to-violet-50/20 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-cyan-800 font-semibold text-xs">
              <KeyRound className="size-3.5" aria-hidden="true" />
              <span>Workspace permissions</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              You can create password-protected rooms, enable waiting rooms, and invite guests with zero downloads required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
