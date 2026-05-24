import Link from "next/link";
import { BookOpen, Wrench, PenLine, Trophy, ArrowRight } from "lucide-react";

export default function DashOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-3xl border border-border bg-muted/20 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="label-mono mb-3">Welcome back</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Pick up where you left off.
          </h2>
          <p className="text-muted-foreground max-w-xl mb-6">
            Earn Bi Points for every lesson, tutorial, and article you
            complete. Climb the leaderboard. Keep your streak alive.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dash/courses"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Continue learning <ArrowRight size={14} strokeWidth={2} />
            </Link>
            <Link
              href="/dash/leaderboard"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              See leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Quick access grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <QuickCard
          href="/dash/courses"
          Icon={BookOpen}
          title="Courses"
          desc="Track your enrolled and completed courses."
        />
        <QuickCard
          href="/dash/tutorials"
          Icon={Wrench}
          title="Tutorials"
          desc="Tutorials you've started, favorited, and finished."
        />
        <QuickCard
          href="/dash/blog"
          Icon={PenLine}
          title="Articles"
          desc="Your reading history and saved articles."
        />
      </div>

      {/* Recent activity placeholder */}
      <div className="rounded-3xl border border-border bg-muted/20 p-6 md:p-8">
        <p className="label-mono mb-3">Recent activity</p>
        <h3 className="text-xl font-semibold mb-4 tracking-tight">
          Nothing yet — let&apos;s change that.
        </h3>
        <p className="text-muted-foreground text-sm mb-6">
          Start a lesson or open an article to begin tracking activity.
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          Browse all content <ArrowRight size={14} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

function QuickCard({
  href,
  Icon,
  title,
  desc,
}: {
  href: string;
  Icon: typeof BookOpen;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-muted/20 p-5 hover:bg-muted/40 hover:border-primary/40 transition-all flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
          <Icon size={18} strokeWidth={1.8} />
        </span>
        <ArrowRight
          size={14}
          strokeWidth={2}
          className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all"
        />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
