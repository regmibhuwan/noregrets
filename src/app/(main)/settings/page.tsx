import { updateSettings } from "@/app/actions/profile";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { SettingsForm } from "@/components/settings-form";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted mt-1">
          Profile, reminders, data, and privacy.
        </p>
      </div>

      <Card>
        <CardTitle className="mb-4">Profile</CardTitle>
        <SettingsForm
          action={updateSettings}
          defaultDisplayName={profile?.display_name ?? ""}
          reminderEmailEnabled={profile?.reminder_email_enabled ?? true}
          privacyAnalytics={profile?.privacy_analytics ?? true}
        />
      </Card>

      <Card>
        <CardTitle className="mb-2">Export data</CardTitle>
        <p className="text-sm text-muted mb-4">
          Download a JSON copy of your profile, decisions, reflections, and
          stored AI notes.
        </p>
        <a href="/api/export" download>
          <Button variant="secondary" type="button">
            Download export
          </Button>
        </a>
      </Card>

      <Card className="border-danger/25">
        <CardTitle className="mb-2 text-danger">Delete account</CardTitle>
        <p className="text-sm text-muted mb-4">
          Permanently removes your auth user and cascades your app data. Requires{" "}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{" "}
          on the server.
        </p>
        <DeleteAccountButton />
      </Card>

      <p className="text-xs text-muted">
        Signed in as {user.email} via Supabase Auth.
      </p>
    </div>
  );
}
