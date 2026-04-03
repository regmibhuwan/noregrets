import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/70 dark:border-slate-700/60 shadow-soft p-6",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "font-display text-lg font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  );
}
