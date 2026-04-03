import { ReflectionForm } from "@/components/reflection-form";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = { title: "Reflect" };

export default async function ReflectPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: d, error } = await supabase
    .from("decisions")
    .select("id, title")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !d) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href={`/decisions/${d.id}`}
          className="text-sm text-muted hover:text-foreground"
        >
          ← Back to decision
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Reflect</h1>
        <p className="text-muted text-sm mt-1">{d.title}</p>
        <p className="text-sm text-muted mt-3">
          Reflections are for future-you. Short answers are enough to spot
          patterns over time.
        </p>
      </div>
      <ReflectionForm decisionId={d.id} />
    </div>
  );
}
