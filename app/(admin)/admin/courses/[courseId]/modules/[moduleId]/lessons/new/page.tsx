import type { Metadata } from "next";
import { LessonForm } from "@/components/editor/lesson-form";

export const metadata: Metadata = {
  title: "New Lesson",
};

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const { courseId, moduleId } = await params;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">New Lesson</h1>
      <LessonForm courseId={courseId} moduleId={moduleId} />
    </div>
  );
}
