"use client";

import { Check, CloudOff, Loader2, Pencil } from "lucide-react";
import type { SaveStatus } from "./use-autosave";

export function SaveStatusBadge({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  const map = {
    unsaved: {
      icon: <Pencil size={13} strokeWidth={2} />,
      text: "Unsaved changes",
      cls: "text-muted-foreground",
    },
    saving: {
      icon: <Loader2 size={13} strokeWidth={2} className="animate-spin" />,
      text: "Saving…",
      cls: "text-muted-foreground",
    },
    saved: {
      icon: <Check size={13} strokeWidth={2} />,
      text: "Saved",
      cls: "text-primary",
    },
    error: {
      icon: <CloudOff size={13} strokeWidth={2} />,
      text: "Autosave failed",
      cls: "text-destructive",
    },
  } as const;

  const { icon, text, cls } = map[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${cls}`}>
      {icon}
      {text}
    </span>
  );
}
