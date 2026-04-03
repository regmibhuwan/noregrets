"use client";

import type { ActionState } from "@/app/actions/decisions";
import { completeOnboarding } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";

const initial: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full h-12" disabled={pending}>
      {pending ? "Saving…" : "Continue to dashboard"}
    </Button>
  );
}

export function OnboardingForm() {
  const router = useRouter();
  const [state, action] = useFormState(completeOnboarding, initial);

  useEffect(() => {
    if (state?.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }, [state?.ok, router]);

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <p className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl px-4 py-3">
          {state.error}
        </p>
      )}
      <div>
        <Label htmlFor="displayName">Preferred name</Label>
        <Input
          id="displayName"
          name="displayName"
          required
          className="mt-1"
          placeholder="How we greet you in reminders"
        />
      </div>
      <div>
        <Label htmlFor="focusAreas">
          Focus areas (optional, comma-separated)
        </Label>
        <Input
          id="focusAreas"
          name="focusAreas"
          className="mt-1"
          placeholder={CATEGORIES.map((c) => c.value).join(", ")}
        />
        <p className="text-xs text-muted mt-1.5">
          Helps you notice where you want the most clarity this season.
        </p>
      </div>
      <SubmitButton />
    </form>
  );
}
