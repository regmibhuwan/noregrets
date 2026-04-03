"use server";

import { reflectionSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionState } from "./decisions";

function inferSentiment(
  workedOut: string,
  wouldRepeat: string
): "positive" | "negative" | "mixed" | "neutral" {
  if (workedOut === "no") return "negative";
  if (workedOut === "yes" && wouldRepeat === "yes") return "positive";
  if (workedOut === "yes" && wouldRepeat === "no") return "mixed";
  if (workedOut === "partially") return "mixed";
  return "neutral";
}

export async function createReflection(
  decisionId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    workedOut: formData.get("workedOut"),
    howFeelNow: formData.get("howFeelNow"),
    whatChanged: formData.get("whatChanged") || null,
    wouldRepeat: formData.get("wouldRepeat"),
    freeNotes: formData.get("freeNotes") || null,
  };

  const parsed = reflectionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const { data: decision, error: decErr } = await supabase
    .from("decisions")
    .select("id, status")
    .eq("id", decisionId)
    .eq("user_id", user.id)
    .single();

  if (decErr || !decision) return { error: "Decision not found." };

  const r = parsed.data;
  const wouldRepeatBool =
    r.wouldRepeat === "yes" ? true : r.wouldRepeat === "no" ? false : null;

  const sentiment = inferSentiment(r.workedOut, r.wouldRepeat);

  const { error } = await supabase.from("reflections").insert({
    user_id: user.id,
    decision_id: decisionId,
    worked_out: r.workedOut,
    how_feel_now: r.howFeelNow,
    what_changed: r.whatChanged,
    would_repeat: wouldRepeatBool,
    free_notes: r.freeNotes,
    sentiment,
  });

  if (error) return { error: error.message };

  const nextStatus =
    decision.status === "regretted" || decision.status === "satisfied"
      ? decision.status
      : "revisited";

  await supabase
    .from("decisions")
    .update({ status: nextStatus })
    .eq("id", decisionId)
    .eq("user_id", user.id);

  revalidatePath(`/decisions/${decisionId}`);
  revalidatePath("/decisions");
  revalidatePath("/dashboard");
  return { ok: true, id: decisionId };
}
