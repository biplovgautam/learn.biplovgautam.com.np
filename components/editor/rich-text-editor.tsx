"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { getEditorExtensions } from "./extensions";
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

  const editor = useEditor({
    extensions: getEditorExtensions(placeholder),
    content: content || undefined,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TipTapContent);
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

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <Toolbar editor={editor} onImageUpload={handleImageUpload} />
      {uploading && (
        <div className="px-4 py-2 bg-muted/50 text-sm text-muted-foreground border-b border-border">
          Uploading image...
        </div>
      )}
      <EditorContent editor={editor} />
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
