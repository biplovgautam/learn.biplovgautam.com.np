"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { createLesson, updateLesson } from "@/lib/data/admin";
import { slugify } from "@/lib/utils";
import type { Lesson, TipTapContent } from "@/lib/types";

interface LessonFormProps {
  courseId: string;
  moduleId: string;
  lesson?: Lesson;
}

export function LessonForm({ courseId, moduleId, lesson }: LessonFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(lesson?.title || "");
  const [slug, setSlug] = useState(lesson?.slug || "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(lesson?.estimatedMinutes || 10);
  const [biPoints, setBiPoints] = useState(lesson?.biPoints || 10);
  const [content, setContent] = useState<TipTapContent | null>(lesson?.content || null);

  const handleSubmit = () => {
    startTransition(async () => {
      const data = {
        title,
        slug: slug || slugify(title),
        estimatedMinutes,
        biPoints,
        content: content!,
      };

      if (lesson) {
        await updateLesson(courseId, moduleId, lesson.id, data);
      } else {
        await createLesson(courseId, moduleId, data);
      }

      router.push(`/admin/courses/${courseId}`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (!lesson) setSlug(slugify(e.target.value)); }}
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
        <div>
          <label className="block text-sm font-medium mb-1">Est. Minutes</label>
          <input
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
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
            placeholder="10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Content</label>
        <RichTextEditor content={content} onChange={setContent} placeholder="Write your lesson..." />
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          onClick={handleSubmit}
          disabled={isPending || !title || !content}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Lesson"}
        </button>
      </div>
    </div>
  );
}
