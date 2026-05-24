import type { Metadata } from "next";
import { TutorialForm } from "@/components/editor/tutorial-form";

export const metadata: Metadata = {
  title: "New Tutorial",
};

export default function NewTutorialPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">New Tutorial</h1>
      <TutorialForm />
    </div>
  );
}
