import type { Metadata } from "next";
import Link from "next/link";
import { getTutorials } from "@/lib/data/tutorials";
import { ContentSidebar } from "@/components/layout/content-sidebar";

export const metadata: Metadata = {
  title: "Tutorials",
  description:
    "Step-by-step ROS 2 and robotics tutorials for every skill level.",
};

const difficultyColor: Record<string, string> = {
  beginner: "bg-primary/15 text-primary",
  intermediate: "bg-yellow-500/15 text-yellow-400",
  advanced: "bg-red-500/15 text-red-400",
};

export default async function TutorialsPage() {
  const tutorials = await getTutorials();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="label-mono mb-3">Walkthroughs</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          Tutorials
        </h1>
        <p className="text-muted-foreground text-lg">
          Hands-on tutorials to learn ROS 2 and robotics, beginner to advanced.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <ContentSidebar type="tutorials" />

        <div className="flex-1 min-w-0">
          {tutorials.length === 0 ? (
            <div className="rounded-3xl border border-border bg-muted/20 p-12 text-center">
              <p className="text-muted-foreground">
                No tutorials published yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {tutorials.map((tutorial) => (
                <Link
                  key={tutorial.id}
                  href={`/tutorials/${tutorial.slug}`}
                  className="group rounded-2xl border border-border bg-muted/20 p-5 transition-colors hover:bg-muted/40 hover:border-primary/40 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${difficultyColor[tutorial.difficulty] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {tutorial.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {tutorial.estimatedMinutes} min
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold group-hover:text-primary transition-colors mb-2">
                    {tutorial.title}
                  </h2>
                  {tutorial.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {tutorial.excerpt}
                    </p>
                  )}
                  {tutorial.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {tutorial.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
