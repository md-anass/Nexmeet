import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function DialogBackdrop({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]", className)} {...props} />;
}

export function DialogPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="dialog" aria-modal="true" className={cn("w-full max-w-md rounded-[var(--nm-radius-xl)] border border-[rgb(var(--nm-border))] bg-[rgb(var(--nm-surface-elevated))] p-6 shadow-[var(--nm-shadow-md)]", className)} {...props} />;
}
