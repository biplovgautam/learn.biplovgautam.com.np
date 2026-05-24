"use client";

import Link from "next/link";
import {
  Play,
  BookOpen,
  CheckCircle2,
  Star,
  Bookmark,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

type SidebarType = "courses" | "tutorials" | "blog";

interface ContentSidebarProps {
  type: SidebarType;
}

interface Section {
  label: string;
  emptyHint: string;
  Icon: LucideIcon;
}

interface SidebarConfig {
  title: string;
  sections: Section[];
  browseCta: string;
  browseHref: string;
}

const config: Record<SidebarType, SidebarConfig> = {
  courses: {
    title: "Your courses",
    sections: [
      {
        label: "Continue learning",
        emptyHint: "Pick a course to start tracking progress.",
        Icon: Play,
      },
      {
        label: "Enrolled",
        emptyHint: "Courses you start show up here.",
        Icon: BookOpen,
      },
      {
        label: "Completed",
        emptyHint: "Finish a course to mark it done.",
        Icon: CheckCircle2,
      },
    ],
    browseCta: "Browse all courses",
    browseHref: "/courses",
  },
  tutorials: {
    title: "Your tutorials",
    sections: [
      {
        label: "Continue reading",
        emptyHint: "Pick up where you left off.",
        Icon: Play,
      },
      {
        label: "Favorites",
        emptyHint: "Star a tutorial to save it here.",
        Icon: Star,
      },
      {
        label: "Completed",
        emptyHint: "Done tutorials get logged here.",
        Icon: CheckCircle2,
      },
    ],
    browseCta: "Browse all tutorials",
    browseHref: "/tutorials",
  },
  blog: {
    title: "Your feed",
    sections: [
      {
        label: "Was reading",
        emptyHint: "Articles you started appear here.",
        Icon: Play,
      },
      {
        label: "Saved",
        emptyHint: "Bookmark an article to save it.",
        Icon: Bookmark,
      },
      {
        label: "Recommended",
        emptyHint: "Personalized picks once you read more.",
        Icon: Sparkles,
      },
    ],
    browseCta: "Browse all articles",
    browseHref: "/blog",
  },
};

export function ContentSidebar({ type }: ContentSidebarProps) {
  const { user, loading } = useAuth();
  const data = config[type];

  if (loading) {
    return (
      <aside className="w-full lg:w-64 shrink-0">
        <div className="rounded-3xl border border-border bg-muted/20 p-5 animate-pulse">
          <div className="h-5 w-24 bg-muted rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      </aside>
    );
  }

  if (!user) {
    return (
      <aside className="w-full lg:w-64 shrink-0">
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-5">
          <p className="label-mono mb-3">Track progress</p>
          <h3 className="font-semibold mb-2">Sign in to save your spot</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Bookmark content, pick up where you left off, and track what
            you&apos;ve completed.
          </p>
          <Link
            href={`/login?next=${data.browseHref}`}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign in
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </aside>
    );
  }

  const firstName = user.displayName?.split(" ")[0] || "you";

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-3">
      <div className="rounded-2xl border border-border bg-muted/20 p-5">
        <p className="label-mono mb-1">Hey, {firstName}</p>
        <h3 className="font-semibold">{data.title}</h3>
      </div>

      {data.sections.map(({ label, emptyHint, Icon }) => (
        <div
          key={label}
          className="rounded-2xl border border-border bg-muted/20 p-5"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Icon size={14} strokeWidth={1.8} />
            </span>
            <h4 className="text-sm font-semibold">{label}</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {emptyHint}
          </p>
        </div>
      ))}

      <Link
        href={data.browseHref}
        className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors pt-2"
      >
        {data.browseCta}
        <ArrowRight size={12} strokeWidth={2} />
      </Link>
    </aside>
  );
}
