"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getPublicSiteOrigin } from "@/lib/site-url";
import { emailOnlySchema } from "@/lib/validations";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "email" | "checkEmail" | "password";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callbackForRecovery = () => {
    const base = getPublicSiteOrigin();
    const next = encodeURIComponent("/auth/update-password");
    return `${base}/auth/callback?next=${next}`;
  };

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const parsed = emailOnlySchema.safeParse({ email: fd.get("email") });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    const em = parsed.data.email;
    setLoading(true);
    const supabase = createClient();
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(em, {
      redirectTo: callbackForRecovery(),
    });
    setLoading(false);
    if (resetErr) {
      setError(resetErr.message);
      return;
    }
    setEmail(em);
    setStep("checkEmail");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const token = code.replace(/\D/g, "").slice(0, 8);
    if (token.length < 6) {
      setError("Enter the code from your email (usually 6 digits).");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error: vErr } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "recovery",
    });
    setLoading(false);
    if (vErr || !data.session) {
      setError(
        vErr?.message ??
          "That code didn’t work. Request a new one, or use the link in the same email."
      );
      return;
    }
    setStep("password");
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: upErr } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (step === "checkEmail") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-accent/20 bg-accent-soft/20 dark:bg-accent-soft/10 px-4 py-3 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Check your email — use the link first
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Supabase usually sends a <strong className="text-foreground">reset link</strong>, not a
            code. Open it on <strong className="text-foreground">this same device/browser</strong>{" "}
            (the site you’re on now). You’ll land on the “new password” page.
          </p>
          <p className="text-xs text-muted leading-relaxed">
            If the link opens <code className="text-foreground">localhost</code> or says{" "}
            <code className="text-foreground">otp_expired</code>, set{" "}
            <strong className="text-foreground">Site URL</strong> in Supabase → Authentication → URL
            configuration to your production URL (same host as this app) and request a
            new reset. Some mail scanners burn one-time links; try resend or another inbox.
          </p>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          Optional: if your email shows a <strong className="text-foreground">6-digit code</strong>{" "}
          (custom template), enter it for{" "}
          <span className="text-foreground font-medium">{email}</span>.
        </p>
        <form onSubmit={verifyCode} className="space-y-4">
          {error && (
            <p className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="recovery-otp">Code (only if shown in email)</Label>
            <Input
              id="recovery-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Optional 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="tracking-widest font-mono text-lg"
              maxLength={12}
            />
          </div>
          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? "Verifying…" : "Verify code"}
          </Button>
        </form>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={loading}
            onClick={async () => {
              setError(null);
              setLoading(true);
              const supabase = createClient();
              const { error: rErr } = await supabase.auth.resetPasswordForEmail(
                email,
                { redirectTo: callbackForRecovery() }
              );
              setLoading(false);
              if (rErr) setError(rErr.message);
            }}
          >
            Resend email
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
          >
            Different email
          </Button>
        </div>
        <p className="text-xs text-muted">
          Already clicked the link in this browser?{" "}
          <Link
            href="/auth/update-password"
            className="text-accent font-medium hover:underline"
          >
            Set new password
          </Link>
        </p>
        <Link
          href="/login"
          className="text-sm text-accent font-medium hover:underline inline-block"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  if (step === "password") {
    return (
      <form onSubmit={savePassword} className="space-y-5">
        <p className="text-sm text-muted leading-relaxed">
          Choose a new password for{" "}
          <span className="text-foreground font-medium">{email}</span>.
        </p>
        {error && (
          <p className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="npw">New password</Label>
          <Input
            id="npw"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="npw2">Confirm password</Label>
          <Input
            id="npw2"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? "Saving…" : "Update password & sign in"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="space-y-5">
      {error && (
        <p className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>
      <Button type="submit" className="w-full h-12" disabled={loading}>
        {loading ? "Sending…" : "Send reset email"}
      </Button>
    </form>
  );
}
