"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { ImageUpload } from "@/components/editor/image-upload";
import { useAutosave } from "@/components/editor/use-autosave";
import { SaveStatusBadge } from "@/components/editor/save-status-badge";
import { createTutorial, updateTutorial } from "@/lib/data/admin";
import { slugify } from "@/lib/utils";
import type { Tutorial, TipTapContent } from "@/lib/types";

interface TutorialFormProps {
  tutorial?: Tutorial;
}

export function TutorialForm({ tutorial }: TutorialFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [tutorialId, setTutorialId] = useState<string | null>(
    tutorial?.id ?? null
  );
  const [currentStatus, setCurrentStatus] = useState<"draft" | "published">(
    tutorial?.status ?? "draft"
  );

  const [title, setTitle] = useState(tutorial?.title || "");
  const [slug, setSlug] = useState(tutorial?.slug || "");
  const [excerpt, setExcerpt] = useState(tutorial?.excerpt || "");
  const [coverImage, setCoverImage] = useState(tutorial?.coverImage || "");
  const [tags, setTags] = useState(tutorial?.tags?.join(", ") || "");
  const [difficulty, setDifficulty] = useState(tutorial?.difficulty || "beginner");
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    tutorial?.estimatedMinutes || 15
  );
  const [biPoints, setBiPoints] = useState(tutorial?.biPoints || 20);
  const [content, setContent] = useState<TipTapContent | null>(
    tutorial?.content || null
  );

  const buildData = (status: "draft" | "published") => ({
    title,
    slug: slug || slugify(title),
    excerpt,
    coverImage,
    tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    difficulty: difficulty as "beginner" | "intermediate" | "advanced",
    estimatedMinutes,
    biPoints,
    content: content!,
    status,
  });

  // Create on first save (capture id + keep current status), update thereafter.
  const persist = async (status: "draft" | "published") => {
    const data = buildData(status);
    if (tutorialId) {
      await updateTutorial(tutorialId, data);
    } else {
      const newId = await createTutorial(data);
      setTutorialId(newId);
    }
    setCurrentStatus(status);
  };

  const canSave = Boolean(title.trim()) && Boolean(content);

  const { status: saveStatus } = useAutosave({
    signature: JSON.stringify({
      title,
      slug,
      excerpt,
      coverImage,
      tags,
      difficulty,
      estimatedMinutes,
      biPoints,
      content,
    }),
    enabled: canSave,
    onSave: () => persist(currentStatus),
    delay: 5000,
  });

  const handleSubmit = (status: "draft" | "published") => {
    startTransition(async () => {
      await persist(status);
      router.push("/admin/tutorials");
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
            onChange={(e) => {
              setTitle(e.target.value);
              if (!tutorialId) setSlug(slugify(e.target.value));
            }}
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
        <label className="block text-sm font-medium mb-1">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
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
            placeholder="20"
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
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Content</label>
          <SaveStatusBadge status={saveStatus} />
        </div>
        <RichTextEditor content={content} onChange={setContent} placeholder="Write your tutorial..." />
        <p className="mt-2 text-xs text-muted-foreground">
          Autosaves as a draft 5 seconds after you stop typing.
        </p>
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
          disabled={isPending || !title || !content}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Publishing..." : "Publish"}
        </button>
        <SaveStatusBadge status={saveStatus} />
      </div>
    </div>
  );
}
