import { createClient } from "@supabase/supabase-js";

/**
 * Password recovery must use implicit flow so the email link carries tokens in the
 * URL fragment (no PKCE verifier). The default @supabase/ssr browser client forces PKCE.
 */
export function createRecoveryClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "implicit",
        detectSessionInUrl: false,
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
