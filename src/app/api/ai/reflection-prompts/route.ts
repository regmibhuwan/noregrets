import { generateReflectionPrompts } from "@/lib/ai/reflection-prompts";
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
    .select("title, category, expected_outcome")
    .eq("id", decisionId)
    .eq("user_id", user.id)
    .single();

  if (error || !d) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const prompts = await generateReflectionPrompts({
    title: d.title,
    category: d.category,
    expectedOutcome: d.expected_outcome,
  });

  if (Array.isArray(prompts)) {
    return NextResponse.json({ prompts });
  }
  return NextResponse.json({ error: prompts.error }, { status: 502 });
}
