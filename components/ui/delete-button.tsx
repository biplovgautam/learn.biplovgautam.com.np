"use client";

import { useState, useTransition } from "react";

interface DeleteButtonProps {
  action: () => Promise<void>;
  label?: string;
}

export function DeleteButton({ action, label = "Delete" }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            startTransition(async () => {
              await action();
              setConfirming(false);
            });
          }}
          disabled={isPending}
          className="rounded-md px-3 py-1.5 text-sm bg-destructive text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md px-3 py-1.5 text-sm text-destructive border border-border hover:bg-destructive/10 transition-colors"
    >
      {label}
    </button>
  );
}
