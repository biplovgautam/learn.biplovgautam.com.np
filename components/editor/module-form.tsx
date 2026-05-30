"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createModule, updateModule } from "@/lib/data/admin";
import { slugify } from "@/lib/utils";
import type { Module } from "@/lib/types";

interface ModuleFormProps {
  courseId: string;
  module?: Module;
}

export function ModuleForm({ courseId, module }: ModuleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(module?.title || "");
  const [slug, setSlug] = useState(module?.slug || "");
  const [description, setDescription] = useState(module?.description || "");

  const handleSubmit = () => {
    startTransition(async () => {
      const data = { title, slug: slug || slugify(title), description };
      if (module) {
        await updateModule(courseId, module.id, data);
      } else {
        await createModule(courseId, data);
      }
      router.push(`/admin/courses/${courseId}`);
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!module) setSlug(slugify(e.target.value));
          }}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Module title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Auto-generated from title if empty"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Module description"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={isPending || !title}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isPending
          ? module
            ? "Saving..."
            : "Creating..."
          : module
            ? "Save Module"
            : "Create Module"}
      </button>
    </div>
  );
}
