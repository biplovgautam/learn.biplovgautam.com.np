"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithGoogle } from "@/lib/firebase/auth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/profile";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-12 group">
          <Image
            src="/logo.png"
            alt="BiLearnHub"
            width={36}
            height={36}
            className="rounded-md"
          />
          <span className="text-base font-semibold tracking-tight">
            BiLearnHub
          </span>
        </Link>

        <div className="rounded-3xl border border-border bg-muted/20 p-8 md:p-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground mb-8 text-sm">
            Sign in to track your progress across courses, tutorials, and saved
            articles.
          </p>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {!loading && (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#000"
                  d="M21.35 11.1H12v3.2h5.35c-.23 1.46-1.7 4.3-5.35 4.3-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.74 3.94 14.6 3 12 3 6.99 3 3 6.99 3 12s3.99 9 9 9c5.2 0 8.65-3.65 8.65-8.8 0-.59-.07-1.03-.16-1.5z"
                />
              </svg>
            )}
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By signing in, you agree to our terms. We only store what&apos;s
            needed to track your progress.
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            &#8592; Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginContent />
    </Suspense>
  );
}
