import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SurfaceVariant = "default" | "secondary" | "elevated" | "outlined";

const surfaceClasses: Record<SurfaceVariant, string> = {
  default: "border border-[rgb(var(--nm-border))] bg-[rgb(var(--nm-surface))]",
  secondary: "bg-[rgb(var(--nm-surface-secondary))]",
  elevated: "border border-[rgb(var(--nm-border)/0.8)] bg-[rgb(var(--nm-surface-elevated))] shadow-[var(--nm-shadow-md)]",
  outlined: "border border-dashed border-[rgb(var(--nm-border-strong))] bg-transparent",
};

export function Surface({ variant = "default", className, ...props }: HTMLAttributes<HTMLDivElement> & { variant?: SurfaceVariant }) {
  return <div className={cn("rounded-[var(--nm-radius-lg)]", surfaceClasses[variant], className)} {...props} />;
}
