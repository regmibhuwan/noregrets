"use client";

import { resendSignupEmailAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

function ResendBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="sm" disabled={pending}>
      {pending ? "…" : "Resend"}
    </Button>
  );
}

export function LoginTroubleshoot() {
  const [state, action] = useFormState(resendSignupEmailAction, {});

  return (
    <details className="mt-6 group rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30 text-sm">
      <summary className="cursor-pointer list-none px-4 py-3 font-medium text-muted hover:text-foreground flex items-center justify-between gap-2">
        <span>Having trouble signing in?</span>
        <span className="text-xs text-muted group-open:rotate-180 transition-transform">
          ▼
        </span>
      </summary>
      <div className="px-4 pb-4 pt-0 space-y-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <ul className="text-muted text-xs leading-relaxed space-y-2 pt-3 list-disc list-inside">
          <li>
            <strong className="text-foreground">Instant local sign-up:</strong>{" "}
            set{" "}
            <code className="text-[11px] bg-slate-200/60 dark:bg-slate-800 px-1 rounded">
              AUTH_DEV_AUTO_CONFIRM=true
            </code>{" "}
            and your Supabase{" "}
            <code className="text-[11px] bg-slate-200/60 dark:bg-slate-800 px-1 rounded">
              service_role
            </code>{" "}
            key in{" "}
            <code className="text-[11px] bg-slate-200/60 dark:bg-slate-800 px-1 rounded">
              .env.local
            </code>
            , restart the dev server, then sign up with a fresh email.
          </li>
          <li>
            <strong className="text-foreground">Already registered?</strong>{" "}
            <Link href="/login/forgot" className="text-accent font-medium hover:underline">
              Reset password
            </Link>{" "}
            (after email is confirmed in Supabase).
          </li>
          <li>
            <strong className="text-foreground">Supabase Users:</strong> open
            your project → Authentication → Users → confirm the user or delete
            and sign up again.
          </li>
        </ul>

        <form action={action} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
          <div className="flex-1 space-y-1">
            <Label htmlFor="resend-email-login" className="text-xs">
              Resend signup confirmation
            </Label>
            <Input
              id="resend-email-login"
              name="email"
              type="email"
              placeholder="email@you.used"
              className="py-2 text-sm"
            />
          </div>
          <ResendBtn />
        </form>
        {state.ok && (
          <p className="text-xs text-accent">If that address has an unconfirmed account, check your inbox.</p>
        )}
        {state.error && (
          <p className="text-xs text-danger">{state.error}</p>
        )}
      </div>
    </details>
  );
}
