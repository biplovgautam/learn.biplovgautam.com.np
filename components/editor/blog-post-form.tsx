"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { ImageUpload } from "@/components/editor/image-upload";
import { useAutosave } from "@/components/editor/use-autosave";
import { SaveStatusBadge } from "@/components/editor/save-status-badge";
import { createBlogPost, updateBlogPost } from "@/lib/data/admin";
import { slugify } from "@/lib/utils";
import type { BlogPost, TipTapContent } from "@/lib/types";

interface BlogPostFormProps {
  post?: BlogPost;
}

export function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [postId, setPostId] = useState<string | null>(post?.id ?? null);
  const [currentStatus, setCurrentStatus] = useState<"draft" | "published">(
    post?.status ?? "draft"
  );

  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [tags, setTags] = useState(post?.tags?.join(", ") || "");
  const [category, setCategory] = useState(post?.category || "");
  const [biPoints, setBiPoints] = useState(post?.biPoints || 10);
  const [content, setContent] = useState<TipTapContent | null>(
    post?.content || null
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!postId) setSlug(slugify(value));
  };

  const buildData = (status: "draft" | "published") => ({
    title,
    slug: slug || slugify(title),
    excerpt,
    coverImage,
    tags: tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    category,
    biPoints,
    content: content!,
    status,
  });

  // Create on first save (capture id), update thereafter.
  const persist = async (status: "draft" | "published") => {
    const data = buildData(status);
    if (postId) {
      await updateBlogPost(postId, data);
    } else {
      const newId = await createBlogPost(data);
      setPostId(newId);
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
      category,
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
      router.push("/admin/blog");
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
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Post title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="post-url-slug"
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
          placeholder="Short description for cards and SEO"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUpload
          label="Cover Image"
          currentImage={coverImage}
          onUpload={setCoverImage}
        />
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. Robotics, ROS 2"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <div>
          <label className="block text-sm font-medium mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="ros2, robotics, tutorial"
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
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Content</label>
          <SaveStatusBadge status={saveStatus} />
        </div>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Write your blog post..."
        />
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
