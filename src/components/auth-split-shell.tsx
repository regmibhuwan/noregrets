import { APP_NAME, TAGLINE } from "@/lib/constants";
import Link from "next/link";

export function AuthSplitShell({
  title,
  subtitle,
  children,
  footer,
  belowCard,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  belowCard?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="relative lg:w-[42%] xl:w-[44%] min-h-[200px] lg:min-h-screen overflow-hidden auth-gradient-panel flex flex-col justify-between p-8 lg:p-12">
        <div className="absolute inset-0 auth-mesh opacity-90" aria-hidden />
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-white/90 hover:text-white transition-colors"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-sm font-bold tracking-tight shadow-lg">
              NR
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              {APP_NAME}
            </span>
          </Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200/90">
            {TAGLINE}
          </p>
          <h2 className="mt-3 font-display text-3xl lg:text-4xl font-semibold text-white leading-tight tracking-tight max-w-md">
            Clarity grows when you revisit what you chose—and why.
          </h2>
          <p className="mt-4 text-sm text-teal-100/80 leading-relaxed max-w-sm">
            Private decisions, gentle reminders, and patterns that help you
            trust your next move.
          </p>
        </div>
        <p className="relative z-10 hidden lg:block text-xs text-teal-200/50">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 lg:py-12 lg:px-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-glow border border-white/20 dark:border-white/10">
            {children}
          </div>
          {belowCard && <div className="mt-5">{belowCard}</div>}
          {footer && <div className="mt-8 text-center text-sm">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
