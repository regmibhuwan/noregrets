import type { Database } from "@/lib/database.types";

type DecisionRow = Database["public"]["Tables"]["decisions"]["Row"];
type ReflectionRow = Database["public"]["Tables"]["reflections"]["Row"];

export function computeDashboardStats(
  decisions: DecisionRow[],
  reflections: ReflectionRow[]
) {
  const total = decisions.length;
  const regretted = decisions.filter((d) => d.status === "regretted").length;
  const satisfied = decisions.filter((d) => d.status === "satisfied").length;
  const decidedOrMore = decisions.filter((d) =>
    ["decided", "revisited", "regretted", "satisfied"].includes(d.status)
  ).length;

  const regretRate =
    decidedOrMore > 0 ? Math.round((regretted / decidedOrMore) * 100) : 0;
  const satisfactionRate =
    decidedOrMore > 0 ? Math.round((satisfied / decidedOrMore) * 100) : 0;

  const highRisk = decisions
    .filter(
      (d) =>
        (d.risk_score ?? 0) >= 60 &&
        ["pending", "decided"].includes(d.status)
    )
    .sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0))
    .slice(0, 5);

  const byCategory: Record<string, { total: number; regretted: number }> = {};
  for (const d of decisions) {
    if (!byCategory[d.category]) {
      byCategory[d.category] = { total: 0, regretted: 0 };
    }
    byCategory[d.category].total += 1;
    if (d.status === "regretted") byCategory[d.category].regretted += 1;
  }

  const recentReflections = [...reflections]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  return {
    total,
    regretRate,
    satisfactionRate,
    highRisk,
    byCategory,
    recentReflections,
  };
}

export function isFollowUpDue(followUpDate: string | null, status: string) {
  if (!followUpDate) return false;
  if (!["pending", "decided"].includes(status)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(followUpDate);
  due.setHours(0, 0, 0, 0);
  return due.getTime() <= today.getTime();
}
