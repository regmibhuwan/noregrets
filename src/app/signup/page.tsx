import { SignupForm } from "@/components/auth-forms";
import { AuthSplitShell } from "@/components/auth-split-shell";
import Link from "next/link";

export default function SignupPage() {
  return (
    <AuthSplitShell
      title="Create your account"
      subtitle="Free to start. Your decisions stay private to you."
      belowCard={
        <p className="text-xs text-center text-muted leading-relaxed px-1">
          Local dev: add{" "}
          <code className="text-foreground/90 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-[11px]">
            AUTH_DEV_AUTO_CONFIRM=true
          </code>{" "}
          +{" "}
          <code className="text-foreground/90 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-[11px]">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{" "}
          in{" "}
          <code className="text-foreground/90 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-[11px]">
            .env.local
          </code>
          , restart dev, then sign up — no email confirmation step.
        </p>
      }
      footer={
        <p className="text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-accent hover:underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthSplitShell>
  );
}
