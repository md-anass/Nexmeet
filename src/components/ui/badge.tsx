import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "info" | "success" | "warning" | "destructive";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-[rgb(var(--nm-surface-secondary))] text-[rgb(var(--nm-text-secondary))]",
  info: "bg-[rgb(var(--nm-accent-blue)/0.1)] text-blue-700",
  success: "bg-[rgb(var(--nm-success)/0.1)] text-emerald-700",
  warning: "bg-[rgb(var(--nm-warning)/0.1)] text-amber-700",
  destructive: "bg-[rgb(var(--nm-destructive)/0.1)] text-red-700",
};

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={cn("inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold leading-none", toneClasses[tone], className)} {...props} />;
}
