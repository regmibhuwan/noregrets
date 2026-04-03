"use server";

import { decisionSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string; ok?: boolean; id?: string };

export async function createDecision(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description") || null,
    expectedOutcome: formData.get("expectedOutcome") || null,
    confidenceLevel: formData.get("confidenceLevel"),
    urgency: formData.get("urgency"),
    peopleInvolved: formData.get("peopleInvolved") || null,
    decisionDate: formData.get("decisionDate"),
    followUpDate: formData.get("followUpDate") || null,
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    status: formData.get("status"),
    feelingAtTime: formData.get("feelingAtTime") || null,
  };

  const parsed = decisionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const d = parsed.data;
  const riskRaw = formData.get("riskScore");
  const riskScore =
    riskRaw != null && riskRaw !== ""
      ? Math.max(0, Math.min(100, Number(riskRaw)))
      : null;

  const { data, error } = await supabase
    .from("decisions")
    .insert({
      user_id: user.id,
      title: d.title,
      category: d.category,
      description: d.description,
      expected_outcome: d.expectedOutcome,
      confidence_level: d.confidenceLevel,
      urgency: d.urgency,
      people_involved: d.peopleInvolved,
      decision_date: d.decisionDate,
      follow_up_date: d.followUpDate || null,
      tags: d.tags,
      status: d.status,
      feeling_at_time: d.feelingAtTime,
      risk_score: Number.isFinite(riskScore as number) ? riskScore : null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/decisions");
  revalidatePath("/dashboard");
  return { ok: true, id: data.id };
}

export async function updateDecision(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description") || null,
    expectedOutcome: formData.get("expectedOutcome") || null,
    confidenceLevel: formData.get("confidenceLevel"),
    urgency: formData.get("urgency"),
    peopleInvolved: formData.get("peopleInvolved") || null,
    decisionDate: formData.get("decisionDate"),
    followUpDate: formData.get("followUpDate") || null,
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    status: formData.get("status"),
    feelingAtTime: formData.get("feelingAtTime") || null,
  };

  const parsed = decisionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const d = parsed.data;
  const riskRaw = formData.get("riskScore");
  const riskScore =
    riskRaw != null && riskRaw !== ""
      ? Math.max(0, Math.min(100, Number(riskRaw)))
      : null;

  const { error } = await supabase
    .from("decisions")
    .update({
      title: d.title,
      category: d.category,
      description: d.description,
      expected_outcome: d.expectedOutcome,
      confidence_level: d.confidenceLevel,
      urgency: d.urgency,
      people_involved: d.peopleInvolved,
      decision_date: d.decisionDate,
      follow_up_date: d.followUpDate || null,
      tags: d.tags,
      status: d.status,
      feeling_at_time: d.feelingAtTime,
      risk_score: Number.isFinite(riskScore as number) ? riskScore : null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/decisions");
  revalidatePath(`/decisions/${id}`);
  revalidatePath("/dashboard");
  return { ok: true, id };
}

export async function deleteDecision(id: string): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const { error } = await supabase
    .from("decisions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/decisions");
  revalidatePath("/dashboard");
  return { ok: true };
}
