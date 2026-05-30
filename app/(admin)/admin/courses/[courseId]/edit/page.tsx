import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourseById } from "@/lib/data/courses";
import { CourseForm } from "@/components/editor/course-form";

export const metadata: Metadata = {
  title: "Edit Course Details",
};

async function EditCourseForm({ courseId }: { courseId: string }) {
  const course = await getCourseById(courseId);
  if (!course) notFound();

  return <CourseForm course={course} />;
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Edit Course</h1>
        <Link
          href={`/admin/courses/${courseId}`}
          className="rounded-md px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors"
        >
          Back
        </Link>
      </div>
      <Suspense
        fallback={<p className="text-muted-foreground">Loading...</p>}
      >
        <EditCourseForm courseId={courseId} />
      </Suspense>
    </div>
  );
}
