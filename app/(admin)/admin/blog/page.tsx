import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PenLine } from "lucide-react";
import { getAllBlogPosts } from "@/lib/data/blog";
import { formatDate } from "@/lib/utils";
import { deleteBlogPost } from "@/lib/data/admin";
import { DeleteButton } from "@/components/ui/delete-button";

export const metadata: Metadata = {
  title: "Manage Blog Posts",
};

async function BlogPostList() {
  const posts = await getAllBlogPosts();

  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        No blog posts yet. Create your first one!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="flex items-center gap-4 rounded-lg border border-border p-4"
        >
          <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <PenLine size={18} strokeWidth={1.6} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/admin/blog/${post.id}`}
              className="font-medium hover:text-primary truncate block"
            >
              {post.title}
            </Link>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span
                className={
                  post.status === "published"
                    ? "text-success"
                    : "text-muted-foreground"
                }
              >
                {post.status}
              </span>
              {post.updatedAt && (
                <span>{formatDate(post.updatedAt)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Link
              href={`/admin/blog/${post.id}`}
              className="rounded-md px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors"
            >
              Edit
            </Link>
            <DeleteButton
              action={deleteBlogPost.bind(null, post.id)}
              label="Delete"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminBlogPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          New Post
        </Link>
      </div>
      <Suspense
        fallback={<p className="text-muted-foreground">Loading posts...</p>}
      >
        <BlogPostList />
      </Suspense>
    </div>
  );
}
