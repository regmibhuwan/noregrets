import { generatePatternBundle } from "@/lib/ai/patterns";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: decisions, error: dErr } = await supabase
    .from("decisions")
    .select("*")
    .eq("user_id", user.id)
    .order("decision_date", { ascending: false });

  if (dErr) {
    return NextResponse.json({ error: dErr.message }, { status: 500 });
  }

  const { data: reflections, error: rErr } = await supabase
    .from("reflections")
    .select("*")
    .eq("user_id", user.id);

  if (rErr) {
    return NextResponse.json({ error: rErr.message }, { status: 500 });
  }

  const historyJson = JSON.stringify(
    {
      decisions: decisions ?? [],
      reflections: reflections ?? [],
    },
    null,
    0
  );

  const bundle = await generatePatternBundle(historyJson);
  if ("error" in bundle) {
    return NextResponse.json({ error: bundle.error }, { status: 502 });
  }

  await supabase
    .from("ai_insights")
    .delete()
    .eq("user_id", user.id)
    .in("insight_type", ["profile", "pattern", "warning", "advice"]);

  const inserts: {
    user_id: string;
    insight_type: string;
    title: string;
    content: string;
    why_matters: string | null;
    metadata: Record<string, unknown>;
  }[] = [];

  inserts.push({
    user_id: user.id,
    insight_type: "profile",
    title: bundle.decision_profile.title,
    content: bundle.decision_profile.summary,
    why_matters: null,
    metadata: {
      strengths: bundle.decision_profile.strengths,
      watchouts: bundle.decision_profile.watchouts,
    },
  });

  for (const p of bundle.patterns) {
    inserts.push({
      user_id: user.id,
      insight_type: p.insight_type,
      title: p.title,
      content: p.content,
      why_matters: p.why_matters,
      metadata: {},
    });
  }
  for (const w of bundle.warnings) {
    inserts.push({
      user_id: user.id,
      insight_type: w.insight_type,
      title: w.title,
      content: w.content,
      why_matters: w.why_matters,
      metadata: {},
    });
  }
  for (const a of bundle.advice) {
    inserts.push({
      user_id: user.id,
      insight_type: a.insight_type,
      title: a.title,
      content: a.content,
      why_matters: a.why_matters,
      metadata: {},
    });
  }

  const { error: insErr } = await supabase.from("ai_insights").insert(inserts);
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: inserts.length });
}
