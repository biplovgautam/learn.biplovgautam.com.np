import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostBySlug } from "@/lib/data/blog";
import { RichTextRenderer } from "@/components/content/rich-text-renderer";
import { formatDate } from "@/lib/utils";
import { generateBlogPostJsonLd } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      ...(post.coverImage && { images: [post.coverImage] }),
    },
  };
}

async function BlogPostContent({ slug }: { slug: string }) {
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBlogPostJsonLd(post)) }}
      />
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
          {post.category && (
            <span className="text-primary font-medium">{post.category}</span>
          )}
          {post.publishedAt && <time>{formatDate(post.publishedAt)}</time>}
        </div>
        <h1 className="text-4xl font-bold leading-tight">{post.title}</h1>
        {post.excerpt && (
          <p className="text-lg text-muted-foreground mt-4">{post.excerpt}</p>
        )}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <RichTextRenderer content={post.content} />
    </article>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      }
    >
      <BlogPostContent slug={slug} />
    </Suspense>
  );
}
