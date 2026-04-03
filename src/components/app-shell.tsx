"use client";

import { cn } from "@/lib/cn";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Brain,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/decisions", label: "Decisions", icon: ListChecks },
  { href: "/insights", label: "Insights", icon: Brain },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  displayName,
  children,
}: {
  displayName: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-[260px] flex-col border-r border-slate-200/70 dark:border-slate-800/80 bg-white/55 dark:bg-slate-950/40 backdrop-blur-xl p-5 gap-8">
        <Link href="/dashboard" className="flex items-center gap-3 px-1">
          <span className="h-11 w-11 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-soft">
            NR
          </span>
          <div>
            <p className="font-display font-semibold leading-tight tracking-tight">
              {APP_NAME}
            </p>
            <p className="text-[11px] text-muted mt-0.5">Know before you regret.</p>
          </div>
        </Link>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-teal-600/15 to-cyan-600/10 text-teal-800 dark:text-teal-300 shadow-sm border border-teal-500/15"
                    : "text-muted hover:text-foreground hover:bg-slate-100/90 dark:hover:bg-slate-800/60"
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-teal-600 dark:text-teal-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-2 border-t border-slate-200/60 dark:border-slate-800 pt-5">
          <p
            className="text-xs text-muted px-2 truncate font-medium"
            title={displayName ?? ""}
          >
            {displayName ?? "Signed in"}
          </p>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3.5 border-b border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-20">
          <Link href="/dashboard" className="font-display font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
            className="p-2 rounded-xl text-muted hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>
        {open && (
          <div className="md:hidden border-b border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md px-4 py-3 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={signOut}
              className="py-2.5 text-sm text-muted w-full text-left"
            >
              Sign out
            </button>
          </div>
        )}
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 p-4 md:p-10 max-w-6xl w-full mx-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
