"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/editor/image-upload";
import { createCourse, updateCourse } from "@/lib/data/admin";
import { slugify } from "@/lib/utils";
import type { Course } from "@/lib/types";

interface CourseFormProps {
  course?: Course;
}

export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(course?.title || "");
  const [slug, setSlug] = useState(course?.slug || "");
  const [description, setDescription] = useState(course?.description || "");
  const [coverImage, setCoverImage] = useState(course?.coverImage || "");
  const [tags, setTags] = useState(course?.tags?.join(", ") || "");
  const [authors, setAuthors] = useState(course?.authors?.join(", ") || "Biplov Gautam");
  const [difficulty, setDifficulty] = useState(course?.difficulty || "beginner");
  const [estimatedHours, setEstimatedHours] = useState(course?.estimatedHours || 1);
  const [biPoints, setBiPoints] = useState(course?.biPoints || 100);

  const handleSubmit = (status: "draft" | "published") => {
    startTransition(async () => {
      const data = {
        title,
        slug: slug || slugify(title),
        description,
        coverImage,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        authors: authors.split(",").map((a) => a.trim()).filter(Boolean),
        difficulty: difficulty as "beginner" | "intermediate" | "advanced",
        estimatedHours,
        biPoints,
        status,
      };

      if (course) {
        await updateCourse(course.id, data);
      } else {
        await createCourse(data);
      }

      router.push("/admin/courses");
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (!course) setSlug(slugify(e.target.value)); }}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as "beginner" | "intermediate" | "advanced")}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Est. Hours</label>
          <input
            type="number"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bi Points</label>
          <input
            type="number"
            value={biPoints}
            onChange={(e) => setBiPoints(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="100"
          />
        </div>
        <div>
          <ImageUpload
            label="Cover Image"
            currentImage={coverImage}
            onUpload={setCoverImage}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Authors (comma-separated)</label>
          <input
            type="text"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            placeholder="Biplov Gautam, Co-author Name"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          onClick={() => handleSubmit("draft")}
          disabled={isPending || !title}
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Draft"}
        </button>
        <button
          onClick={() => handleSubmit("published")}
          disabled={isPending || !title || !description}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Publishing..." : "Publish"}
        </button>
      </div>
    </div>
  );
}
