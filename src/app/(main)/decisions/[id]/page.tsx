import { DecisionForm } from "@/components/decision-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { CATEGORIES, DECISION_STATUS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DecisionDetailActions } from "@/components/decision-detail-actions";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { title: "Decision" };
  const { data } = await supabase
    .from("decisions")
    .select("title")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();
  return { title: data?.title ?? "Decision" };
}

export default async function DecisionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: d, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !d) notFound();

  const { data: reflections } = await supabase
    .from("reflections")
    .select("*")
    .eq("decision_id", d.id)
    .order("created_at", { ascending: false });

  const catLabel =
    CATEGORIES.find((c) => c.value === d.category)?.label ?? d.category;
  const statusLabel =
    DECISION_STATUS.find((s) => s.value === d.status)?.label ?? d.status;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/decisions"
            className="text-sm text-muted hover:text-foreground"
          >
            ← All decisions
          </Link>
          <h1 className="text-2xl font-semibold mt-2">{d.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge>{catLabel}</Badge>
            <Badge className="capitalize">{statusLabel}</Badge>
            {d.risk_score != null && (
              <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
                Risk {d.risk_score}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/decisions/${d.id}/reflect`}>
            <Button>Reflect</Button>
          </Link>
          <DecisionDetailActions decisionId={d.id} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardTitle className="text-base">Snapshot</CardTitle>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted">Decision date</dt>
              <dd>{format(new Date(d.decision_date), "MMMM d, yyyy")}</dd>
            </div>
            <div>
              <dt className="text-muted">Follow-up</dt>
              <dd>
                {d.follow_up_date
                  ? format(new Date(d.follow_up_date), "MMMM d, yyyy")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Confidence</dt>
              <dd>{d.confidence_level ?? "—"} / 5</dd>
            </div>
            <div>
              <dt className="text-muted">Urgency</dt>
              <dd className="capitalize">{d.urgency}</dd>
            </div>
            {d.people_involved && (
              <div>
                <dt className="text-muted">People</dt>
                <dd>{d.people_involved}</dd>
              </div>
            )}
          </dl>
        </Card>
        <Card>
          <CardTitle className="text-base">AI summary</CardTitle>
          <p className="text-sm text-muted mt-2">
            {d.ai_summary ||
              "Generate a neutral summary you can skim later — grounded in this card only."}
          </p>
        </Card>
      </div>

      <Card>
        <CardTitle className="text-base">Context</CardTitle>
        <p className="text-sm mt-2 whitespace-pre-wrap">
          {d.description || "—"}
        </p>
      </Card>

      <Card>
        <CardTitle className="text-base">Expected outcome</CardTitle>
        <p className="text-sm mt-2 whitespace-pre-wrap">
          {d.expected_outcome || "—"}
        </p>
      </Card>

      {d.feeling_at_time && (
        <Card>
          <CardTitle className="text-base">How you felt then</CardTitle>
          <p className="text-sm mt-2 whitespace-pre-wrap">
            {d.feeling_at_time}
          </p>
        </Card>
      )}

      {d.tags?.length ? (
        <p className="text-sm text-muted">Tags: {d.tags.join(", ")}</p>
      ) : null}

      <Card>
        <CardTitle className="text-base mb-2">Reflections</CardTitle>
        {(reflections ?? []).length === 0 ? (
          <p className="text-sm text-muted">
            No reflections yet. When your follow-up date hits, pause here and
            capture what changed.
          </p>
        ) : (
          <ul className="space-y-4">
            {(reflections ?? []).map((r) => (
              <li
                key={r.id}
                className="border-t border-slate-100 dark:border-slate-800 pt-4 first:border-0 first:pt-0"
              >
                <p className="text-xs text-muted">
                  {format(new Date(r.created_at), "MMM d, yyyy")} · worked out:{" "}
                  {r.worked_out}
                  {r.sentiment ? ` · ${r.sentiment}` : ""}
                </p>
                <p className="text-sm mt-1">{r.how_feel_now}</p>
                {r.what_changed && (
                  <p className="text-sm text-muted mt-1">{r.what_changed}</p>
                )}
                {r.free_notes && (
                  <p className="text-sm mt-2 whitespace-pre-wrap">
                    {r.free_notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Edit decision</h2>
        <DecisionForm mode="edit" initial={d} />
      </div>
    </div>
  );
}
