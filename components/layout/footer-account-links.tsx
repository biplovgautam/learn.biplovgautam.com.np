"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { signOut } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

export function FooterAccountLinks() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <ul className="space-y-3 text-sm">
        <li className="h-4 w-20 bg-muted rounded animate-pulse" />
        <li className="h-4 w-24 bg-muted rounded animate-pulse" />
      </ul>
    );
  }

  if (user) {
    return (
      <ul className="space-y-3 text-sm">
        <li>
          <Link
            href="/dash"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/dash/leaderboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Leaderboard
          </Link>
        </li>
        <li>
          <Link
            href="/profile"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Profile
          </Link>
        </li>
        <li>
          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-destructive transition-colors text-left"
          >
            Sign out
          </button>
        </li>
      </ul>
    );
  }

  return (
    <ul className="space-y-3 text-sm">
      <li>
        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign in
        </Link>
      </li>
      <li>
        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Create profile
        </Link>
      </li>
      <li>
        <Link
          href="/courses"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Browse courses
        </Link>
      </li>
    </ul>
  );
}
