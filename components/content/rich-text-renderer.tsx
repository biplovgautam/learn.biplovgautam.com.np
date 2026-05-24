import { generateHTML } from "@tiptap/html";
import { getRenderExtensions } from "@/components/editor/extensions";
import type { TipTapContent } from "@/lib/types";

interface RichTextRendererProps {
  content: TipTapContent;
}

export function RichTextRenderer({ content }: RichTextRendererProps) {
  const html = generateHTML(content, getRenderExtensions());

  return (
    <div
      className="prose prose-lg max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-pre:border-border"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
