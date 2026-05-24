import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTutorialById } from "@/lib/data/tutorials";
import { TutorialForm } from "@/components/editor/tutorial-form";

export const metadata: Metadata = {
  title: "Edit Tutorial",
};

async function EditForm({ tutorialId }: { tutorialId: string }) {
  const tutorial = await getTutorialById(tutorialId);
  if (!tutorial) notFound();

  return <TutorialForm tutorial={tutorial} />;
}

export default async function EditTutorialPage({
  params,
}: {
  params: Promise<{ tutorialId: string }>;
}) {
  const { tutorialId } = await params;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Tutorial</h1>
      <Suspense
        fallback={<p className="text-muted-foreground">Loading tutorial...</p>}
      >
        <EditForm tutorialId={tutorialId} />
      </Suspense>
    </div>
  );
}
