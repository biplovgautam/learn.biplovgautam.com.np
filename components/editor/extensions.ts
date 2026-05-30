import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { MarkdownPaste } from "./markdown-paste";

const lowlight = createLowlight(common);

// StarterKit v3 already bundles Link and Underline, so we configure
// them through StarterKit instead of registering separate extensions
// (registering them twice triggers "Duplicate extension names" warnings).
const linkConfig = {
  openOnClick: false,
  HTMLAttributes: {
    class: "text-primary underline",
  },
};

export function getEditorExtensions(placeholder?: string) {
  return [
    StarterKit.configure({
      codeBlock: false,
      link: linkConfig,
    }),
    Image.configure({
      HTMLAttributes: {
        class: "rounded-lg max-w-full",
      },
    }),
    Placeholder.configure({
      placeholder: placeholder || "Start writing...",
    }),
    CodeBlockLowlight.configure({
      lowlight,
    }),
    MarkdownPaste,
  ];
}

export function getRenderExtensions() {
  return [
    StarterKit.configure({
      codeBlock: false,
      link: linkConfig,
    }),
    Image,
    CodeBlockLowlight.configure({
      lowlight,
    }),
  ];
}
