"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface PublishButtonProps {
  action: () => Promise<void>;
  isPublished: boolean;
}

export function PublishButton({ action, isPublished }: PublishButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await action();
          router.refresh();
        })
      }
      disabled={isPending}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        isPublished
          ? "border border-border hover:bg-muted text-muted-foreground"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      }`}
    >
      {isPending
        ? isPublished
          ? "Unpublishing..."
          : "Publishing..."
        : isPublished
          ? "Unpublish"
          : "Publish"}
    </button>
  );
}
