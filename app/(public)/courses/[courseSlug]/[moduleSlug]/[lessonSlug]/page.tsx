import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getCourseBySlug,
  getModuleBySlug,
  getLessonBySlug,
  getCourseStructure,
} from "@/lib/data/courses";
import { RichTextRenderer } from "@/components/content/rich-text-renderer";

type LessonParams = {
  courseSlug: string;
  moduleSlug: string;
  lessonSlug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<LessonParams>;
}): Promise<Metadata> {
  const { courseSlug, moduleSlug, lessonSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  if (!course) return { title: "Not Found" };

  const mod = await getModuleBySlug(course.id, moduleSlug);
  if (!mod) return { title: "Not Found" };

  const lesson = await getLessonBySlug(course.id, mod.id, lessonSlug);
  if (!lesson) return { title: "Not Found" };

  return {
    title: `${lesson.title} - ${course.title}`,
    description: `Lesson: ${lesson.title} in module ${mod.title} of ${course.title}`,
  };
}

async function LessonContent({
  courseSlug,
  moduleSlug,
  lessonSlug,
}: LessonParams) {
  const structure = await getCourseStructure(courseSlug);
  if (!structure) notFound();

  const { course, modules } = structure;
  const currentModule = modules.find((m) => m.slug === moduleSlug);
  if (!currentModule) notFound();

  const currentLesson = currentModule.lessons.find(
    (l) => l.slug === lessonSlug
  );
  if (!currentLesson) notFound();

  // Build flat lesson list for prev/next navigation
  const allLessons = modules.flatMap((m) =>
    m.lessons.map((l) => ({
      ...l,
      moduleSlug: m.slug,
      moduleTitle: m.title,
    }))
  );
  const currentIndex = allLessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
      {/* Sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <Link
            href={`/courses/${course.slug}`}
            className="text-sm text-primary hover:underline"
          >
            &larr; {course.title}
          </Link>
          {modules.map((mod) => (
            <div key={mod.id}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                {mod.title}
              </h3>
              <ul className="space-y-0.5">
                {mod.lessons.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/courses/${course.slug}/${mod.slug}/${l.slug}`}
                      className={`block text-sm py-1 px-2 rounded transition-colors ${
                        l.slug === lessonSlug
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <article className="min-w-0">
        {/* Mobile course-contents (native <details>, no JS) */}
        <details className="lg:hidden mb-6 rounded-xl border border-border bg-muted/20 group">
          <summary className="flex items-center justify-between gap-2 px-4 py-3 cursor-pointer text-sm font-medium list-none">
            <span className="inline-flex items-center gap-2">
              <span className="text-muted-foreground">Course contents</span>
              <span className="text-xs text-muted-foreground">
                ({currentIndex + 1}/{allLessons.length})
              </span>
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="transition-transform group-open:rotate-180 text-muted-foreground"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </summary>
          <div className="px-3 pb-3 pt-1 max-h-80 overflow-y-auto space-y-3">
            <Link
              href={`/courses/${course.slug}`}
              className="block text-sm text-primary hover:underline px-2"
            >
              &larr; {course.title}
            </Link>
            {modules.map((mod) => (
              <div key={mod.id}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">
                  {mod.title}
                </h3>
                <ul className="space-y-0.5">
                  {mod.lessons.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/courses/${course.slug}/${mod.slug}/${l.slug}`}
                        className={`block text-sm py-1.5 px-2 rounded transition-colors ${
                          l.slug === lessonSlug
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {l.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>

        <header className="mb-8">
          <p className="text-sm text-muted-foreground mb-2">
            {currentModule.title}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {currentLesson.title}
          </h1>
          <span className="text-sm text-muted-foreground">
            {currentLesson.estimatedMinutes} min read
          </span>
        </header>

        <RichTextRenderer content={currentLesson.content} />

        {/* Prev/Next navigation */}
        <nav className="grid grid-cols-2 gap-3 mt-12 pt-8 border-t border-border">
          {prevLesson ? (
            <Link
              href={`/courses/${course.slug}/${prevLesson.moduleSlug}/${prevLesson.slug}`}
              className="group/nav flex flex-col rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-muted/30 transition-colors"
            >
              <span className="text-xs text-muted-foreground mb-1">
                &larr; Previous
              </span>
              <span className="text-sm font-medium line-clamp-2 group-hover/nav:text-primary transition-colors">
                {prevLesson.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {nextLesson ? (
            <Link
              href={`/courses/${course.slug}/${nextLesson.moduleSlug}/${nextLesson.slug}`}
              className="group/nav flex flex-col rounded-xl border border-border p-4 text-right hover:border-primary/40 hover:bg-muted/30 transition-colors"
            >
              <span className="text-xs text-muted-foreground mb-1">
                Next &rarr;
              </span>
              <span className="text-sm font-medium line-clamp-2 group-hover/nav:text-primary transition-colors">
                {nextLesson.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  );
}

export default async function LessonPage({
  params,
}: {
  params: Promise<LessonParams>;
}) {
  const { courseSlug, moduleSlug, lessonSlug } = await params;

  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      }
    >
      <LessonContent
        courseSlug={courseSlug}
        moduleSlug={moduleSlug}
        lessonSlug={lessonSlug}
      />
    </Suspense>
  );
}
