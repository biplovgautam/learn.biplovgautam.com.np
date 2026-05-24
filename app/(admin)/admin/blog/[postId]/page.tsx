import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostById } from "@/lib/data/blog";
import { BlogPostForm } from "@/components/editor/blog-post-form";

export const metadata: Metadata = {
  title: "Edit Blog Post",
};

async function EditForm({ postId }: { postId: string }) {
  const post = await getBlogPostById(postId);
  if (!post) notFound();

  return <BlogPostForm post={post} />;
}

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>
      <Suspense
        fallback={<p className="text-muted-foreground">Loading post...</p>}
      >
        <EditForm postId={postId} />
      </Suspense>
    </div>
  );
}
