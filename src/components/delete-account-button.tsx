"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteAccountButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div>
      <Button
        type="button"
        variant="danger"
        disabled={pending}
        onClick={async () => {
          setErr(null);
          if (
            !confirm(
              "Delete your account and all NoRegrets data permanently?"
            )
          ) {
            return;
          }
          setPending(true);
          try {
            const res = await fetch("/api/account/delete", { method: "POST" });
            const data = await res.json();
            if (!res.ok) {
              setErr(data.error ?? "Could not delete account");
              setPending(false);
              return;
            }
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/");
            router.refresh();
          } catch {
            setErr("Network error");
            setPending(false);
          }
        }}
      >
        {pending ? "Deleting…" : "Delete my account"}
      </Button>
      {err && <p className="text-sm text-danger mt-2">{err}</p>}
    </div>
  );
}
