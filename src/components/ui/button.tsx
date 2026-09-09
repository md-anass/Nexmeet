import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "icon";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[rgb(var(--nm-text-primary))] text-white shadow-[var(--nm-shadow-sm)] hover:bg-slate-800",
  secondary: "border border-[rgb(var(--nm-border))] bg-[rgb(var(--nm-surface))] text-[rgb(var(--nm-text-primary))] shadow-[var(--nm-shadow-sm)] hover:border-[rgb(var(--nm-border-strong))] hover:bg-[rgb(var(--nm-surface-secondary))]",
  ghost: "text-[rgb(var(--nm-text-secondary))] hover:bg-[rgb(var(--nm-surface-secondary))] hover:text-[rgb(var(--nm-text-primary))]",
  destructive: "bg-[rgb(var(--nm-destructive))] text-white shadow-[var(--nm-shadow-sm)] hover:bg-red-700",
  icon: "border border-transparent text-[rgb(var(--nm-text-secondary))] hover:border-[rgb(var(--nm-border))] hover:bg-[rgb(var(--nm-surface-secondary))] hover:text-[rgb(var(--nm-text-primary))]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-12 px-5 text-sm",
};

export function buttonStyles({ variant = "primary", size = "md", className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-[var(--nm-radius-md)] font-semibold transition-[background-color,border-color,color,box-shadow,transform,filter] duration-[var(--nm-duration-fast)] ease-[var(--nm-ease)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100",
    variantClasses[variant],
    variant === "icon" ? "size-10 min-h-10 p-0" : sizeClasses[size],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ className, variant = "primary", size = "md", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles({ variant, size, className })} {...props} />;
}
