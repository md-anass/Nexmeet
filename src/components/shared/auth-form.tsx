"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Spinner } from "@/components/ui";

type AuthFormProps = {
  mode: "login" | "signup";
  initialError?: string;
};

export function AuthForm({ mode, initialError = "" }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState(initialError);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Client validation helper state for signup
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");

  const isSignup = mode === "signup";
  const hasEightChars = passwordValue.length >= 8;
  const passwordsMatch = isSignup && passwordValue.length > 0 && passwordValue === confirmPasswordValue;

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
    try {
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
    } catch {
      setPending(false);
      setError("Connection error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-busy={pending}>
      {/* Full Name (Sign up only) */}
      {isSignup && (
        <div className="space-y-1.5">
          <label
            htmlFor="full-name-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Full name
          </label>
          <div className="relative">
            <UserRound
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="full-name-input"
              name="fullName"
              type="text"
              autoComplete="name"
              maxLength={100}
              placeholder="e.g. Alex Morgan"
              required
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
      )}

      {/* Email Address */}
      <div className="space-y-1.5">
        <label
          htmlFor="email-input"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Email address
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="email-input"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@company.com"
            required
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Password
          </label>
          {!isSignup && (
            <span className="text-xs text-slate-400">
              Min. 8 characters
            </span>
          )}
        </div>
        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="password-input"
            name="password"
            type={showPassword ? "text" : "password"}
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={8}
            placeholder="••••••••"
            required
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password (Sign up only) */}
      {isSignup && (
        <div className="space-y-1.5">
          <label
            htmlFor="confirm-password-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Confirm password
          </label>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="confirm-password-input"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPasswordValue}
              onChange={(e) => setConfirmPasswordValue(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              placeholder="••••••••"
              required
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {/* Password checklist badges for signup */}
          {passwordValue && (
            <div className="flex flex-wrap gap-2 pt-1 text-[0.7rem]">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium transition-colors ${
                  hasEightChars
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Check className="size-3" />
                <span>At least 8 characters</span>
              </span>

              {confirmPasswordValue && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium transition-colors ${
                    passwordsMatch
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  <Check className="size-3" />
                  <span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 animate-[nm-enter-up_200ms_ease_both]"
        >
          <AlertCircle className="size-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Success / Confirmation Message */}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 animate-[nm-enter-up_200ms_ease_both]"
        >
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">Confirmation link sent!</p>
            <p className="mt-0.5 text-emerald-700">{message}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending}
        className="group relative flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(37,99,235,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <Spinner className="size-4 text-white" label="Processing..." />
            <span>{isSignup ? "Creating account..." : "Signing in..."}</span>
          </>
        ) : (
          <>
            <span>{isSignup ? "Create account" : "Sign in"}</span>
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </>
        )}
      </button>

      {/* Switch Link */}
      <div className="border-t border-slate-200/80 pt-4 text-center">
        <p className="text-xs text-slate-500">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <Link
            href={isSignup ? "/login" : "/signup"}
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
          >
            {isSignup ? "Sign in to workspace" : "Create one in seconds"}
          </Link>
        </p>
      </div>
    </form>
  );
}
