import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { getTutorials } from "@/lib/data/tutorials";

export default async function DashTutorialsPage() {
  const tutorials = await getTutorials();

  return (
    <div className="space-y-6">
      <div>
        <p className="label-mono mb-2">Your tutorials</p>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Continue your tutorials
        </h2>
        <p className="text-muted-foreground text-sm">
          Quick wins. Each tutorial earns you Bi Points on completion.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center">
        <p className="text-muted-foreground text-sm mb-1">
          No tutorial progress yet.
        </p>
        <p className="text-xs text-muted-foreground">
          Start one below to begin tracking.
        </p>
      </div>

      <div>
        <p className="label-mono mb-3">All tutorials</p>
        {tutorials.length === 0 ? (
          <div className="rounded-3xl border border-border bg-muted/20 p-12 text-center">
            <p className="text-muted-foreground">
              No tutorials yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tutorials.map((t) => (
              <Link
                key={t.id}
                href={`/tutorials/${t.slug}`}
                className="group rounded-2xl border border-border bg-muted/20 p-5 hover:bg-muted/40 hover:border-primary/40 transition-colors flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                    {t.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t.estimatedMinutes} min
                  </span>
                  {t.biPoints > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-primary">
                      <Zap size={12} strokeWidth={2} />
                      {t.biPoints}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {t.title}
                </h3>
                {t.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {t.excerpt}
                  </p>
                )}
                <span className="mt-auto inline-flex items-center gap-1 text-xs text-primary">
                  Read <ArrowRight size={12} strokeWidth={2} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
