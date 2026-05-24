import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { getBlogPosts } from "@/lib/data/blog";
import { formatDate } from "@/lib/utils";

export default async function DashBlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="space-y-6">
      <div>
        <p className="label-mono mb-2">Your feed</p>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Articles to read
        </h2>
        <p className="text-muted-foreground text-sm">
          Personalized feed of new and recommended articles.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Read history will appear here once you start reading.
        </p>
      </div>

      <div>
        <p className="label-mono mb-3">All articles</p>
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-border bg-muted/20 p-12 text-center">
            <p className="text-muted-foreground">
              No articles published yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-border bg-muted/20 p-5 hover:bg-muted/40 hover:border-primary/40 transition-colors flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {post.category && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      {post.category}
                    </span>
                  )}
                  {post.publishedAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(post.publishedAt)}
                    </span>
                  )}
                  {post.biPoints > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-primary">
                      <Zap size={12} strokeWidth={2} />
                      {post.biPoints}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                )}
                <span className="mt-auto inline-flex items-center gap-1 text-xs text-primary">
                  Read <ArrowRight size={12} strokeWidth={2} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
