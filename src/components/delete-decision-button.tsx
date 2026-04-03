"use client";

import { deleteDecision } from "@/app/actions/decisions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteDecisionButton({ decisionId }: { decisionId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="danger"
      disabled={pending}
      onClick={async () => {
        if (
          !confirm(
            "Delete this decision and its reflections? This cannot be undone."
          )
        ) {
          return;
        }
        setPending(true);
        const r = await deleteDecision(decisionId);
        setPending(false);
        if (r.error) {
          alert(r.error);
          return;
        }
        router.push("/decisions");
        router.refresh();
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
