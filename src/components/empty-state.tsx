import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-card/50",
        className
      )}
    >
      <div className="h-12 w-12 rounded-2xl bg-accent-soft flex items-center justify-center text-accent mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-md mb-4">{description}</p>
      {action}
    </div>
  );
}
