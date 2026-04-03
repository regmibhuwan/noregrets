import { LandingFeatures } from "@/components/landing-features";
import { Button } from "@/components/ui/button";
import { APP_NAME, TAGLINE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.onboarding_complete) {
      redirect("/dashboard");
    }
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-teal-400/25 to-cyan-400/20 blur-3xl animate-float"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/2 left-[-15%] h-[320px] w-[320px] rounded-full bg-teal-600/10 blur-3xl"
        aria-hidden
      />

      <header className="relative max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="h-11 w-11 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-soft-lg">
            NR
          </span>
          <span className="font-display font-semibold text-lg tracking-tight">
            {APP_NAME}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="relative flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-24">
        <section className="pt-6 md:pt-14 text-center md:text-left max-w-3xl">
          <p className="text-teal-700 dark:text-teal-400 font-semibold text-xs mb-4 tracking-[0.2em] uppercase">
            {TAGLINE}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-[3.25rem] font-bold tracking-tight text-balance leading-[1.08]">
            Decide with clarity.
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 dark:from-teal-400 dark:via-teal-300 dark:to-cyan-400">
              Learn without the guilt.
            </span>
          </h1>
          <p className="mt-6 text-muted text-lg max-w-xl leading-relaxed">
            Log what mattered, revisit when you&apos;re ready, and spot the
            patterns behind what satisfies you — and what you&apos;d do
            differently.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center md:justify-start">
            <Link href="/signup">
              <Button size="lg">Start free</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                I have an account
              </Button>
            </Link>
          </div>
        </section>

        <LandingFeatures
          items={[
            {
              icon: "brain",
              title: "Structured logging",
              body: "Title, category, confidence, follow-up dates — enough structure to learn, not so much that journaling feels like work.",
            },
            {
              icon: "sparkles",
              title: "Thoughtful AI",
              body: "Risk checks, summaries, and pattern reads grounded in your own history — practical, concise, never preachy.",
            },
            {
              icon: "bell",
              title: "Gentle reminders",
              body: "Email nudges when it is time to reflect, so follow-ups do not slip through the cracks.",
            },
            {
              icon: "chart",
              title: "Dashboard clarity",
              body: "Regret and satisfaction rates, upcoming follow-ups, and high-risk open decisions at a glance.",
            },
            {
              icon: "shield",
              title: "Your data, yours",
              body: "Row-level security in Postgres, export anytime, and optional reminders you can switch off.",
            },
            {
              icon: "brain",
              title: "Decision profile",
              body: "A living view of strengths, watchouts, and habits inferred from reflections you already wrote.",
            },
          ]}
        />
      </main>

      <footer className="relative border-t border-slate-200/60 dark:border-slate-800/80 py-10 text-center text-sm text-muted">
        <p>
          {APP_NAME} — for people who want fewer surprises and more self-trust.
        </p>
      </footer>
    </div>
  );
}
