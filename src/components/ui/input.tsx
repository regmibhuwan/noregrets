import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-slate-200/90 dark:border-slate-600/70 bg-white/70 dark:bg-slate-900/40 px-3.5 py-3 text-sm text-foreground placeholder:text-muted/70 shadow-inner shadow-slate-900/5 dark:shadow-none transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-teal-500/50 dark:focus-visible:border-teal-400/40",
        className
      )}
      {...props}
    />
  );
}
