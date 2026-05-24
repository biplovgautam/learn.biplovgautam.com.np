import { ProfileShell } from "@/components/profile/profile-shell";

export default function OverviewPage() {
  return (
    <ProfileShell>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Courses started" value="0" />
        <StatCard label="Lessons completed" value="0" />
        <StatCard label="Articles saved" value="0" />
      </div>

      <div className="rounded-3xl border border-border bg-muted/20 p-8 mt-6">
        <p className="label-mono mb-3">Welcome</p>
        <h2 className="text-2xl font-bold mb-3 tracking-tight">
          Your learning starts here.
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          Track your progress across courses, save articles for later, and
          pick up exactly where you left off. We&apos;ll log activity as you
          go — no setup needed.
        </p>
      </div>
    </ProfileShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-6">
      <p className="label-mono mb-2">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
