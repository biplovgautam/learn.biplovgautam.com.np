"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";

interface ReorderButtonsProps {
  onMove: (direction: "up" | "down") => Promise<void>;
  isFirst: boolean;
  isLast: boolean;
}

export function ReorderButtons({ onMove, isFirst, isLast }: ReorderButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const move = (direction: "up" | "down") =>
    startTransition(async () => {
      await onMove(direction);
      router.refresh();
    });

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => move("up")}
        disabled={isFirst || isPending}
        aria-label="Move up"
        className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronUp size={16} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => move("down")}
        disabled={isLast || isPending}
        aria-label="Move down"
        className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronDown size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
