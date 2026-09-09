"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import {
  CalendarClock,
  ChevronRight,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Radio,
  UserRound,
  X,
} from "lucide-react";
import { Avatar, Tooltip } from "@/components/ui";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  countKey?: "upcoming" | "active" | "history";
  isLive?: boolean;
};

const workspaceNav: readonly NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/upcoming", label: "Upcoming", icon: CalendarClock, countKey: "upcoming" },
  { href: "/dashboard/active", label: "Active", icon: Radio, countKey: "active", isLive: true },
  { href: "/dashboard/history", label: "History", icon: History, countKey: "history" },
] as const;

const accountNav: readonly NavItem[] = [
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

interface AppShellProps {
  children: ReactNode;
  user?: {
    name: string;
    email: string;
  };
  counts?: {
    upcoming: number;
    active: number;
    history: number;
  };
}

function SidebarLink({
  item,
  active,
  count,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  count?: number;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const isLiveActive = item.isLive && (count ?? 0) > 0;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex min-h-11 items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "border border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-violet-500/10 text-white shadow-[0_0_18px_rgba(6,182,212,0.12)]"
          : "text-slate-400 hover:bg-white/[0.06] hover:text-white",
      )}
    >
      {active && (
        <span
          aria-hidden="true"
          className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-gradient-to-b from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
        />
      )}

      <div className="flex items-center gap-3">
        <Icon
          className={cn(
            "size-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110",
            active ? "text-cyan-300" : "text-slate-400 group-hover:text-slate-200",
            isLiveActive && "text-cyan-400 animate-pulse",
          )}
          aria-hidden="true"
        />
        <span className="truncate">{item.label}</span>
      </div>

      <div className="flex items-center gap-2">
        {isLiveActive && (
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </span>
        )}

        {typeof count === "number" && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[0.68rem] font-semibold tabular-nums tracking-wide transition-colors",
              isLiveActive
                ? "border border-cyan-400/40 bg-cyan-500/20 text-cyan-300"
                : active
                  ? "border border-white/20 bg-white/15 text-white"
                  : "border border-white/10 bg-white/[0.05] text-slate-400 group-hover:border-white/15 group-hover:text-slate-300",
            )}
          >
            {count}
          </span>
        )}
      </div>
    </Link>
  );
}

export function AppShell({ children, user, counts }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userName = user?.name || "NexMeet account";
  const userEmail = user?.email || "";

  const allItems = [...workspaceNav, ...accountNav];
  const currentTitle = allItems.find((item) => item.href === pathname)?.label ?? "Dashboard";

  return (
    <div className="min-h-[100dvh] bg-[#f8fafc] text-slate-900 lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      {/* Skip to main content accessibility link */}
      <a
        href="#app-content"
        className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xl transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      {/* DESKTOP SIDEBAR */}
      <aside className="sticky top-0 hidden h-[100dvh] flex-col overflow-y-auto border-r border-slate-800/80 bg-[#030712] px-3.5 py-4 text-slate-200 lg:flex">
        {/* Brand header */}
        <Link
          href="/dashboard"
          aria-label="NexMeet workspace dashboard"
          className="group relative flex h-14 items-center overflow-hidden rounded-xl px-2 transition-opacity hover:opacity-95"
        >
          <Image
            unoptimized
            src="/brand/logo with name.png"
            alt="NexMeet"
            fill
            sizes="13rem"
            className="scale-[1.75] object-contain object-left"
          />
        </Link>

        {/* WORKSPACE NAVIGATION */}
        <div className="mt-6">
          <p className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-400/90">
            Workspace
          </p>
          <nav aria-label="Workspace navigation" className="mt-2 space-y-1">
            {workspaceNav.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={pathname === item.href}
                count={item.countKey && counts ? counts[item.countKey] : undefined}
              />
            ))}
          </nav>
        </div>

        {/* ACCOUNT NAVIGATION */}
        <div className="mt-6">
          <p className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-400/90">
            Account
          </p>
          <nav aria-label="Account navigation" className="mt-2 space-y-1">
            {accountNav.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={pathname === item.href}
              />
            ))}
          </nav>
        </div>

        {/* BOTTOM ACCOUNT CARD */}
        <div className="mt-auto pt-4">
          <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-inner backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07]">
            <Link
              href="/profile"
              className="flex items-center gap-3 transition-opacity hover:opacity-90"
              aria-label="View user profile"
            >
              <div className="relative">
                <Avatar
                  name={userName}
                  className="size-10 ring-2 ring-cyan-400/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                />
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#030712] bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  {userName}
                </p>
                {userEmail && (
                  <p className="truncate text-xs text-slate-400">
                    {userEmail}
                  </p>
                )}
              </div>
              <ChevronRight className="size-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
            </Link>

            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-xs text-slate-400">
              <Tooltip label="Return to public site">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-white/10 hover:text-slate-200"
                >
                  <Home className="size-3.5" />
                  <span>Home</span>
                </Link>
              </Tooltip>

              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-slate-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
                >
                  <LogOut className="size-3.5" />
                  <span>Log out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-slate-800 bg-[#030712]/95 px-4 backdrop-blur-xl sm:px-6 lg:hidden">
          <Link
            href="/dashboard"
            aria-label="NexMeet dashboard"
            className="relative h-12 w-28 overflow-hidden"
          >
            <Image
              unoptimized
              src="/brand/logo with name.png"
              alt="NexMeet"
              fill
              sizes="7rem"
              className="scale-[1.8] object-contain object-left"
            />
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 sm:inline">
              {currentTitle}
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </header>

        {/* MOBILE DRAWER OVERLAY */}
        {mobileMenuOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="fixed inset-0 z-50 flex flex-col bg-[#030712]/98 p-5 text-white backdrop-blur-2xl lg:hidden"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="relative h-12 w-28 overflow-hidden"
              >
                <Image
                  unoptimized
                  src="/brand/logo with name.png"
                  alt="NexMeet"
                  fill
                  sizes="7rem"
                  className="scale-[1.8] object-contain object-left"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300"
                aria-label="Close navigation"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="mt-6 flex-1 space-y-1">
              <p className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                Workspace
              </p>
              {workspaceNav.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  count={item.countKey && counts ? counts[item.countKey] : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}

              <p className="mt-6 px-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                Account
              </p>
              {accountNav.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}
            </nav>

            <div className="border-t border-slate-800 pt-4">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3">
                <Avatar name={userName} className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{userName}</p>
                  <p className="truncate text-xs text-slate-400">{userEmail}</p>
                </div>
              </div>
              <form action="/auth/signout" method="post" className="mt-3">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/15 py-2.5 text-sm font-semibold text-red-300"
                >
                  <LogOut className="size-4" />
                  Log out
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MAIN PAGE CONTENT */}
        <main
          id="app-content"
          tabIndex={-1}
          className="mx-auto min-h-[100dvh] w-full px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-14 lg:pt-8 xl:px-10 2xl:px-12"
        >
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Mobile quick navigation"
        className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 flex items-center justify-around gap-1 rounded-2xl border border-slate-800 bg-[#030712]/95 p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.4)] backdrop-blur-2xl lg:hidden"
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[0.68rem] font-semibold transition-colors",
            pathname === "/dashboard"
              ? "bg-cyan-500/20 text-cyan-300"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          <LayoutDashboard className="size-4.5" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/dashboard/upcoming"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[0.68rem] font-semibold transition-colors",
            pathname === "/dashboard/upcoming"
              ? "bg-cyan-500/20 text-cyan-300"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          <CalendarClock className="size-4.5" />
          <span>Upcoming</span>
        </Link>

        <Link
          href="/dashboard/active"
          className={cn(
            "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[0.68rem] font-semibold transition-colors",
            pathname === "/dashboard/active"
              ? "bg-cyan-500/20 text-cyan-300"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          {counts && counts.active > 0 && (
            <span className="absolute top-1.5 right-4 flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-cyan-400" />
            </span>
          )}
          <Radio className="size-4.5" />
          <span>Active</span>
        </Link>

        <Link
          href="/dashboard/history"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[0.68rem] font-semibold transition-colors",
            pathname === "/dashboard/history"
              ? "bg-cyan-500/20 text-cyan-300"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          <History className="size-4.5" />
          <span>History</span>
        </Link>

        <Link
          href="/profile"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[0.68rem] font-semibold transition-colors",
            pathname === "/profile"
              ? "bg-cyan-500/20 text-cyan-300"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          <UserRound className="size-4.5" />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
