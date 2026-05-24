import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTutorialBySlug } from "@/lib/data/tutorials";
import { RichTextRenderer } from "@/components/content/rich-text-renderer";
import { formatDate } from "@/lib/utils";
import { generateTutorialJsonLd } from "@/lib/structured-data";

const difficultyColor: Record<string, string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = await getTutorialBySlug(slug);

  if (!tutorial) return { title: "Tutorial Not Found" };

  return {
    title: tutorial.title,
    description: tutorial.excerpt,
    openGraph: {
      title: tutorial.title,
      description: tutorial.excerpt,
      type: "article",
      ...(tutorial.coverImage && { images: [tutorial.coverImage] }),
    },
  };
}

async function TutorialContent({ slug }: { slug: string }) {
  const tutorial = await getTutorialBySlug(slug);

  if (!tutorial) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateTutorialJsonLd(tutorial)) }}
      />
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${difficultyColor[tutorial.difficulty] ?? "bg-muted text-muted-foreground"}`}
          >
            {tutorial.difficulty}
          </span>
          <span>{tutorial.estimatedMinutes} min</span>
          {tutorial.publishedAt && (
            <time>{formatDate(tutorial.publishedAt)}</time>
          )}
        </div>
        <h1 className="text-4xl font-bold leading-tight">{tutorial.title}</h1>
        {tutorial.excerpt && (
          <p className="text-lg text-muted-foreground mt-4">
            {tutorial.excerpt}
          </p>
        )}
        {tutorial.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tutorial.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <RichTextRenderer content={tutorial.content} />
    </article>
  );
}

export default async function TutorialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      }
    >
      <TutorialContent slug={slug} />
    </Suspense>
  );
}
