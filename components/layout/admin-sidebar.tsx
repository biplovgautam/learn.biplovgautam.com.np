"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Blog Posts", href: "/admin/blog" },
  { label: "Tutorials", href: "/admin/tutorials" },
  { label: "Courses", href: "/admin/courses" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <aside className="w-64 border-r border-border bg-muted/50 flex flex-col">
      <div className="p-5 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="BiLearnHub"
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="text-base font-semibold tracking-tight">
            BiLearnHub
          </span>
        </Link>
        <p className="label-mono mt-2">Admin</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        {user && (
          <p className="text-xs text-muted-foreground mb-2 truncate">
            {user.email}
          </p>
        )}
        <button
          onClick={handleSignOut}
          className="w-full rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors text-left"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
