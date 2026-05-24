"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { signOut } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Overview", href: "/profile/overview" },
  { label: "Progress", href: "/profile/progress" },
  { label: "Saved", href: "/profile/saved" },
  { label: "Settings", href: "/profile/settings" },
];

export function ProfileShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="animate-pulse">
          <div className="h-32 rounded-3xl bg-muted/40" />
        </div>
      </div>
    );
  }

  if (!user) {
    // Server gate already handles this, but just in case
    return null;
  }

  const firstName = user.displayName?.split(" ")[0] || "You";

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Profile header card */}
      <div className="rounded-3xl border border-border bg-muted/20 p-6 md:p-8 mb-6">
        <div className="flex items-center gap-5 flex-wrap">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || "Profile"}
              width={72}
              height={72}
              className="rounded-full ring-2 ring-primary/40"
            />
          ) : (
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
              {firstName.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <p className="label-mono mb-1">Signed in</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {user.displayName || firstName}
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-full border border-border bg-muted/30 p-1 inline-flex flex-wrap mb-8">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition-colors",
                active
                  ? "bg-background text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Tab content */}
      <div>{children}</div>
    </div>
  );
}
