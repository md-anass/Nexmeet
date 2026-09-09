import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Avatar({ name, className, ...props }: HTMLAttributes<HTMLSpanElement> & { name: string }) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "N";
  return (
    <span
      aria-label={name}
      className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,rgb(var(--nm-accent-cyan)/0.18),rgb(var(--nm-accent-violet)/0.18))] text-sm font-bold text-[rgb(var(--nm-accent-blue))] ring-1 ring-[rgb(var(--nm-accent-blue)/0.14)]", className)}
      {...props}
    >
      {initial}
    </span>
  );
}
