import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const controlClasses = "w-full rounded-[var(--nm-radius-md)] border border-[rgb(var(--nm-border))] bg-[rgb(var(--nm-surface))] px-3.5 py-2.5 text-sm text-[rgb(var(--nm-text-primary))] shadow-[0_1px_2px_rgb(9_20_43/0.03)] outline-none transition-[border-color,box-shadow] duration-[var(--nm-duration-fast)] placeholder:text-[rgb(var(--nm-text-muted))] hover:border-[rgb(var(--nm-border-strong))] focus:border-[rgb(var(--nm-accent-blue))] focus:ring-4 focus:ring-[rgb(var(--nm-accent-blue)/0.12)] disabled:cursor-not-allowed disabled:bg-[rgb(var(--nm-surface-secondary))] disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(controlClasses, "min-h-11", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(controlClasses, "min-h-24 resize-y", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...props }, ref) {
  return <select ref={ref} className={cn(controlClasses, "min-h-11 appearance-none pr-10", className)} {...props} />;
});
