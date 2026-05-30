import type { Course, Tutorial, BlogPost } from "./types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://learn.biplovgautam.com.np";

function tsToISO(ts: unknown): string | undefined {
  if (!ts) return undefined;
  if (typeof ts === "string") return ts;
  if (typeof (ts as { toDate?: () => Date }).toDate === "function") {
    return (ts as { toDate: () => Date }).toDate().toISOString();
  }
  return undefined;
}

const PROVIDER = {
  "@type": "Organization",
  name: "BiLearnHub",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
} as const;

const AUTHOR = {
  "@type": "Person",
  name: "Biplov Gautam",
  url: "https://biplovgautam.com.np",
  sameAs: [
    "https://github.com/biplovgautam",
    "https://x.com/BiplovGautam_",
    "https://linkedin.com/in/biplovgautam",
  ],
} as const;

export function generateCourseJsonLd(course: Course) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: PROVIDER,
    author: AUTHOR,
    url: `${SITE_URL}/courses/${course.slug}`,
    inLanguage: "en",
    ...(course.coverImage && { image: course.coverImage }),
    ...(course.difficulty && { educationalLevel: course.difficulty }),
    ...(course.estimatedHours && {
      timeRequired: `PT${course.estimatedHours}H`,
    }),
    ...(course.tags?.length && { keywords: course.tags.join(", ") }),
    ...(tsToISO(course.publishedAt) && {
      datePublished: tsToISO(course.publishedAt),
    }),
    ...(tsToISO(course.updatedAt) && {
      dateModified: tsToISO(course.updatedAt),
    }),
    isAccessibleForFree: true,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: course.estimatedHours
        ? `PT${course.estimatedHours}H`
        : undefined,
    },
  };
}

export function generateTutorialJsonLd(tutorial: Tutorial) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: tutorial.title,
    description: tutorial.excerpt,
    author: AUTHOR,
    publisher: PROVIDER,
    url: `${SITE_URL}/tutorials/${tutorial.slug}`,
    inLanguage: "en",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/tutorials/${tutorial.slug}`,
    },
    ...(tsToISO(tutorial.publishedAt) && {
      datePublished: tsToISO(tutorial.publishedAt),
    }),
    ...(tsToISO(tutorial.updatedAt) && {
      dateModified: tsToISO(tutorial.updatedAt),
    }),
    ...(tutorial.coverImage && { image: tutorial.coverImage }),
    ...(tutorial.estimatedMinutes && {
      timeRequired: `PT${tutorial.estimatedMinutes}M`,
    }),
    ...(tutorial.tags?.length && { keywords: tutorial.tags.join(", ") }),
    ...(tutorial.difficulty && {
      proficiencyLevel: tutorial.difficulty,
      educationalLevel: tutorial.difficulty,
    }),
  };
}

export function generateBlogPostJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: AUTHOR,
    publisher: PROVIDER,
    url: `${SITE_URL}/blog/${post.slug}`,
    inLanguage: "en",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    ...(tsToISO(post.publishedAt) && {
      datePublished: tsToISO(post.publishedAt),
    }),
    ...(tsToISO(post.updatedAt) && {
      dateModified: tsToISO(post.updatedAt),
    }),
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
    alternateName: "Learn with Biplov",
    url: SITE_URL,
    description:
      "Open courseware on ROS 2, robotics, and intelligent systems by Biplov Gautam.",
    author: AUTHOR,
    publisher: PROVIDER,
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
