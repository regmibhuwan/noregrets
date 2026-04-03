"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { emailOnlySchema } from "@/lib/validations";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const parsed = emailOnlySchema.safeParse({ email: fd.get("email") });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    const email = parsed.data.email;
    setLoading(true);
    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const next = encodeURIComponent("/auth/update-password");
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${origin}/auth/callback?next=${next}`,
      }
    );
    setLoading(false);
    if (resetErr) {
      setError(resetErr.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="text-sm text-muted space-y-4 leading-relaxed">
        <p>
          If that email exists and is confirmed, Supabase sent a reset link.
          Check spam, then open the link on this device.
        </p>
        <Link href="/login" className="text-accent font-semibold hover:underline inline-block">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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
        {loading ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
