"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { createModule } from "@/lib/data/admin";
import { slugify } from "@/lib/utils";

export default function NewModulePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    startTransition(async () => {
      await createModule(courseId, {
        title,
        slug: slug || slugify(title),
        description,
      });
      router.push(`/admin/courses/${courseId}`);
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">New Module</h1>
      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Module title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Auto-generated from title if empty"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Module description"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isPending || !title}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Module"}
        </button>
      </div>
    </div>
  );
}
