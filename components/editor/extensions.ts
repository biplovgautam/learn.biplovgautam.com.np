import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

export function getEditorExtensions(placeholder?: string) {
  return [
    StarterKit.configure({
      codeBlock: false,
    }),
    Image.configure({
      HTMLAttributes: {
        class: "rounded-lg max-w-full",
      },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-primary underline",
      },
    }),
    Underline,
    Placeholder.configure({
      placeholder: placeholder || "Start writing...",
    }),
    CodeBlockLowlight.configure({
      lowlight,
    }),
  ];
}

export function getRenderExtensions() {
  return [
    StarterKit.configure({
      codeBlock: false,
    }),
    Image,
    Link,
    Underline,
    CodeBlockLowlight.configure({
      lowlight,
    }),
  ];
}
