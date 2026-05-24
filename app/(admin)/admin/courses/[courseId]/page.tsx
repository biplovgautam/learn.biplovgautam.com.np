import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourseById, getModules, getLessons } from "@/lib/data/courses";
import { deleteModule, deleteLesson } from "@/lib/data/admin";
import { DeleteButton } from "@/components/ui/delete-button";

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
      <div className="rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{course.title}</h2>
          <Link
            href={`/admin/courses/${courseId}/edit`}
            className="rounded-md px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors"
          >
            Edit Course Details
          </Link>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
        </div>
        {course.description && (
          <p className="mt-3 text-sm text-muted-foreground">
            {course.description}
          </p>
        )}
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
            {modulesWithLessons.map((mod) => (
              <div
                key={mod.id}
                className="rounded-lg border border-border"
              >
                {/* Module header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div>
                    <h3 className="font-medium">{mod.title}</h3>
                    {mod.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {mod.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
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
                    {mod.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between px-4 py-3 pl-8"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-sm">{lesson.title}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {lesson.estimatedMinutes}min
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Course Editor</h1>
        <Link
          href="/admin/courses"
          className="rounded-md px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors"
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
