import { CategoryChart } from "@/components/category-chart";
import { EmptyState } from "@/components/empty-state";
import { SeedDemoButton } from "@/components/seed-demo-button";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { computeDashboardStats, isFollowUpDue } from "@/lib/stats";

type DecisionRow = Database["public"]["Tables"]["decisions"]["Row"];
type InsightPreview = Pick<
  Database["public"]["Tables"]["ai_insights"]["Row"],
  "id" | "title" | "content" | "insight_type" | "created_at"
>;
import { format } from "date-fns";
import { CalendarClock, ListChecks, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: decisions }, { data: reflections }] = await Promise.all([
    supabase
      .from("decisions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("reflections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const list: DecisionRow[] = (decisions ?? []) as DecisionRow[];
  const refl = reflections ?? [];
  const stats = computeDashboardStats(list, refl);

  const chartData = CATEGORIES.map((c) => {
    const agg = stats.byCategory[c.value] ?? { total: 0, regretted: 0 };
    return {
      category: c.label,
      count: agg.total,
      regretted: agg.regretted,
    };
  }).filter((d) => d.count > 0);

  const upcoming = list
    .filter((d) => d.follow_up_date && ["pending", "decided"].includes(d.status))
    .filter((d) => {
      const t = new Date(d.follow_up_date!);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      t.setHours(0, 0, 0, 0);
      return t.getTime() >= today.getTime();
    })
    .sort(
      (a, b) =>
        new Date(a.follow_up_date!).getTime() -
        new Date(b.follow_up_date!).getTime()
    )
    .slice(0, 5);

  const dueNow = list.filter((d) => isFollowUpDue(d.follow_up_date, d.status));

  const topPatterns = await supabase
    .from("ai_insights")
    .select("id, title, content, insight_type, created_at")
    .eq("user_id", user.id)
    .in("insight_type", ["pattern", "warning"])
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted text-sm mt-1">
          A snapshot of how you are deciding — and where a gentle check-in might help.
        </p>
      </div>

      {list.length === 0 && (
        <EmptyState
          icon={ListChecks}
          title="Log your first decision"
          description="Most regret comes from forgotten context. One entry is enough to start seeing the shape of your choices."
          action={
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center items-center">
              <Link href="/decisions/new">
                <Button>New decision</Button>
              </Link>
              <SeedDemoButton />
            </div>
          }
        />
      )}

      {list.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">
                Total decisions
              </p>
              <p className="text-3xl font-semibold mt-1">{stats.total}</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">
                Regret rate
              </p>
              <p className="text-3xl font-semibold mt-1">{stats.regretRate}%</p>
              <p className="text-xs text-muted mt-1">Among decided or revisited</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">
                Satisfaction rate
              </p>
              <p className="text-3xl font-semibold mt-1">
                {stats.satisfactionRate}%
              </p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">
                Open high-risk
              </p>
              <p className="text-3xl font-semibold mt-1">
                {stats.highRisk.length}
              </p>
              <p className="text-xs text-muted mt-1">Risk score ≥ 60</p>
            </Card>
          </div>

          {dueNow.length > 0 && (
            <Card className="border-accent/30 bg-accent-soft/30 dark:bg-accent-soft/10">
              <div className="flex items-start gap-3">
                <CalendarClock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <CardTitle className="text-base">
                    Ready for reflection
                  </CardTitle>
                  <ul className="mt-2 space-y-1 text-sm">
                    {dueNow.map((d) => (
                      <li key={d.id}>
                        <Link
                          href={`/decisions/${d.id}/reflect`}
                          className="text-accent font-medium hover:underline"
                        >
                          {d.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardTitle>By category</CardTitle>
              <p className="text-sm text-muted mt-1 mb-2">
                Totals and regrets per area of life.
              </p>
              {chartData.length ? (
                <CategoryChart data={chartData} />
              ) : (
                <p className="text-sm text-muted py-8">Not enough data yet.</p>
              )}
            </Card>

            <Card>
              <CardTitle>Upcoming follow-ups</CardTitle>
              <ul className="mt-4 space-y-3">
                {upcoming.length === 0 && (
                  <li className="text-sm text-muted">None scheduled.</li>
                )}
                {upcoming.map((d) => (
                  <li
                    key={d.id}
                    className="flex justify-between gap-2 text-sm border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0"
                  >
                    <Link
                      href={`/decisions/${d.id}`}
                      className="font-medium hover:text-accent truncate"
                    >
                      {d.title}
                    </Link>
                    <span className="text-muted shrink-0">
                      {format(new Date(d.follow_up_date!), "MMM d")}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardTitle>High-risk open decisions</CardTitle>
              <ul className="mt-4 space-y-3">
                {stats.highRisk.length === 0 && (
                  <li className="text-sm text-muted">
                    No open items flagged high risk. Nice balance.
                  </li>
                )}
                {stats.highRisk.map((d) => (
                  <li key={d.id} className="text-sm">
                    <Link
                      href={`/decisions/${d.id}`}
                      className="font-medium hover:text-accent"
                    >
                      {d.title}
                    </Link>
                    <span className="text-muted ml-2">
                      score {d.risk_score ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Recent reflections</CardTitle>
                <Link href="/decisions">
                  <Button variant="ghost" size="sm">
                    All decisions
                  </Button>
                </Link>
              </div>
              <ul className="mt-4 space-y-3">
                {stats.recentReflections.length === 0 && (
                  <li className="text-sm text-muted">
                    Reflections appear after you revisit a decision.
                  </li>
                )}
                {stats.recentReflections.map((r) => (
                  <li key={r.id} className="text-sm border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                    <p className="text-muted text-xs">
                      {format(new Date(r.created_at), "MMM d, yyyy")}
                    </p>
                    <p className="line-clamp-2">{r.how_feel_now}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Strongest patterns</CardTitle>
                <p className="text-sm text-muted mt-1">
                  From your last AI analysis. Regenerate anytime on Insights.
                </p>
              </div>
              <Link href="/insights">
                <Button variant="secondary" size="sm">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Insights
                </Button>
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {(topPatterns.data ?? []).length === 0 && (
                <li className="text-sm text-muted">
                  Run pattern analysis on the Insights page to populate this.
                </li>
              )}
              {(topPatterns.data ?? []).map((p) => {
                const row = p as InsightPreview;
                return (
                  <li key={row.id} className="text-sm">
                    <span className="font-medium">{row.title}</span>
                    <p className="text-muted line-clamp-2 mt-0.5">
                      {row.content}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
