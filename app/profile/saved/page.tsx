import Link from "next/link";
import { Bookmark } from "lucide-react";
import { ProfileShell } from "@/components/profile/profile-shell";

export default function SavedPage() {
  return (
    <ProfileShell>
      <div className="rounded-3xl border border-border bg-muted/20 p-12 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-4">
          <Bookmark size={24} strokeWidth={1.8} />
        </span>
        <h2 className="text-xl font-semibold mb-2">Nothing saved yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Bookmark articles, tutorials, or lessons to find them quickly later.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Explore content &#8594;
        </Link>
      </div>
    </ProfileShell>
  );
}
