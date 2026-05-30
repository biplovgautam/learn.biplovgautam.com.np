import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Wrench } from "lucide-react";
import { getAllTutorials } from "@/lib/data/tutorials";
import { formatDate } from "@/lib/utils";
import { deleteTutorial } from "@/lib/data/admin";
import { DeleteButton } from "@/components/ui/delete-button";

export const metadata: Metadata = {
  title: "Manage Tutorials",
};

async function TutorialList() {
  const tutorials = await getAllTutorials();

  if (tutorials.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        No tutorials yet. Create your first one!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tutorials.map((tutorial) => (
        <div
          key={tutorial.id}
          className="flex items-center gap-4 rounded-lg border border-border p-4"
        >
          <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            {tutorial.coverImage ? (
              <Image
                src={tutorial.coverImage}
                alt={tutorial.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Wrench size={18} strokeWidth={1.6} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/admin/tutorials/${tutorial.id}`}
              className="font-medium hover:text-primary truncate block"
            >
              {tutorial.title}
            </Link>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span
                className={
                  tutorial.status === "published"
                    ? "text-success"
                    : "text-muted-foreground"
                }
              >
                {tutorial.status}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {tutorial.difficulty}
              </span>
              {tutorial.estimatedMinutes && (
                <span>{tutorial.estimatedMinutes}</span>
              )}
              {tutorial.updatedAt && (
                <span>{formatDate(tutorial.updatedAt)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Link
              href={`/admin/tutorials/${tutorial.id}`}
              className="rounded-md px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors"
            >
              Edit
            </Link>
            <DeleteButton
              action={deleteTutorial.bind(null, tutorial.id)}
              label="Delete"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminTutorialsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Tutorials</h1>
        <Link
          href="/admin/tutorials/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          New Tutorial
        </Link>
      </div>
      <Suspense
        fallback={<p className="text-muted-foreground">Loading tutorials...</p>}
      >
        <TutorialList />
      </Suspense>
    </div>
  );
}
