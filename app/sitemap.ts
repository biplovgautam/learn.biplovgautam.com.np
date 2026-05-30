import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/data/blog";
import { getTutorials } from "@/lib/data/tutorials";
import { getCourses } from "@/lib/data/courses";
import { getCourseStructure } from "@/lib/data/courses";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://learn.biplovgautam.com.np";

function tsToDate(ts: unknown): Date | undefined {
  if (!ts) return undefined;
  if (typeof ts === "string") {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? undefined : d;
  }
  if (typeof (ts as { toDate?: () => Date }).toDate === "function") {
    return (ts as { toDate: () => Date }).toDate();
  }
  return undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, tutorials, courses] = await Promise.all([
    getBlogPosts(),
    getTutorials(),
    getCourses(),
  ]);

  const now = new Date();

  // Static / top-level routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/courses`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tutorials`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/login`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Blog posts
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: tsToDate(post.updatedAt) || now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Tutorials
  const tutorialRoutes: MetadataRoute.Sitemap = tutorials.map((t) => ({
    url: `${BASE_URL}/tutorials/${t.slug}`,
    lastModified: tsToDate(t.updatedAt) || now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Courses + their modules + lessons (deep linking for SEO)
  const courseDeepRoutes: MetadataRoute.Sitemap = [];

  for (const course of courses) {
    courseDeepRoutes.push({
      url: `${BASE_URL}/courses/${course.slug}`,
      lastModified: tsToDate(course.updatedAt) || now,
      changeFrequency: "weekly",
      priority: 0.9,
    });

    // Pull full structure for each course to index every lesson
    const structure = await getCourseStructure(course.slug);
    if (!structure) continue;

    for (const mod of structure.modules) {
      for (const lesson of mod.lessons) {
        courseDeepRoutes.push({
          url: `${BASE_URL}/courses/${course.slug}/${mod.slug}/${lesson.slug}`,
          lastModified: tsToDate(lesson.updatedAt) || now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  }

  return [
    ...staticRoutes,
    ...courseDeepRoutes,
    ...tutorialRoutes,
    ...blogRoutes,
  ];
}
