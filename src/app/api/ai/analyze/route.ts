import { analyzeDecisionPayload } from "@/lib/ai/decision-analyze";
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

  const body = await req.json().catch(() => null);
  if (!body || typeof body.title !== "string") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const result = await analyzeDecisionPayload({
    title: body.title,
    category: String(body.category ?? "other"),
    description: body.description,
    expectedOutcome: body.expectedOutcome,
    confidenceLevel: Number(body.confidenceLevel) || 3,
    urgency: String(body.urgency ?? "medium"),
    peopleInvolved: body.peopleInvolved,
    feelingAtTime: body.feelingAtTime,
  });

  if ("error" in result && typeof result.error === "string") {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json(result);
}
