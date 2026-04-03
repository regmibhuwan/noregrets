export const CATEGORIES = [
  { value: "work", label: "Work" },
  { value: "relationships", label: "Relationships" },
  { value: "learning", label: "Learning" },
  { value: "money", label: "Money" },
  { value: "habits", label: "Habits" },
  { value: "daily", label: "Daily life" },
  { value: "other", label: "Other" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export const URGENCY = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

export const DECISION_STATUS = [
  { value: "pending", label: "Pending" },
  { value: "decided", label: "Decided" },
  { value: "revisited", label: "Revisited" },
  { value: "regretted", label: "Regretted" },
  { value: "satisfied", label: "Satisfied" },
] as const;

export type DecisionStatus = (typeof DECISION_STATUS)[number]["value"];

export const APP_NAME = "NoRegrets";
export const TAGLINE = "Know before you regret.";
