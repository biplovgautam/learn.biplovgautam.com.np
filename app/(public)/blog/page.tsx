import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/data/blog";
import { BlogCard } from "@/components/content/blog-card";
import { ContentSidebar } from "@/components/layout/content-sidebar";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles on ROS 2, robotics, software engineering, and more.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="label-mono mb-3">Writing</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          Blog
        </h1>
        <p className="text-muted-foreground text-lg">
          Thoughts, tutorials, and deep dives into robotics and software.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <ContentSidebar type="blog" />

        <div className="flex-1 min-w-0">
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-border bg-muted/20 p-12 text-center">
              <p className="text-muted-foreground">
                No posts published yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
