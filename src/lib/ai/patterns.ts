import { getOpenAI, AI_MODEL } from "@/lib/openai";

const SYSTEM = `You are an insightful, non-judgmental analyst for NoRegrets, a decision journal app.
You detect patterns in how someone decides, what they regret, and what satisfies them.
Tone: warm, precise, never preachy. Speak to one person.

Return ONLY valid JSON:
{
  "decision_profile": {
    "title": string (short label, e.g. "Thoughtful under pressure"),
    "summary": string (3-5 sentences),
    "strengths": string[] (2-4),
    "watchouts": string[] (2-4)
  },
  "patterns": [
    {
      "title": string,
      "content": string (2-4 sentences, concrete),
      "why_matters": string (1-2 sentences),
      "insight_type": "pattern"
    }
  ],
  "warnings": [
    {
      "title": string,
      "content": string,
      "why_matters": string,
      "insight_type": "warning"
    }
  ],
  "advice": [
    {
      "title": string,
      "content": string,
      "why_matters": string,
      "insight_type": "advice"
    }
  ]
}

Rules:
- If history is sparse, say so honestly and give gentle guidance for collecting better data.
- Ground claims in the provided data; do not invent events.
- Max 4 patterns, 3 warnings, 3 advice items.`;

export type PatternBundle = {
  decision_profile: {
    title: string;
    summary: string;
    strengths: string[];
    watchouts: string[];
  };
  patterns: {
    title: string;
    content: string;
    why_matters: string;
    insight_type: string;
  }[];
  warnings: {
    title: string;
    content: string;
    why_matters: string;
    insight_type: string;
  }[];
  advice: {
    title: string;
    content: string;
    why_matters: string;
    insight_type: string;
  }[];
};

export async function generatePatternBundle(historyJson: string): Promise<
  PatternBundle | { error: string }
> {
  const openai = getOpenAI();
  if (!openai) {
    return { error: "OpenAI is not configured. Add OPENAI_API_KEY." };
  }

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Here is the user's structured decision history (JSON). Analyze it.\n${historyJson}`,
      },
    ],
    temperature: 0.35,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return { error: "No response from model" };

  try {
    return JSON.parse(raw) as PatternBundle;
  } catch {
    return { error: "Could not parse AI response" };
  }
}
