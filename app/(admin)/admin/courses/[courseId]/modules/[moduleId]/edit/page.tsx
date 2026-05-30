import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getModuleById } from "@/lib/data/courses";
import { ModuleForm } from "@/components/editor/module-form";

export const metadata: Metadata = {
  title: "Edit Module",
};

async function EditModule({
  courseId,
  moduleId,
}: {
  courseId: string;
  moduleId: string;
}) {
  const mod = await getModuleById(courseId, moduleId);
  if (!mod) notFound();

  return <ModuleForm courseId={courseId} module={mod} />;
}

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const { courseId, moduleId } = await params;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Edit Module</h1>
        <Link
          href={`/admin/courses/${courseId}`}
          className="rounded-md px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors whitespace-nowrap"
        >
          Back to Course
        </Link>
      </div>
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <EditModule courseId={courseId} moduleId={moduleId} />
      </Suspense>
    </div>
  );
}
