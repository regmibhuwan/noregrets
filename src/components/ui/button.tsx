import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-45 disabled:pointer-events-none active:scale-[0.98]",
        size === "sm" && "text-sm px-3 py-2",
        size === "md" && "text-sm px-4 py-2.5",
        size === "lg" && "text-base px-5 py-3 rounded-2xl",
        variant === "primary" &&
          "bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-soft hover:shadow-soft-lg hover:from-teal-500 hover:to-teal-600 dark:from-teal-500 dark:to-teal-600 dark:hover:from-teal-400 dark:hover:to-teal-500",
        variant === "secondary" &&
          "bg-white/80 dark:bg-slate-800/80 text-foreground border border-slate-200/90 dark:border-slate-600/80 shadow-soft backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800",
        variant === "ghost" &&
          "text-muted hover:text-foreground hover:bg-slate-100/90 dark:hover:bg-slate-800/70",
        variant === "danger" &&
          "bg-danger/10 text-danger hover:bg-danger/15 border border-danger/25",
        className
      )}
      {...props}
    />
  );
}
