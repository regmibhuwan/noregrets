export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-14 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.14] pointer-events-none auth-gradient-panel"
        aria-hidden
      />
      <div
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[min(90vw,520px)] h-48 rounded-full bg-teal-500/20 blur-3xl pointer-events-none"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
