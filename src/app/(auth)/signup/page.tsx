import { redirect } from "next/navigation";
import { AuthForm } from "@/components/shared/auth-form";
import { AuthShell } from "@/components/shared/auth-shell";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (await getAuthenticatedUser()) redirect("/dashboard");

  return (
    <AuthShell
      title="Create your account"
      description="Set up your workspace and host your first secure meeting in minutes."
      mode="signup"
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
