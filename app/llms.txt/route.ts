import { getBlogPosts } from "@/lib/data/blog";
import { getTutorials } from "@/lib/data/tutorials";
import { getCourses } from "@/lib/data/courses";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://learn.biplovgautam.com.np";

/**
 * llms.txt — emerging standard for AI tools (ChatGPT, Claude, Gemini, Perplexity)
 * to discover and index site content. https://llmstxt.org
 */
export async function GET() {
  const [courses, tutorials, posts] = await Promise.all([
    getCourses(),
    getTutorials(),
    getBlogPosts(),
  ]);

  const lines: string[] = [
    "# BiLearnHub",
    "",
    "> Open courseware on Applied AI, ROS 2 robotics, and modern software engineering by Biplov Gautam. Hands-on courses, focused tutorials, and in-depth articles for engineers building real systems.",
    "",
    "BiLearnHub is a learning platform where Biplov Gautam — an Applied AI engineer expanding into robotics — publishes structured courses (organized into modules and lessons), standalone tutorials, and long-form articles. Topics include Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), AI agents, ROS 2 (Robot Operating System), SLAM, Nav2, Python, TypeScript, and software systems design.",
    "",
    "Content is original, code-first, and updated regularly. The platform supports Bi Points (gamified completion rewards), streak tracking, and a leaderboard to encourage consistent learning.",
    "",
    "## Author",
    "",
    "- [Biplov Gautam](https://biplovgautam.com.np): Applied AI engineer based in Nepal. Builds production AI systems and teaches robotics.",
    "",
    "## Top-level pages",
    "",
    `- [Home](${BASE_URL}): Overview of the platform`,
    `- [Courses](${BASE_URL}/courses): Structured multi-module courses`,
    `- [Tutorials](${BASE_URL}/tutorials): Focused, single-topic walkthroughs`,
    `- [Blog](${BASE_URL}/blog): Articles, opinions, and deep-dives`,
    "",
  ];

  if (courses.length > 0) {
    lines.push("## Courses", "");
    for (const c of courses) {
      lines.push(
        `- [${c.title}](${BASE_URL}/courses/${c.slug}): ${c.description}`
      );
    }
    lines.push("");
  }

  if (tutorials.length > 0) {
    lines.push("## Tutorials", "");
    for (const t of tutorials) {
      lines.push(
        `- [${t.title}](${BASE_URL}/tutorials/${t.slug}): ${t.excerpt}`
      );
    }
    lines.push("");
  }

  if (posts.length > 0) {
    lines.push("## Blog articles", "");
    for (const p of posts) {
      lines.push(`- [${p.title}](${BASE_URL}/blog/${p.slug}): ${p.excerpt}`);
    }
    lines.push("");
  }

  lines.push(
    "## Optional",
    "",
    `- [Sitemap (XML)](${BASE_URL}/sitemap.xml): Machine-readable index of all pages`,
    `- [Author portfolio](https://biplovgautam.com.np): Biplov Gautam's portfolio site`,
    ""
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
