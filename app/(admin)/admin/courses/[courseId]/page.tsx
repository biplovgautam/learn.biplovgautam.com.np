import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { getCourseById, getModules, getLessons } from "@/lib/data/courses";
import {
  updateCourse,
  deleteModule,
  deleteLesson,
  moveModule,
  moveLesson,
} from "@/lib/data/admin";
import { DeleteButton } from "@/components/ui/delete-button";
import { PublishButton } from "@/components/ui/publish-button";
import { ReorderButtons } from "@/components/ui/reorder-buttons";

export const metadata: Metadata = {
  title: "Edit Course",
};

async function CourseEditor({ courseId }: { courseId: string }) {
  const course = await getCourseById(courseId);
  if (!course) notFound();

  const modules = await getModules(courseId);
  const modulesWithLessons = await Promise.all(
    modules.map(async (mod) => ({
      ...mod,
      lessons: await getLessons(courseId, mod.id),
    }))
  );

  return (
    <div className="space-y-8">
      {/* Course details */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Cover */}
          <div className="relative aspect-video w-full sm:w-56 sm:aspect-auto shrink-0 bg-muted border-b sm:border-b-0 sm:border-r border-border">
            {course.coverImage ? (
              <Image
                src={course.coverImage}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 224px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center py-10 text-muted-foreground">
                <BookOpen size={28} strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <h2 className="text-xl font-semibold break-words">
                {course.title}
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <PublishButton
                  isPublished={course.status === "published"}
                  action={updateCourse.bind(null, course.id, {
                    status:
                      course.status === "published" ? "draft" : "published",
                  })}
                />
                <Link
                  href={`/admin/courses/${courseId}/edit`}
                  className="rounded-md px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors whitespace-nowrap"
                >
                  Edit Details
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span
                className={
                  course.status === "published"
                    ? "text-success"
                    : "text-muted-foreground"
                }
              >
                {course.status}
              </span>
              <span>{course.difficulty}</span>
              <span>{course.estimatedHours}h estimated</span>
              {course.biPoints > 0 && <span>{course.biPoints} Bi Points</span>}
            </div>
            {course.description && (
              <p className="mt-3 text-sm text-muted-foreground">
                {course.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modules & Lessons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Modules</h2>
          <Link
            href={`/admin/courses/${courseId}/modules/new`}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Add Module
          </Link>
        </div>

        {modulesWithLessons.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No modules yet. Add your first module!
          </p>
        ) : (
          <div className="space-y-4">
            {modulesWithLessons.map((mod, modIndex) => (
              <div
                key={mod.id}
                className="rounded-lg border border-border"
              >
                {/* Module header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-border">
                  <div className="flex items-start gap-3 min-w-0">
                    <ReorderButtons
                      onMove={moveModule.bind(null, courseId, mod.id)}
                      isFirst={modIndex === 0}
                      isLast={modIndex === modulesWithLessons.length - 1}
                    />
                    <div className="min-w-0">
                      <h3 className="font-medium">
                        <span className="text-muted-foreground mr-1.5">
                          {modIndex + 1}.
                        </span>
                        {mod.title}
                      </h3>
                      {mod.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/courses/${courseId}/modules/${mod.id}/edit`}
                      className="rounded-md px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/courses/${courseId}/modules/${mod.id}/lessons/new`}
                      className="rounded-md px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors"
                    >
                      Add Lesson
                    </Link>
                    <DeleteButton
                      action={deleteModule.bind(null, courseId, mod.id)}
                      label="Delete"
                    />
                  </div>
                </div>

                {/* Lessons list */}
                {mod.lessons.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {mod.lessons.map((lesson, lessonIndex) => (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between gap-3 px-4 py-3 sm:pl-6"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <ReorderButtons
                            onMove={moveLesson.bind(
                              null,
                              courseId,
                              mod.id,
                              lesson.id
                            )}
                            isFirst={lessonIndex === 0}
                            isLast={lessonIndex === mod.lessons.length - 1}
                          />
                          <div className="min-w-0">
                            <span className="text-sm">
                              <span className="text-muted-foreground mr-1.5">
                                {modIndex + 1}.{lessonIndex + 1}
                              </span>
                              {lesson.title}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {lesson.estimatedMinutes}min
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/admin/courses/${courseId}/modules/${mod.id}/lessons/${lesson.id}`}
                            className="rounded-md px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors"
                          >
                            Edit
                          </Link>
                          <DeleteButton
                            action={deleteLesson.bind(
                              null,
                              courseId,
                              mod.id,
                              lesson.id
                            )}
                            label="Delete"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground px-4 py-3 pl-8">
                    No lessons in this module yet.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Course Editor</h1>
        <Link
          href="/admin/courses"
          className="rounded-md px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors whitespace-nowrap"
        >
          Back to Courses
        </Link>
      </div>
      <Suspense
        fallback={
          <p className="text-muted-foreground">Loading course...</p>
        }
      >
        <CourseEditor courseId={courseId} />
      </Suspense>
    </div>
  );
}
