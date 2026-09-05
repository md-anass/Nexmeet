"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AuthFormProps = { mode: "login" | "signup" };

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10";

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (isSignup && (!fullName || fullName.length > 100)) {
      setError("Enter your full name using 100 characters or fewer.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    const response = await fetch(isSignup ? "/auth/signup" : "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });
    const result = (await response.json()) as { message?: string; redirect?: string };

    setPending(false);
    if (!response.ok) {
      setError(result.message ?? "Something went wrong. Please try again.");
      return;
    }

    if (result.message) {
      setMessage("Check your email to confirm your NexMeet account.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {isSignup && (
        <label className="block text-sm font-medium text-slate-700">
          Full name
          <input className={inputClass} name="fullName" type="text" autoComplete="name" maxLength={100} />
        </label>
      )}
      <label className="block text-sm font-medium text-slate-700">
        Email
        <input className={inputClass} name="email" type="email" autoComplete="email" required />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Password
        <input className={inputClass} name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} minLength={8} required />
      </label>
      {isSignup && (
        <label className="block text-sm font-medium text-slate-700">
          Confirm password
          <input className={inputClass} name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
        </label>
      )}
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
      <button disabled={pending} className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
      </button>
      <p className="text-center text-sm text-slate-500">
        {isSignup ? "Already have an account? " : "New to NexMeet? "}
        <Link className="font-semibold text-slate-950 underline underline-offset-4" href={isSignup ? "/login" : "/signup"}>{isSignup ? "Sign in" : "Create an account"}</Link>
      </p>
    </form>
  );
}
