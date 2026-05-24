"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Wrench,
  PenLine,
  Trophy,
  Flame,
  Zap,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Overview", href: "/dash", Icon: LayoutDashboard },
  { label: "Courses", href: "/dash/courses", Icon: BookOpen },
  { label: "Tutorials", href: "/dash/tutorials", Icon: Wrench },
  { label: "Blog", href: "/dash/blog", Icon: PenLine },
  { label: "Leaderboard", href: "/dash/leaderboard", Icon: Trophy },
];

interface DashShellProps {
  biPoints?: number;
  streak?: number;
  level?: number;
  children: React.ReactNode;
}

export function DashShell({
  biPoints = 0,
  streak = 0,
  level = 1,
  children,
}: DashShellProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const firstName = user?.displayName?.split(" ")[0] || "you";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Top bar — greeting + stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="label-mono mb-1">Dashboard</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Hey, {firstName} <span className="inline-block">👋</span>
          </h1>
        </div>

        {/* Stats only */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatChip
            icon={<Zap size={14} strokeWidth={2} />}
            label="Bi Points"
            value={biPoints.toLocaleString()}
            tone="primary"
          />
          <StatChip
            icon={<Flame size={14} strokeWidth={2} />}
            label="Streak"
            value={`${streak} ${streak === 1 ? "day" : "days"}`}
            tone="amber"
          />
          <StatChip
            icon={<Trophy size={14} strokeWidth={2} />}
            label="Level"
            value={`${level}`}
            tone="muted"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-8 overflow-x-auto">
        <nav className="flex items-center gap-1 min-w-max">
          {tabs.map(({ label, href, Icon }) => {
            const active =
              href === "/dash"
                ? pathname === "/dash"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-3 text-sm border-b-2 -mb-px transition-colors",
                  active
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={14} strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div>{children}</div>
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "amber" | "muted";
}) {
  const tones = {
    primary: "border-primary/30 bg-primary/10 text-primary",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    muted: "border-border bg-muted/30 text-foreground",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
        tones[tone]
      )}
    >
      {icon}
      <span className="text-xs">
        <span className="text-muted-foreground">{label}:</span>{" "}
        <span className="font-semibold text-foreground">{value}</span>
      </span>
    </div>
  );
}
