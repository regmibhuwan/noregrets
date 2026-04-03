import { getOpenAI, AI_MODEL } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { decisionId } = await req.json().catch(() => ({}));
  if (!decisionId || typeof decisionId !== "string") {
    return NextResponse.json({ error: "decisionId required" }, { status: 400 });
  }

  const { data: d, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("id", decisionId)
    .eq("user_id", user.id)
    .single();

  if (error || !d) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const openai = getOpenAI();
  if (!openai) {
    return NextResponse.json(
      { error: "OpenAI is not configured." },
      { status: 503 }
    );
  }

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Summarize a personal decision for the decision owner. JSON only: { "summary": string (3-4 sentences), "why_matters": string (1-2 sentences) }. Neutral, kind, specific.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          title: d.title,
          category: d.category,
          description: d.description,
          expected_outcome: d.expected_outcome,
          confidence: d.confidence_level,
          urgency: d.urgency,
          status: d.status,
          feeling_at_time: d.feeling_at_time,
        }),
      },
    ],
    temperature: 0.35,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    return NextResponse.json({ error: "No AI output" }, { status: 502 });
  }

  let summary = "";
  let whyMatters = "";
  try {
    const parsed = JSON.parse(raw) as {
      summary?: string;
      why_matters?: string;
    };
    summary = parsed.summary ?? "";
    whyMatters = parsed.why_matters ?? "";
  } catch {
    return NextResponse.json({ error: "Bad AI JSON" }, { status: 502 });
  }

  await supabase
    .from("decisions")
    .update({ ai_summary: summary })
    .eq("id", decisionId)
    .eq("user_id", user.id);

  await supabase.from("ai_insights").insert({
    user_id: user.id,
    decision_id: decisionId,
    insight_type: "summary",
    title: "Decision summary",
    content: summary,
    why_matters: whyMatters,
    metadata: {},
  });

  return NextResponse.json({ summary, whyMatters });
}
