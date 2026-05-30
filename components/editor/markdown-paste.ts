import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { marked } from "marked";

/**
 * Detects if pasted text looks like markdown.
 * Checks for common markdown patterns: headings, code blocks, lists, bold, links, etc.
 */
function looksLikeMarkdown(text: string): boolean {
  const patterns = [
    /^#{1,6}\s/m, // headings
    /```[\s\S]*?```/m, // fenced code blocks
    /^\s*[-*+]\s/m, // unordered lists
    /^\s*\d+\.\s/m, // ordered lists
    /\*\*[^*]+\*\*/m, // bold
    /\*[^*]+\*/m, // italic
    /\[.+\]\(.+\)/m, // links
    /^>\s/m, // blockquotes
    /^---$/m, // horizontal rules
    /`[^`]+`/m, // inline code
    /!\[.*\]\(.*\)/m, // images
  ];

  let matchCount = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) matchCount++;
  }

  // Need at least 2 markdown patterns to be confident
  return matchCount >= 2;
}

/**
 * Converts markdown text to HTML using marked.
 */
function markdownToHtml(md: string): string {
  // Configure marked for clean output
  const result = marked.parse(md, {
    gfm: true,
    breaks: false,
  });

  // marked.parse can return string or Promise<string>
  // In synchronous mode it returns string
  return result as string;
}

export const MarkdownPaste = Extension.create({
  name: "markdownPaste",

  addProseMirrorPlugins() {
    const { editor } = this;

    return [
      new Plugin({
        key: new PluginKey("markdownPaste"),
        props: {
          handlePaste(view, event) {
            const clipboardData = event.clipboardData;
            if (!clipboardData) return false;

            // If there's HTML content, let TipTap handle it normally
            const html = clipboardData.getData("text/html");
            if (html && html.trim().length > 0) return false;

            const text = clipboardData.getData("text/plain");
            if (!text || !looksLikeMarkdown(text)) return false;

            // Convert markdown to HTML
            const convertedHtml = markdownToHtml(text);
            if (!convertedHtml) return false;

            // Prevent default paste
            event.preventDefault();

            // Insert the converted HTML content
            editor.commands.insertContent(convertedHtml, {
              parseOptions: {
                preserveWhitespace: false,
              },
            });

            return true;
          },
        },
      }),
    ];
  },
});
