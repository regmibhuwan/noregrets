import { DecisionForm } from "@/components/decision-form";
import Link from "next/link";

export const metadata = { title: "New decision" };

export default function NewDecisionPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/decisions"
          className="text-sm text-muted hover:text-foreground"
        >
          ← Back to decisions
        </Link>
        <h1 className="text-2xl font-semibold mt-2">New decision</h1>
        <p className="text-sm text-muted mt-1">
          Capture the story while you remember it. You can refine later.
        </p>
      </div>
      <DecisionForm mode="create" />
    </div>
  );
}
