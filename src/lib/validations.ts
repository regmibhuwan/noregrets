import { z } from "zod";

export const emailOnlySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email")
    .transform((e) => e.toLowerCase()),
});

export const loginSchema = emailOnlySchema.extend({
  password: z.string().min(6, "At least 6 characters"),
});

export const signupSchema = loginSchema.extend({
  displayName: z.string().min(1, "Name is required").max(80),
});

export const onboardingSchema = z.object({
  displayName: z.string().min(1, "Name is required").max(80),
  focusAreas: z.array(z.string()).max(8).optional(),
});

export const decisionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  category: z.preprocess(
    (v) => {
      const s = String(v ?? "").trim();
      return s === "" ? "other" : s;
    },
    z.string().min(1)
  ),
  description: z.string().max(5000).optional().nullable(),
  expectedOutcome: z.string().max(2000).optional().nullable(),
  confidenceLevel: z.coerce.number().int().min(1).max(5),
  urgency: z.enum(["low", "medium", "high"]),
  peopleInvolved: z.string().max(1000).optional().nullable(),
  decisionDate: z.string().min(1),
  followUpDate: z.string().optional().nullable(),
  tags: z.array(z.string()).max(20).default([]),
  status: z.enum([
    "pending",
    "decided",
    "revisited",
    "regretted",
    "satisfied",
  ]),
  feelingAtTime: z.string().max(2000).optional().nullable(),
});

export const reflectionSchema = z.object({
  workedOut: z.enum(["yes", "no", "partially"]),
  howFeelNow: z.string().min(1, "Share how you feel").max(2000),
  whatChanged: z.string().max(2000).optional().nullable(),
  wouldRepeat: z.enum(["yes", "no", "unsure"]),
  freeNotes: z.string().max(5000).optional().nullable(),
});

export const settingsProfileSchema = z.object({
  displayName: z.string().min(1).max(80),
  reminderEmailEnabled: z.boolean(),
  privacyAnalytics: z.boolean(),
});
