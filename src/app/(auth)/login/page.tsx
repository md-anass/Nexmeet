import { redirect } from "next/navigation";
import { AuthForm } from "@/components/shared/auth-form";
import { AuthShell } from "@/components/shared/auth-shell";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  if (await getAuthenticatedUser()) redirect("/dashboard");
  const params = await searchParams;
  const confirmationError =
    params.error === "confirmation"
      ? "We could not confirm that email link. Request a new link or try signing in again."
      : "";

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to start, schedule, and manage your meetings."
      mode="login"
    >
      <AuthForm mode="login" initialError={confirmationError} />
    </AuthShell>
  );
}
