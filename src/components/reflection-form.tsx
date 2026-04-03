"use client";

import { createReflection } from "@/app/actions/reflections";
import type { ActionState } from "@/app/actions/decisions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

function SubmitReflection() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving reflection…" : "Save reflection"}
    </Button>
  );
}

export function ReflectionForm({ decisionId }: { decisionId: string }) {
  const router = useRouter();
  const [prompts, setPrompts] = useState<string[]>([]);
  const [promptErr, setPromptErr] = useState<string | null>(null);

  const [state, action] = useFormState<ActionState, FormData>(
    async (prev, formData) => createReflection(decisionId, prev, formData),
    {}
  );

  useEffect(() => {
    if (state?.ok) {
      router.push(`/decisions/${decisionId}`);
      router.refresh();
    }
  }, [state?.ok, decisionId, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ai/reflection-prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decisionId }),
        });
        const data = await res.json();
        if (!cancelled && res.ok && Array.isArray(data.prompts)) {
          setPrompts(data.prompts);
        } else if (!cancelled && !res.ok) {
          setPromptErr(data.error ?? null);
        }
      } catch {
        if (!cancelled) setPromptErr("Could not load prompts");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [decisionId]);

  return (
    <form action={action} className="space-y-6 max-w-xl">
      {state?.error && (
        <p className="text-sm text-danger bg-danger/5 border border-danger/15 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      {(prompts.length > 0 || promptErr) && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-card p-4">
          <p className="text-sm font-medium mb-2">Questions to sit with</p>
          {promptErr ? (
            <p className="text-xs text-muted">{promptErr}</p>
          ) : (
            <ul className="list-disc list-inside text-sm text-muted space-y-1">
              {prompts.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="workedOut">Did it work out the way you hoped?</Label>
        <select
          id="workedOut"
          name="workedOut"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-card px-3 py-2.5 text-sm"
        >
          <option value="">Choose</option>
          <option value="yes">Mostly yes</option>
          <option value="partially">Partially / it is complicated</option>
          <option value="no">Mostly no</option>
        </select>
      </div>

      <div>
        <Label htmlFor="howFeelNow">How do you feel about it now?</Label>
        <Textarea
          id="howFeelNow"
          name="howFeelNow"
          required
          className="mt-1"
          placeholder="No need to polish — honest is enough."
        />
      </div>

      <div>
        <Label htmlFor="whatChanged">What changed since you decided?</Label>
        <Textarea
          id="whatChanged"
          name="whatChanged"
          className="mt-1"
          placeholder="Facts, relationships, or information that shifted."
        />
      </div>

      <div>
        <Label htmlFor="wouldRepeat">Would you make the same call again?</Label>
        <select
          id="wouldRepeat"
          name="wouldRepeat"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-card px-3 py-2.5 text-sm"
        >
          <option value="">Choose</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="unsure">Not sure yet</option>
        </select>
      </div>

      <div>
        <Label htmlFor="freeNotes">Anything else?</Label>
        <Textarea
          id="freeNotes"
          name="freeNotes"
          className="mt-1"
          placeholder="Optional free notes"
        />
      </div>

      <SubmitReflection />
    </form>
  );
}
