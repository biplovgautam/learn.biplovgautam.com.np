import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Wrench, PenLine, ArrowUpRight, ArrowRight } from "lucide-react";
import { generateWebsiteJsonLd } from "@/lib/structured-data";
import { getBlogPosts } from "@/lib/data/blog";
import { getTutorials } from "@/lib/data/tutorials";
import { getCourses } from "@/lib/data/courses";
import { formatDate } from "@/lib/utils";

function tsToMillis(ts: string | null | undefined): number {
  if (!ts) return 0;
  const ms = Date.parse(ts);
  return isNaN(ms) ? 0 : ms;
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebsiteJsonLd()) }}
      />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] items-center">
            {/* Left: copy */}
            <div>
              {/* Status pill */}
              <div className="mb-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3.5 py-1.5 text-xs">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <span className="text-muted-foreground">
                    Robotics &middot; ROS 2 &middot; intelligent systems
                  </span>
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight">
                Build robots that{" "}
                <span className="text-primary">think and move.</span>
              </h1>

              <p className="text-lg text-muted-foreground mt-8 max-w-xl leading-relaxed">
                Courses, tutorials, and articles on ROS 2, robotics, and
                intelligent systems—from your first node to autonomous
                navigation, explained step by step with hands-on code.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 mt-10">
                <Link
                  href="/courses"
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Explore courses
                  <span className="transition-transform group-hover:translate-x-0.5">
                    &#8594;
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Track progress
                </Link>
              </div>
            </div>

            {/* Right: robot */}
            <div className="relative flex items-center justify-center">
              {/* Glow */}
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="h-72 w-72 md:h-96 md:w-96 rounded-full bg-primary/20 blur-3xl" />
              </div>
              {/* Subtle rotating ring */}
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="h-64 w-64 md:h-80 md:w-80 rounded-full border border-primary/20" />
              </div>
              <Image
                src="/jazzy_robot.png"
                alt="Jazzy the robot mascot"
                width={400}
                height={550}
                priority
                className="relative z-10 w-56 md:w-72 lg:w-80 h-auto drop-shadow-[0_0_30px_rgba(74,222,128,0.25)] animate-float"
              />
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 md:mt-20 max-w-3xl pt-8 border-t border-border">
            <div>
              <p className="label-mono mb-2">ROS 2</p>
              <p className="text-sm">Nodes &middot; Topics &middot; Services</p>
            </div>
            <div>
              <p className="label-mono mb-2">Robotics</p>
              <p className="text-sm">SLAM &middot; Nav2 &middot; MoveIt</p>
            </div>
            <div>
              <p className="label-mono mb-2">Intelligent systems</p>
              <p className="text-sm">Perception &middot; Planning &middot; Control</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT YOU'LL FIND — BENTO/COLLAGE ────────────────── */}
      <section className="border-t border-border relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="label-mono mb-3">What you&apos;ll find</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Three ways to learn.
              </h2>
            </div>
          </div>

          {/* Asymmetric bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4 md:gap-6 md:min-h-[520px]">
            {/* Courses — big card, tilted slightly left */}
            <Link
              href="/courses"
              className="group relative md:col-span-4 md:row-span-2 rounded-3xl border border-border bg-muted/20 p-8 md:p-10 hover:bg-muted/40 transition-all overflow-hidden hover:-translate-y-1 hover:rotate-[-0.5deg]"
            >
              <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-colors" />

              <div className="relative flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="label-mono mb-4">Featured</p>
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                      <BookOpen size={28} strokeWidth={1.8} />
                    </span>
                  </div>
                  <span className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-border text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                    <ArrowUpRight size={16} strokeWidth={2} />
                  </span>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                  Courses
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                  Structured, multi-module deep dives. Build serious skills
                  from fundamentals to production—with hands-on code, real
                  projects, and zero filler.
                </p>

                <div className="mt-auto pt-8 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border bg-background/50 px-3 py-1 text-xs">
                    ROS 2
                  </span>
                  <span className="rounded-full border border-border bg-background/50 px-3 py-1 text-xs">
                    Navigation
                  </span>
                  <span className="rounded-full border border-border bg-background/50 px-3 py-1 text-xs">
                    Perception
                  </span>
                </div>
              </div>
            </Link>

            {/* Tutorials — small top-right, slight right tilt */}
            <Link
              href="/tutorials"
              className="group relative md:col-span-2 md:row-span-1 rounded-3xl border border-border bg-muted/20 p-6 md:p-7 hover:bg-muted/40 transition-all hover:-translate-y-1 hover:rotate-[0.5deg] flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-foreground/5 text-foreground border border-border">
                  <Wrench size={20} strokeWidth={1.8} />
                </span>
                <ArrowRight
                  size={16}
                  strokeWidth={2}
                  className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tutorials</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-auto">
                Focused walkthroughs. One problem, one working solution.
              </p>
            </Link>

            {/* Blog — bottom-right with primary accent */}
            <Link
              href="/blog"
              className="group relative md:col-span-2 md:row-span-1 rounded-3xl border border-primary/30 bg-primary/5 p-6 md:p-7 hover:bg-primary/10 transition-all hover:-translate-y-1 hover:rotate-[-0.4deg] flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
                  <PenLine size={20} strokeWidth={1.8} />
                </span>
                <ArrowRight
                  size={16}
                  strokeWidth={2}
                  className="text-primary group-hover:translate-x-0.5 transition-transform"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Blog</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-auto">
                Concepts, opinions, lessons from shipping real projects.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── LATEST CONTENT ───────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="label-mono mb-3">Latest</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Fresh from the lab.
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View all &#8594;
            </Link>
          </div>

          <Suspense fallback={<LatestSkeleton />}>
            <LatestContent />
          </Suspense>
        </div>
      </section>

      {/* ─── CTA FOOTER ───────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
            Ready to build something{" "}
            <span className="text-primary">real?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Browse content freely. Sign in to track your progress across
            courses and save what matters.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse courses &#8594;
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Track progress
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Latest Content (server component) ────────────────────── */
async function LatestContent() {
  const [posts, tutorials, courses] = await Promise.all([
    getBlogPosts(),
    getTutorials(),
    getCourses(),
  ]);

  type Item = {
    title: string;
    href: string;
    excerpt: string;
    kind: string;
    dateMs: number;
    dateLabel: string;
  };

  const items: Item[] = [
    ...courses.slice(0, 2).map((c) => ({
      title: c.title,
      href: `/courses/${c.slug}`,
      excerpt: c.description,
      kind: "Course",
      dateMs: tsToMillis(c.publishedAt),
      dateLabel: c.publishedAt ? formatDate(c.publishedAt) : "",
    })),
    ...tutorials.slice(0, 2).map((t) => ({
      title: t.title,
      href: `/tutorials/${t.slug}`,
      excerpt: t.excerpt,
      kind: "Tutorial",
      dateMs: tsToMillis(t.publishedAt),
      dateLabel: t.publishedAt ? formatDate(t.publishedAt) : "",
    })),
    ...posts.slice(0, 2).map((p) => ({
      title: p.title,
      href: `/blog/${p.slug}`,
      excerpt: p.excerpt,
      kind: "Article",
      dateMs: tsToMillis(p.publishedAt),
      dateLabel: p.publishedAt ? formatDate(p.publishedAt) : "",
    })),
  ]
    .sort((a, b) => b.dateMs - a.dateMs)
    .slice(0, 4);

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-muted/20 p-12 text-center">
        <p className="text-muted-foreground">
          No content published yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group rounded-2xl border border-border bg-muted/20 p-6 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {item.kind}
            </span>
            {item.dateLabel && (
              <span className="text-xs text-muted-foreground">
                {item.dateLabel}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          {item.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {item.excerpt}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}

function LatestSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-muted/20 p-6 animate-pulse"
        >
          <div className="h-5 w-20 bg-muted rounded-full mb-3" />
          <div className="h-6 bg-muted rounded w-3/4 mb-3" />
          <div className="h-4 bg-muted rounded w-full" />
        </div>
      ))}
    </div>
  );
}
