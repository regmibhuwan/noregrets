import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CATEGORIES, DECISION_STATUS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import Link from "next/link";

export const metadata = { title: "Decisions" };

type Search = {
  q?: string;
  status?: string;
  category?: string;
  from?: string;
  to?: string;
  tag?: string;
  sentiment?: string;
};

export default async function DecisionsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let query = supabase
    .from("decisions")
    .select("*")
    .eq("user_id", user.id)
    .order("decision_date", { ascending: false });

  const qRaw = (searchParams.q ?? "").trim();
  const safeQ = qRaw.replace(/%/g, "").replace(/_/g, "").slice(0, 120);
  if (safeQ) {
    query = query.or(
      `title.ilike.%${safeQ}%,description.ilike.%${safeQ}%,expected_outcome.ilike.%${safeQ}%`
    );
  }

  if (searchParams.status && searchParams.status !== "all") {
    query = query.eq("status", searchParams.status);
  }

  if (searchParams.category && searchParams.category !== "all") {
    query = query.eq("category", searchParams.category);
  }

  if (searchParams.from) {
    query = query.gte("decision_date", searchParams.from);
  }
  if (searchParams.to) {
    query = query.lte("decision_date", searchParams.to);
  }

  if (searchParams.tag?.trim()) {
    query = query.contains("tags", [searchParams.tag.trim().toLowerCase()]);
  }

  const { data: rows, error } = await query;

  let list = rows ?? [];

  if (searchParams.sentiment && searchParams.sentiment !== "all") {
    const { data: refs } = await supabase
      .from("reflections")
      .select("decision_id")
      .eq("user_id", user.id)
      .eq("sentiment", searchParams.sentiment);

    const ids = new Set((refs ?? []).map((r) => r.decision_id));
    list = list.filter((d) => ids.has(d.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Decisions</h1>
          <p className="text-sm text-muted mt-1">
            Search by title, filter by status, category, dates, or reflection
            tone.
          </p>
        </div>
        <Link href="/decisions/new">
          <Button>New decision</Button>
        </Link>
      </div>

      <Card className="p-4">
        <form
          method="get"
          action="/decisions"
          className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
        >
          <div className="lg:col-span-2">
            <label className="text-xs font-medium text-muted block mb-1">
              Search
            </label>
            <Input
              name="q"
              placeholder="Title, context, expected outcome…"
              defaultValue={searchParams.q}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1">
              Status
            </label>
            <select
              name="status"
              defaultValue={searchParams.status ?? "all"}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-card px-3 py-2.5 text-sm"
            >
              <option value="all">All</option>
              {DECISION_STATUS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1">
              Category
            </label>
            <select
              name="category"
              defaultValue={searchParams.category ?? "all"}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-card px-3 py-2.5 text-sm"
            >
              <option value="all">All</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1">
              From
            </label>
            <Input name="from" type="date" defaultValue={searchParams.from} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1">
              To
            </label>
            <Input name="to" type="date" defaultValue={searchParams.to} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1">
              Tag
            </label>
            <Input name="tag" placeholder="exact tag" defaultValue={searchParams.tag} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1">
              Reflection sentiment
            </label>
            <select
              name="sentiment"
              defaultValue={searchParams.sentiment ?? "all"}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-card px-3 py-2.5 text-sm"
            >
              <option value="all">All</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="mixed">Mixed</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit">Apply</Button>
            <Link href="/decisions">
              <Button type="button" variant="ghost">
                Reset
              </Button>
            </Link>
          </div>
        </form>
      </Card>

      {error && (
        <p className="text-sm text-danger">Could not load decisions.</p>
      )}

      <ul className="space-y-3">
        {list.length === 0 && (
          <Card className="p-8 text-center text-muted text-sm">
            No decisions match. Try widening filters or{" "}
            <Link href="/decisions/new" className="text-accent font-medium">
              add one
            </Link>
            .
          </Card>
        )}
        {list.map((d) => (
          <li key={d.id}>
            <Link href={`/decisions/${d.id}`}>
              <Card className="p-4 hover:shadow-soft-lg transition-shadow cursor-pointer">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{d.title}</h2>
                    <p className="text-xs text-muted mt-1">
                      {format(new Date(d.decision_date), "MMM d, yyyy")} ·{" "}
                      {CATEGORIES.find((c) => c.value === d.category)?.label ??
                        d.category}
                    </p>
                  </div>
                  <Badge className="capitalize bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {d.status}
                  </Badge>
                </div>
                {d.description && (
                  <p className="text-sm text-muted line-clamp-2 mt-2">
                    {d.description}
                  </p>
                )}
                {d.tags?.length ? (
                  <p className="text-xs text-muted mt-2">
                    {d.tags.join(" · ")}
                  </p>
                ) : null}
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
