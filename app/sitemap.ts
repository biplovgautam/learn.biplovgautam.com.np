import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/data/blog";
import { getTutorials } from "@/lib/data/tutorials";
import { getCourses } from "@/lib/data/courses";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://learn.biplovgautam.com.np";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, tutorials, courses] = await Promise.all([
    getBlogPosts(),
    getTutorials(),
    getCourses(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/courses`, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${BASE_URL}/tutorials`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.9 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt?.toDate?.() || undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const tutorialRoutes: MetadataRoute.Sitemap = tutorials.map((t) => ({
    url: `${BASE_URL}/tutorials/${t.slug}`,
    lastModified: t.updatedAt?.toDate?.() || undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${BASE_URL}/courses/${c.slug}`,
    lastModified: c.updatedAt?.toDate?.() || undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes, ...tutorialRoutes, ...blogRoutes];
}
