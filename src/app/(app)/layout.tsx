import type { ReactNode } from "react";
import { AppShell } from "@/components/shared/app-shell";
import { fetchDashboardData } from "@/lib/dashboard-data";

export default async function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  const { displayName, user, counts } = await fetchDashboardData();

  return (
    <AppShell
      user={{
        name: displayName,
        email: user?.email || "",
      }}
      counts={counts}
    >
      {children}
    </AppShell>
  );
}
