"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/html";
import { getEditorExtensions, getRenderExtensions } from "./extensions";
import { Toolbar } from "./toolbar";
import type { TipTapContent } from "@/lib/types";

interface RichTextEditorProps {
  content?: TipTapContent | null;
  onChange: (content: TipTapContent) => void;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [currentContent, setCurrentContent] = useState<TipTapContent | null>(
    content || null
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: getEditorExtensions(placeholder),
    content: content || undefined,
    onUpdate: ({ editor }) => {
      // Deep-clone to a pure plain object. TipTap's getJSON can carry
      // non-serializable refs that break the React Server Action boundary
      // ("Cannot access toString on the server ... temporary client reference").
      const json = JSON.parse(JSON.stringify(editor.getJSON())) as TipTapContent;
      setCurrentContent(json);
      onChange(json);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none p-4 min-h-[400px] focus:outline-none dark:prose-invert",
      },
    },
  });

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Maximum 10MB.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const previewHtml =
    preview && currentContent
      ? generateHTML(currentContent, getRenderExtensions())
      : "";

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      {/* Mode toggle tabs */}
      <div className="flex items-center border-b border-border">
        <button
          type="button"
          onClick={() => setPreview(false)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            !preview
              ? "text-primary border-b-2 border-primary bg-muted/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            preview
              ? "text-primary border-b-2 border-primary bg-muted/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Preview
        </button>
        <span className="ml-auto pr-3 text-xs text-muted-foreground">
          Supports markdown paste
        </span>
      </div>

      {!preview ? (
        <>
          <Toolbar editor={editor} onImageUpload={handleImageUpload} />
          {uploading && (
            <div className="px-4 py-2 bg-muted/50 text-sm text-muted-foreground border-b border-border">
              Uploading image...
            </div>
          )}
          <EditorContent editor={editor} />
        </>
      ) : (
        <div className="p-6 min-h-[400px]">
          {previewHtml ? (
            <div
              className="prose prose-lg max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-pre:border-border"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <p className="text-muted-foreground text-center py-12">
              Nothing to preview yet. Start writing first.
            </p>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        className="hidden"
      />
    </div>
  );
}
