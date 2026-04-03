import { createAdminClient } from "@/lib/supabase/admin";
import { getResend, reminderEmailHtml } from "@/lib/resend";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Service role not configured" },
      { status: 503 }
    );
  }

  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!resend || !from) {
    return NextResponse.json(
      { error: "Resend not configured", sent: 0 },
      { status: 503 }
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: due, error } = await admin
    .from("decisions")
    .select("id, user_id, title, follow_up_date")
    .lte("follow_up_date", today)
    .is("reminder_sent_at", null)
    .in("status", ["pending", "decided"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const row of due ?? []) {
    const { data: profile } = await admin
      .from("profiles")
      .select("reminder_email_enabled, display_name")
      .eq("id", row.user_id)
      .single();

    if (!profile?.reminder_email_enabled) {
      continue;
    }

    const { data: userData, error: userErr } =
      await admin.auth.admin.getUserById(row.user_id);

    if (userErr || !userData.user?.email) {
      errors.push(`No email for user ${row.user_id}`);
      continue;
    }

    const html = reminderEmailHtml({
      displayName: profile.display_name,
      decisionTitle: row.title,
      appUrl,
      decisionId: row.id,
    });

    const { error: sendErr } = await resend.emails.send({
      from,
      to: userData.user.email,
      subject: `Time to revisit: ${row.title.slice(0, 60)}${row.title.length > 60 ? "…" : ""}`,
      html,
    });

    if (sendErr) {
      errors.push(String(sendErr.message));
      continue;
    }

    await admin
      .from("decisions")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", row.id);

    sent += 1;
  }

  return NextResponse.json({ sent, errors });
}
