import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { getAllCourses } from "@/lib/data/courses";
import { formatDate } from "@/lib/utils";
import { deleteCourse } from "@/lib/data/admin";
import { DeleteButton } from "@/components/ui/delete-button";

export const metadata: Metadata = {
  title: "Manage Courses",
};

async function CourseList() {
  const courses = await getAllCourses();

  if (courses.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        No courses yet. Create your first one!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {courses.map((course) => (
        <div
          key={course.id}
          className="flex items-center gap-4 rounded-lg border border-border p-4"
        >
          {/* Thumbnail */}
          <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            {course.coverImage ? (
              <Image
                src={course.coverImage}
                alt={course.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <BookOpen size={18} strokeWidth={1.6} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/admin/courses/${course.id}`}
              className="font-medium hover:text-primary truncate block"
            >
              {course.title}
            </Link>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
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
              <span>{course.estimatedHours}h</span>
              {course.updatedAt && (
                <span>{formatDate(course.updatedAt)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Link
              href={`/admin/courses/${course.id}`}
              className="rounded-md px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors"
            >
              Edit
            </Link>
            <DeleteButton
              action={deleteCourse.bind(null, course.id)}
              label="Delete"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminCoursesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Link
          href="/admin/courses/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          New Course
        </Link>
      </div>
      <Suspense
        fallback={<p className="text-muted-foreground">Loading courses...</p>}
      >
        <CourseList />
      </Suspense>
    </div>
  );
}
