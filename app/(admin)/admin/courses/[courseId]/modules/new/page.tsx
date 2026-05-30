import type { Metadata } from "next";
import { ModuleForm } from "@/components/editor/module-form";

export const metadata: Metadata = {
  title: "New Module",
};

export default async function NewModulePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">New Module</h1>
      <ModuleForm courseId={courseId} />
    </div>
  );
}
