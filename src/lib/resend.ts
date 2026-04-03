import { Resend } from "resend";

export function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export function reminderEmailHtml(params: {
  displayName: string | null;
  decisionTitle: string;
  appUrl: string;
  decisionId: string;
}) {
  const name = params.displayName?.trim() || "there";
  const link = `${params.appUrl}/decisions/${params.decisionId}/reflect`;
  return `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1e293b;">
  <p>Hi ${name},</p>
  <p>You planned to revisit a decision: <strong>${escapeHtml(
    params.decisionTitle
  )}</strong>.</p>
  <p>When you have a quiet moment, a short reflection helps you notice patterns — without judgment, just clarity.</p>
  <p><a href="${link}" style="color: #0d9488;">Open your reflection</a></p>
  <p style="color: #64748b; font-size: 14px;">— NoRegrets</p>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
