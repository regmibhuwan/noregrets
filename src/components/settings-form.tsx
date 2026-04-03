"use client";

import type { ActionState } from "@/app/actions/decisions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormState, useFormStatus } from "react-dom";

function SaveSettingsButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function SettingsForm({
  action,
  defaultDisplayName,
  reminderEmailEnabled,
  privacyAnalytics,
}: {
  action: (
    prev: ActionState,
    formData: FormData
  ) => Promise<ActionState>;
  defaultDisplayName: string;
  reminderEmailEnabled: boolean;
  privacyAnalytics: boolean;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <p className="text-sm text-danger bg-danger/5 border border-danger/15 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-accent">Saved.</p>
      )}
      <div>
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={defaultDisplayName}
          required
          className="mt-1"
        />
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="reminderEmailEnabled"
          value="on"
          defaultChecked={reminderEmailEnabled}
          className="mt-1 rounded border-slate-300"
        />
        <span>
          <span className="text-sm font-medium block">
            Email reminders for follow-ups
          </span>
          <span className="text-xs text-muted">
            We send a short note when a reflection date you set has arrived.
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="privacyAnalytics"
          value="on"
          defaultChecked={privacyAnalytics}
          className="mt-1 rounded border-slate-300"
        />
        <span>
          <span className="text-sm font-medium block">
            Product analytics placeholder
          </span>
          <span className="text-xs text-muted">
            Reserved for future in-app analytics toggles; stored on your profile
            for when you wire telemetry.
          </span>
        </span>
      </label>
      <SaveSettingsButton />
    </form>
  );
}
