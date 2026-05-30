import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Clock, Layers, BookOpen, Zap } from "lucide-react";
import { getCourseStructure } from "@/lib/data/courses";
import { generateCourseJsonLd } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug } = await params;
  const data = await getCourseStructure(courseSlug);

  if (!data) return { title: "Course Not Found" };

  return {
    title: data.course.title,
    description: data.course.description,
    openGraph: {
      title: data.course.title,
      description: data.course.description,
      ...(data.course.coverImage && { images: [data.course.coverImage] }),
    },
  };
}

const difficultyColors = {
  beginner: "bg-primary/15 text-primary",
  intermediate: "bg-yellow-500/15 text-yellow-400",
  advanced: "bg-red-500/15 text-red-400",
};

async function CourseContent({ courseSlug }: { courseSlug: string }) {
  const data = await getCourseStructure(courseSlug);

  if (!data) notFound();

  const { course, modules } = data;
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateCourseJsonLd(course)) }}
      />

      {/* Cover hero */}
      {course.coverImage && (
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl border border-border mb-8 bg-muted">
          <Image
            src={course.coverImage}
            alt={course.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
          <span
            className={`absolute top-4 left-4 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur ${difficultyColors[course.difficulty]}`}
          >
            {course.difficulty}
          </span>
        </div>
      )}

      <header className="mb-10">
        {!course.coverImage && (
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColors[course.difficulty]}`}
            >
              {course.difficulty}
            </span>
          </div>
        )}
        <h1 className="text-4xl font-bold leading-tight">{course.title}</h1>

        {course.authors && course.authors.length > 0 && (
          <p className="text-sm text-muted-foreground mt-3">
            By{" "}
            <span className="text-foreground font-medium">
              {course.authors.join(", ")}
            </span>
          </p>
        )}

        <p className="text-lg text-muted-foreground mt-4">
          {course.description}
        </p>

        {/* Meta stats row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={15} strokeWidth={1.8} />
            {course.estimatedHours}h
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Layers size={15} strokeWidth={1.8} />
            {modules.length} modules
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen size={15} strokeWidth={1.8} />
            {totalLessons} lessons
          </span>
          {course.biPoints > 0 && (
            <span className="inline-flex items-center gap-1.5 text-primary">
              <Zap size={15} strokeWidth={1.8} />
              {course.biPoints} Bi Points
            </span>
          )}
        </div>
      </header>

      <div className="space-y-6">
        {modules.map((mod, modIndex) => (
          <div
            key={mod.id}
            className="rounded-lg border border-border overflow-hidden"
          >
            <div className="bg-muted/50 px-5 py-4">
              <h2 className="font-semibold">
                Module {modIndex + 1}: {mod.title}
              </h2>
              {mod.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {mod.description}
                </p>
              )}
            </div>
            <div className="divide-y divide-border">
              {mod.lessons.map((lesson, lessonIndex) => (
                <Link
                  key={lesson.id}
                  href={`/courses/${course.slug}/${mod.slug}/${lesson.slug}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm">
                    <span className="text-muted-foreground mr-2">
                      {modIndex + 1}.{lessonIndex + 1}
                    </span>
                    {lesson.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lesson.estimatedMinutes} min
                  </span>
                </Link>
              ))}
              {mod.lessons.length === 0 && (
                <p className="px-5 py-3 text-sm text-muted-foreground">
                  No lessons yet.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;

  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      }
    >
      <CourseContent courseSlug={courseSlug} />
    </Suspense>
  );
}
