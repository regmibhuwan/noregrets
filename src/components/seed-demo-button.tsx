"use client";

import { seedDemoDecisions } from "@/app/actions/seed";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SeedDemoButton() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="w-full max-w-sm">
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        onClick={() => {
          setErr(null);
          start(async () => {
            const r = await seedDemoDecisions();
            if (r.error) setErr(r.error);
            else router.refresh();
          });
        }}
      >
        {pending ? "Loading…" : "Try sample data"}
      </Button>
      {err && (
        <p className="text-xs text-danger mt-2 text-center">{err}</p>
      )}
    </div>
  );
}
