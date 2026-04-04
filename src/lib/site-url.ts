/**
 * Public app URL for auth email links (must match Supabase → Auth → URL configuration).
 *
 * In the browser on a real host (e.g. *.vercel.app), we prefer the current origin so a
 * mistaken NEXT_PUBLIC_APP_URL=localhost in Vercel env cannot break password reset links.
 */

function isLocalhostOrigin(url: string): boolean {
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    return h === "localhost" || h === "127.0.0.1" || h === "::1";
  } catch {
    return /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(url);
  }
}

/** Server-only: sign-up email redirects, etc. */
export function getServerAppOrigin(): string {
  const envRaw = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (envRaw && !isLocalhostOrigin(envRaw)) {
    return envRaw;
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "");
    return `https://${host}`;
  }
  if (envRaw) return envRaw;
  return "http://localhost:3000";
}

/** Client (and SSR fallbacks): password reset redirectTo, resend, etc. */
export function getPublicSiteOrigin(): string {
  if (typeof window !== "undefined") {
    const on = window.location.origin;
    const envRaw = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
    if (!isLocalhostOrigin(on)) {
      if (!envRaw || isLocalhostOrigin(envRaw)) {
        return on;
      }
      return envRaw;
    }
    if (envRaw) return envRaw;
    return on;
  }
  return getServerAppOrigin();
}
