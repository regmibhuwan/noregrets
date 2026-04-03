import { OnboardingForm } from "@/components/onboarding-form";
import { APP_NAME, TAGLINE } from "@/lib/constants";

export const metadata = {
  title: "Onboarding",
};

export default function OnboardingPage() {
  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white items-center justify-center font-bold text-sm mb-4 shadow-soft">
          NR
        </div>
        <p className="text-teal-700 dark:text-teal-400 text-xs font-semibold uppercase tracking-[0.2em]">
          {TAGLINE}
        </p>
        <h1 className="font-display text-3xl font-bold mt-3 tracking-tight">
          Tune {APP_NAME} to you
        </h1>
        <p className="text-sm text-muted mt-3 leading-relaxed">
          You can change this anytime. We use it to keep things personal, not
          to judge.
        </p>
      </div>
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-glow border border-white/25 dark:border-white/10">
        <OnboardingForm />
      </div>
    </>
  );
}
