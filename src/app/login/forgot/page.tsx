import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { AuthSplitShell } from "@/components/auth-split-shell";
import Link from "next/link";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthSplitShell
      title="Reset password"
      subtitle={`We’ll email you a secure reset link (Supabase default). Your email must already be confirmed. If links ever open localhost, fix Site URL in Supabase → Authentication.`}
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
