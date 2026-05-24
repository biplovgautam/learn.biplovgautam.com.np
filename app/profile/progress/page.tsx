import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ProfileShell } from "@/components/profile/profile-shell";

export default function ProgressPage() {
  return (
    <ProfileShell>
      <div className="rounded-3xl border border-border bg-muted/20 p-12 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-4">
          <BookOpen size={24} strokeWidth={1.8} />
        </span>
        <h2 className="text-xl font-semibold mb-2">No progress yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start a course and your progress will show up here. Pick up exactly
          where you left off, any device.
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Browse courses &#8594;
        </Link>
      </div>
    </ProfileShell>
  );
}
