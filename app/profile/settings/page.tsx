"use client";

import { ProfileShell } from "@/components/profile/profile-shell";
import { useAuth } from "@/components/providers/auth-provider";

export default function SettingsPage() {
  return (
    <ProfileShell>
      <SettingsContent />
    </ProfileShell>
  );
}

function SettingsContent() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-muted/20 p-6 md:p-8">
        <p className="label-mono mb-4">Account</p>
        <dl className="space-y-4">
          <Row label="Name" value={user?.displayName || "—"} />
          <Row label="Email" value={user?.email || "—"} />
          <Row label="Sign-in method" value="Google" />
        </dl>
      </div>

      <div className="rounded-3xl border border-border bg-muted/20 p-6 md:p-8">
        <p className="label-mono mb-2">Notifications</p>
        <p className="text-sm text-muted-foreground">
          Email preferences will be available soon.
        </p>
      </div>

      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 md:p-8">
        <p className="label-mono mb-2 text-destructive">Danger zone</p>
        <p className="text-sm text-muted-foreground mb-4">
          Delete your account and all associated progress data. This cannot be
          undone.
        </p>
        <button
          disabled
          className="rounded-full border border-destructive/40 px-4 py-2 text-sm text-destructive opacity-50 cursor-not-allowed"
        >
          Delete account (coming soon)
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium truncate">{value}</dd>
    </div>
  );
}
