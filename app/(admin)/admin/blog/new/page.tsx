import type { Metadata } from "next";
import { BlogPostForm } from "@/components/editor/blog-post-form";

export const metadata: Metadata = {
  title: "New Blog Post",
};

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">New Blog Post</h1>
      <BlogPostForm />
    </div>
  );
}
