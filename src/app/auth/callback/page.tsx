"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function safeNext(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/onboarding";
}

function loginWithAuthError(
  router: ReturnType<typeof useRouter>,
  kind: "session" | "missing_code",
  message?: string
) {
  const q = new URLSearchParams();
  q.set("error", kind);
  if (message) q.set("message", message);
  router.replace(`/login?${q.toString()}`);
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [note, setNote] = useState("Finishing sign-in…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const url = new URL(window.location.href);
      const nextPath = safeNext(
        searchParams.get("next") ?? url.searchParams.get("next")
      );

      const err =
        searchParams.get("error") ?? url.searchParams.get("error");
      const errDesc =
        searchParams.get("error_description") ??
        url.searchParams.get("error_description");
      if (err) {
        const human = errDesc
          ? decodeURIComponent(errDesc.replace(/\+/g, " "))
          : err;
        if (!cancelled) {
          loginWithAuthError(router, "session", human);
        }
        return;
      }

      const hashRaw = url.hash.replace(/^#/, "");
      if (hashRaw) {
        const hp = new URLSearchParams(hashRaw);
        const hErr = hp.get("error");
        const hErrDesc = hp.get("error_description");
        if (hErr) {
          const human = hErrDesc
            ? decodeURIComponent(hErrDesc.replace(/\+/g, " "))
            : hErr;
          if (!cancelled) {
            loginWithAuthError(router, "session", human);
          }
          return;
        }
        const access_token = hp.get("access_token");
        const refresh_token = hp.get("refresh_token");
        if (access_token && refresh_token) {
          window.history.replaceState(
            null,
            "",
            `${url.pathname}${url.search}`
          );
          setNote("Securing your session…");
          const supabasePkce = createClient();
          const { error } = await supabasePkce.auth.setSession({
            access_token,
            refresh_token,
          });
          if (cancelled) return;
          if (error) {
            loginWithAuthError(router, "session", error.message);
            return;
          }
          router.replace(nextPath);
          router.refresh();
          return;
        }
      }

      const code =
        searchParams.get("code") ?? url.searchParams.get("code");
      if (code) {
        const pkceLock = `nr_pkce_${code}`;
        if (sessionStorage.getItem(pkceLock) === "1") {
          const supabasePkce = createClient();
          const {
            data: { session },
          } = await supabasePkce.auth.getSession();
          if (cancelled) return;
          if (session) {
            router.replace(nextPath);
            router.refresh();
            return;
          }
        }
        sessionStorage.setItem(pkceLock, "1");
        setNote("Securing your session…");
        const supabasePkce = createClient();
        const {
          data: { session: afterInit },
        } = await supabasePkce.auth.getSession();
        if (afterInit) {
          if (!cancelled) {
            router.replace(nextPath);
            router.refresh();
          }
          return;
        }
        const { error } = await supabasePkce.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          sessionStorage.removeItem(pkceLock);
          loginWithAuthError(router, "session", error.message);
          return;
        }
        router.replace(nextPath);
        router.refresh();
        return;
      }

      if (!cancelled) {
        loginWithAuthError(
          router,
          "missing_code",
          "Open the link in Safari or Chrome, or request a new reset email."
        );
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center px-4 py-16">
      <p className="text-sm text-muted text-center max-w-sm">{note}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center px-4">
          <p className="text-sm text-muted">Loading…</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
