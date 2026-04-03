"use server";

import {
  onboardingSchema,
  settingsProfileSchema,
} from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "./decisions";

export async function completeOnboarding(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    displayName: formData.get("displayName"),
    focusAreas: String(formData.get("focusAreas") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  // Upsert: update() touches 0 rows if no profile row exists (trigger lag / manual user),
  // which used to return "ok" and trap users in an onboarding → dashboard redirect loop.
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: parsed.data.displayName,
      onboarding_complete: true,
    },
    { onConflict: "id" }
  );

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  redirect("/dashboard");
}

export async function updateSettings(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    displayName: formData.get("displayName"),
    reminderEmailEnabled: formData.get("reminderEmailEnabled") === "on",
    privacyAnalytics: formData.get("privacyAnalytics") === "on",
  };
  const parsed = settingsProfileSchema.safeParse({
    displayName: raw.displayName,
    reminderEmailEnabled: raw.reminderEmailEnabled,
    privacyAnalytics: raw.privacyAnalytics,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      reminder_email_enabled: parsed.data.reminderEmailEnabled,
      privacy_analytics: parsed.data.privacyAnalytics,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}
