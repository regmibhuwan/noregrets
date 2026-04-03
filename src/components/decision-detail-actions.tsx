"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteDecisionButton } from "@/components/delete-decision-button";

export function DecisionDetailActions({ decisionId }: { decisionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function summarize() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Could not summarize");
        return;
      }
      router.refresh();
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch sm:items-end gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={summarize}
          disabled={loading}
        >
          {loading ? "Summarizing…" : "AI summarize"}
        </Button>
        <DeleteDecisionButton decisionId={decisionId} />
      </div>
      {err && <p className="text-xs text-danger text-right">{err}</p>}
    </div>
  );
}
