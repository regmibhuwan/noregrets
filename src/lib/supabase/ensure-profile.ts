import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Guarantees a profiles row for the signed-in user so FKs to profiles (and RLS) stay consistent.
 */
export async function ensureProfileRow(
  supabase: SupabaseClient,
  user: User
): Promise<{ error: string | null }> {
  const { data: row } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (row) return { error: null };

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "You";

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    display_name: displayName,
  });

  if (error) return { error: error.message };
  return { error: null };
}
