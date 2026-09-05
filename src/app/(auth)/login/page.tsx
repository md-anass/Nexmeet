import { redirect } from "next/navigation";
import { AuthForm } from "@/components/shared/auth-form";
import { AuthShell } from "@/components/shared/auth-shell";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAuthenticatedUser()) redirect("/dashboard");
  return <AuthShell title="Welcome back" description="Sign in to continue to your private meetings."><AuthForm mode="login" /></AuthShell>;
}
