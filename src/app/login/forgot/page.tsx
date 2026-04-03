import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { AuthSplitShell } from "@/components/auth-split-shell";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthSplitShell
      title="Reset password"
      subtitle={`We’ll email you a secure link. It works once your email is confirmed in ${APP_NAME} / Supabase.`}
      footer={
        <Link
          href="/login"
          className="text-muted hover:text-accent font-medium transition-colors"
        >
          ← Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthSplitShell>
  );
}
