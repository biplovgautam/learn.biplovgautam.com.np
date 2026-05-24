import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLessonById } from "@/lib/data/courses";
import { LessonForm } from "@/components/editor/lesson-form";

export const metadata: Metadata = {
  title: "Edit Lesson",
};

async function EditLessonForm({
  courseId,
  moduleId,
  lessonId,
}: {
  courseId: string;
  moduleId: string;
  lessonId: string;
}) {
  const lesson = await getLessonById(courseId, moduleId, lessonId);
  if (!lesson) notFound();

  return <LessonForm courseId={courseId} moduleId={moduleId} lesson={lesson} />;
}

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string; lessonId: string }>;
}) {
  const { courseId, moduleId, lessonId } = await params;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Lesson</h1>
      <Suspense
        fallback={<p className="text-muted-foreground">Loading lesson...</p>}
      >
        <EditLessonForm
          courseId={courseId}
          moduleId={moduleId}
          lessonId={lessonId}
        />
      </Suspense>
    </div>
  );
}
