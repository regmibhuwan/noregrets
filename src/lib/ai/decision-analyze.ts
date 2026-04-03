import { getOpenAI, AI_MODEL } from "@/lib/openai";

const SYSTEM = `You are a calm, practical decision coach for a product called NoRegrets.
You never shame the user. You highlight tradeoffs, blind spots, and reversible vs irreversible choices.
Respond ONLY with valid JSON matching this shape:
{
  "risk_score": number from 0-100 (likelihood of future regret if they proceed without more reflection),
  "summary": string (2-3 sentences),
  "risk_factors": string[] (2-5 short bullets),
  "practical_next_steps": string[] (2-4 actionable bullets),
  "why_this_matters": string (1-2 sentences explaining why noticing this helps learning)
}`;

export type DecisionAnalyzeResult = {
  risk_score: number;
  summary: string;
  risk_factors: string[];
  practical_next_steps: string[];
  why_this_matters: string;
};

export async function analyzeDecisionPayload(input: {
  title: string;
  category: string;
  description?: string | null;
  expectedOutcome?: string | null;
  confidenceLevel: number;
  urgency: string;
  peopleInvolved?: string | null;
  feelingAtTime?: string | null;
}): Promise<DecisionAnalyzeResult | { error: string }> {
  const openai = getOpenAI();
  if (!openai) {
    return { error: "OpenAI is not configured. Add OPENAI_API_KEY." };
  }

  const user = `Decision draft:
Title: ${input.title}
Category: ${input.category}
Urgency: ${input.urgency}
Confidence (1-5): ${input.confidenceLevel}
Description: ${input.description ?? ""}
Expected outcome: ${input.expectedOutcome ?? ""}
People involved: ${input.peopleInvolved ?? ""}
How they felt when deciding: ${input.feelingAtTime ?? ""}

Assess regret risk before they commit. Be specific to this decision, not generic.`;

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: user },
    ],
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return { error: "No response from model" };

  try {
    const parsed = JSON.parse(raw) as DecisionAnalyzeResult;
    if (
      typeof parsed.risk_score !== "number" ||
      typeof parsed.summary !== "string"
    ) {
      return { error: "Invalid model output" };
    }
    parsed.risk_score = Math.max(0, Math.min(100, Math.round(parsed.risk_score)));
    return parsed;
  } catch {
    return { error: "Could not parse AI response" };
  }
}
