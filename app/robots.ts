import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://learn.biplovgautam.com.np";

export default function robots(): MetadataRoute.Robots {
  const disallowed = ["/admin/", "/api/", "/login", "/dash/", "/profile/"];

  return {
    rules: [
      // Standard search engine bots — full content access
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowed,
      },
      // AI training / search bots — explicit allow for content discovery
      {
        userAgent: "GPTBot",
        allow: ["/", "/courses/", "/tutorials/", "/blog/"],
        disallow: disallowed,
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: disallowed,
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: disallowed,
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: disallowed,
      },
      {
        userAgent: "Claude-Web",
        allow: "/",
        disallow: disallowed,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: disallowed,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: disallowed,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: disallowed,
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: disallowed,
      },
      {
        userAgent: "CCBot",
        allow: "/",
        disallow: disallowed,
      },
      {
        userAgent: "Bytespider",
        allow: "/",
        disallow: disallowed,
      },
      {
        userAgent: "Meta-ExternalAgent",
        allow: "/",
        disallow: disallowed,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
