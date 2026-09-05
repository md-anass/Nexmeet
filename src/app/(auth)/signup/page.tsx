import { redirect } from "next/navigation";
import { AuthForm } from "@/components/shared/auth-form";
import { AuthShell } from "@/components/shared/auth-shell";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (await getAuthenticatedUser()) redirect("/dashboard");
  return <AuthShell title="Create your account" description="Set up NexMeet for simple, private conversations."><AuthForm mode="signup" /></AuthShell>;
}
