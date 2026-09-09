import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Spinner({ label = "Loading", className }: { label?: string; className?: string }) {
  return <span role="status" className="inline-flex items-center gap-2 text-sm text-[rgb(var(--nm-text-secondary))]"><span aria-hidden="true" className={cn("size-4 animate-spin rounded-full border-2 border-[rgb(var(--nm-border-strong))] border-t-[rgb(var(--nm-accent-blue))]", className)} /><span className="sr-only">{label}</span></span>;
}

type AlertTone = "error" | "success" | "warning" | "info";
const alertClasses: Record<AlertTone, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export function Alert({ tone = "info", className, ...props }: HTMLAttributes<HTMLDivElement> & { tone?: AlertTone }) {
  return <div role={tone === "error" ? "alert" : "status"} className={cn("rounded-[var(--nm-radius-md)] border px-4 py-3 text-sm leading-6", alertClasses[tone], className)} {...props} />;
}

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return <section className={cn("rounded-[var(--nm-radius-lg)] border border-dashed border-[rgb(var(--nm-border-strong))] px-6 py-12 text-center sm:py-14", className)}>{icon && <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[rgb(var(--nm-surface-secondary))] text-[rgb(var(--nm-text-muted))] ring-1 ring-[rgb(var(--nm-border))]">{icon}</div>}<h3 className="text-lg font-semibold tracking-[-0.02em] text-[rgb(var(--nm-text-primary))]">{title}</h3>{description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[rgb(var(--nm-text-muted))]">{description}</p>}{action && <div className="mt-6">{action}</div>}</section>;
}
