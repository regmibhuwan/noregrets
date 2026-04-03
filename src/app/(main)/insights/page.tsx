import { Card, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { InsightsRefresh } from "@/components/insights-refresh";

export const metadata = { title: "Insights" };

export default async function InsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: insights } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  const profile = (insights ?? []).find((i) => i.insight_type === "profile");
  const patterns = (insights ?? []).filter((i) => i.insight_type === "pattern");
  const warnings = (insights ?? []).filter((i) => i.insight_type === "warning");
  const advice = (insights ?? []).filter((i) => i.insight_type === "advice");
  const summaries = (insights ?? []).filter((i) => i.insight_type === "summary");

  const meta = profile?.metadata as
    | { strengths?: string[]; watchouts?: string[] }
    | null
    | undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Insights</h1>
          <p className="text-sm text-muted mt-1">
            Patterns and guidance grounded in your own log — regenerated when
            you ask, so it stays current.
          </p>
        </div>
        <InsightsRefresh />
      </div>

      {profile && (
        <Card className="border-accent/25 bg-accent-soft/15 dark:bg-accent-soft/10">
          <CardTitle>Decision profile</CardTitle>
          <p className="text-lg font-medium mt-2">{profile.title}</p>
          <p className="text-sm mt-2 leading-relaxed">{profile.content}</p>
          {meta?.strengths?.length ? (
            <div className="mt-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                Strengths
              </p>
              <ul className="mt-1 text-sm list-disc list-inside">
                {meta.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {meta?.watchouts?.length ? (
            <div className="mt-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                Watchouts
              </p>
              <ul className="mt-1 text-sm list-disc list-inside">
                {meta.watchouts.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      )}

      {!profile && (
        <Card>
          <p className="text-sm text-muted">
            Run an analysis to generate your decision profile and pattern read.
            It works best after you have a few decisions and at least one
            reflection.
          </p>
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Patterns</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {patterns.length === 0 && (
            <p className="text-sm text-muted md:col-span-2">
              No stored patterns yet.
            </p>
          )}
          {patterns.map((p) => (
            <Card key={p.id}>
              <CardTitle className="text-base">{p.title}</CardTitle>
              <p className="text-sm mt-2 leading-relaxed">{p.content}</p>
              {p.why_matters && (
                <p className="text-xs text-muted mt-3">
                  <span className="font-semibold text-foreground">
                    Why this matters:{" "}
                  </span>
                  {p.why_matters}
                </p>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Warnings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {warnings.length === 0 && (
            <p className="text-sm text-muted md:col-span-2">None right now.</p>
          )}
          {warnings.map((p) => (
            <Card key={p.id} className="border-danger/20">
              <CardTitle className="text-base">{p.title}</CardTitle>
              <p className="text-sm mt-2 leading-relaxed">{p.content}</p>
              {p.why_matters && (
                <p className="text-xs text-muted mt-3">
                  <span className="font-semibold text-foreground">
                    Why this matters:{" "}
                  </span>
                  {p.why_matters}
                </p>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Suggestions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {advice.length === 0 && (
            <p className="text-sm text-muted md:col-span-2">None right now.</p>
          )}
          {advice.map((p) => (
            <Card key={p.id}>
              <CardTitle className="text-base">{p.title}</CardTitle>
              <p className="text-sm mt-2 leading-relaxed">{p.content}</p>
              {p.why_matters && (
                <p className="text-xs text-muted mt-3">
                  <span className="font-semibold text-foreground">
                    Why this matters:{" "}
                  </span>
                  {p.why_matters}
                </p>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent decision summaries</h2>
        <ul className="space-y-2">
          {summaries.length === 0 && (
            <li className="text-sm text-muted">
              Summaries appear when you tap &quot;AI summarize&quot; on a
              decision.
            </li>
          )}
          {summaries.slice(0, 8).map((s) => (
            <li key={s.id}>
              <Card className="p-4">
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-sm text-muted mt-1 line-clamp-3">
                  {s.content}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
