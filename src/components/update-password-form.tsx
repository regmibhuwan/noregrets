"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const pw = String(fd.get("password") ?? "");
    const again = String(fd.get("password2") ?? "");
    if (pw.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (pw !== again) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      setError(
        "No active session. Open the reset link from your email in this browser, or request a new reset from Forgot password."
      );
      return;
    }
    const { error: upErr } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-card p-6 shadow-soft"
    >
      {error && (
        <p className="text-sm text-danger bg-danger/5 border border-danger/15 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="password2">Confirm password</Label>
        <Input
          id="password2"
          name="password2"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="mt-1"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
