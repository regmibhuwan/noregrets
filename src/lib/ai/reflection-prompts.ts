import { getOpenAI, AI_MODEL } from "@/lib/openai";

export async function generateReflectionPrompts(input: {
  title: string;
  category: string;
  expectedOutcome?: string | null;
}): Promise<string[] | { error: string }> {
  const openai = getOpenAI();
  if (!openai) {
    return { error: "OpenAI is not configured." };
  }

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You help people reflect on past decisions. Return JSON: { "prompts": string[] } with exactly 4 short, kind questions tailored to the decision. No therapy jargon.`,
      },
      {
        role: "user",
        content: `Decision: ${input.title}\nCategory: ${input.category}\nExpected: ${input.expectedOutcome ?? "n/a"}`,
      },
    ],
    temperature: 0.5,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return { error: "No response" };
  try {
    const p = JSON.parse(raw) as { prompts?: string[] };
    if (!Array.isArray(p.prompts)) return { error: "Bad format" };
    return p.prompts.slice(0, 6);
  } catch {
    return { error: "Parse error" };
  }
}
