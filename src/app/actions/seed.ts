"use server";

import { ensureProfileRow } from "@/lib/supabase/ensure-profile";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionState } from "./decisions";

export async function seedDemoDecisions(): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const { error: profileErr } = await ensureProfileRow(supabase, user);
  if (profileErr) {
    return {
      error:
        "Could not sync your account. Sign out and sign in again, or run the latest Supabase migration.",
    };
  }

  const { count, error: countErr } = await supabase
    .from("decisions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countErr) return { error: countErr.message };
  if ((count ?? 0) > 0) {
    return { error: "You already have decisions. Demo data is for empty accounts." };
  }

  const rows = [
    {
      user_id: user.id,
      title: "Said no to an extra project at work",
      category: "work",
      description:
        "Team asked for a weekend push. I was already near capacity.",
      expected_outcome: "Protect focus; still be seen as reliable.",
      confidence_level: 4,
      urgency: "high" as const,
      people_involved: "Manager, two peers",
      decision_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)
        .toISOString()
        .slice(0, 10),
      follow_up_date: new Date().toISOString().slice(0, 10),
      tags: ["boundaries", "focus"],
      status: "decided" as const,
      feeling_at_time: "Anxious but clear it was the right tradeoff.",
      risk_score: 35,
    },
    {
      user_id: user.id,
      title: "Started a short course instead of scrolling at night",
      category: "learning",
      description: "Replaced 30 minutes of phone time with a structured lesson.",
      expected_outcome: "Steady progress without burnout.",
      confidence_level: 3,
      urgency: "low" as const,
      decision_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
        .toISOString()
        .slice(0, 10),
      follow_up_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
        .toISOString()
        .slice(0, 10),
      tags: ["habits", "evening"],
      status: "satisfied" as const,
      feeling_at_time: "Hopeful, a little tired.",
      risk_score: 22,
    },
    {
      user_id: user.id,
      title: "Agreed to a large purchase without a cooling-off day",
      category: "money",
      description: "Felt pressured by a limited-time framing.",
      expected_outcome: "Solve the problem immediately.",
      confidence_level: 5,
      urgency: "high" as const,
      decision_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60)
        .toISOString()
        .slice(0, 10),
      tags: ["impulse", "lesson"],
      status: "regretted" as const,
      feeling_at_time: "Excited in the moment.",
      risk_score: 78,
    },
  ];

  const { error } = await supabase.from("decisions").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/decisions");
  revalidatePath("/dashboard");
  revalidatePath("/insights");
  return { ok: true };
}
