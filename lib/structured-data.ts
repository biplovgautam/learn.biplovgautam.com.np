import type { Course, Tutorial, BlogPost } from "./types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://learn.biplovgautam.com.np";

export function generateCourseJsonLd(course: Course) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: "BiLearnHub",
      url: SITE_URL,
    },
    url: `${SITE_URL}/courses/${course.slug}`,
    ...(course.coverImage && { image: course.coverImage }),
    ...(course.difficulty && {
      educationalLevel: course.difficulty,
    }),
    ...(course.estimatedHours && {
      timeRequired: `PT${course.estimatedHours}H`,
    }),
  };
}

export function generateTutorialJsonLd(tutorial: Tutorial) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: tutorial.title,
    description: tutorial.excerpt,
    author: {
      "@type": "Person",
      name: "Biplov Gautam",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "BiLearnHub",
      url: SITE_URL,
    },
    url: `${SITE_URL}/tutorials/${tutorial.slug}`,
    datePublished: tutorial.createdAt,
    dateModified: tutorial.updatedAt,
    ...(tutorial.coverImage && { image: tutorial.coverImage }),
    ...(tutorial.estimatedMinutes && {
      timeRequired: `PT${tutorial.estimatedMinutes}M`,
    }),
    ...(tutorial.tags?.length && { keywords: tutorial.tags.join(", ") }),
  };
}

export function generateBlogPostJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: "Biplov Gautam",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "BiLearnHub",
      url: SITE_URL,
    },
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    ...(post.coverImage && { image: post.coverImage }),
    ...(post.tags?.length && { keywords: post.tags.join(", ") }),
    ...(post.category && { articleSection: post.category }),
  };
}

export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BiLearnHub",
    url: SITE_URL,
    description: "Learn Applied AI, ROS 2 robotics, and modern software engineering with structured courses, tutorials, and articles.",
    author: {
      "@type": "Person",
      name: "Biplov Gautam",
    },
  };
}
