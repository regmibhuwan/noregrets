import { LoginForm } from "@/components/auth-forms";
import { AuthSplitShell } from "@/components/auth-split-shell";
import { LoginTroubleshoot } from "@/components/login-troubleshoot";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

export default function LoginPage({
  searchParams,
}: {
  searchParams: {
    next?: string;
    error?: string;
    message?: string;
    confirmed?: string;
  };
}) {
  return (
    <AuthSplitShell
      title="Welcome back"
      subtitle={`Sign in to ${APP_NAME} and pick up where you left off.`}
      belowCard={<LoginTroubleshoot />}
      footer={
        <p className="text-muted">
          No account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-accent hover:underline underline-offset-2"
          >
            Create one
          </Link>
        </p>
      }
    >
      {searchParams.confirmed === "1" && (
        <p className="mb-5 text-sm text-center rounded-xl bg-accent-soft/50 border border-accent/20 px-4 py-3 text-accent">
          Email confirmed — sign in below.
        </p>
      )}
      <LoginForm
        nextPath={searchParams.next}
        urlError={searchParams.error}
        urlMessage={searchParams.message}
      />
    </AuthSplitShell>
  );
}
