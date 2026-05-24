import type { Metadata } from "next";
import { CourseForm } from "@/components/editor/course-form";

export const metadata: Metadata = {
  title: "New Course",
};

export default function NewCoursePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">New Course</h1>
      <CourseForm />
    </div>
  );
}
