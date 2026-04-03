import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile, decisions, reflections, insights] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("decisions").select("*").eq("user_id", user.id),
    supabase.from("reflections").select("*").eq("user_id", user.id),
    supabase.from("ai_insights").select("*").eq("user_id", user.id),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    profile: profile.data,
    decisions: decisions.data ?? [],
    reflections: reflections.data ?? [],
    ai_insights: insights.data ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="noregrets-export-${user.id.slice(0, 8)}.json"`,
    },
  });
}
