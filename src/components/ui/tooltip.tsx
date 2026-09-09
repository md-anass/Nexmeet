import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tooltip({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span role="tooltip" className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[rgb(var(--nm-text-primary))] px-2 py-1 text-[0.6875rem] font-medium text-white shadow-md group-hover:block group-focus-within:block">
        {label}
      </span>
    </span>
  );
}
