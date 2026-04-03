"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function InsightsRefresh() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/insights", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error ?? "Could not refresh");
        return;
      }
      setMsg(`Updated ${data.count} insight blocks.`);
      router.refresh();
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch sm:items-end gap-1">
      <Button
        type="button"
        variant="secondary"
        onClick={run}
        disabled={loading}
      >
        {loading ? "Analyzing…" : "Regenerate insights"}
      </Button>
      {msg && <p className="text-xs text-muted text-right">{msg}</p>}
    </div>
  );
}
