"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

const ADMIN_EMAIL = "madhavbiplov@gmail.com";

const publicNavLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Tutorials", href: "/tutorials" },
  { label: "Blog", href: "/blog" },
];

const dashNavLinks = [
  { label: "Dashboard", href: "/dash" },
  { label: "Courses", href: "/dash/courses" },
  { label: "Tutorials", href: "/dash/tutorials" },
  { label: "Blog", href: "/dash/blog" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  const firstName = user?.displayName?.split(" ")[0] || "You";
  const navLinks = user ? dashNavLinks : publicNavLinks;
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <header className="bg-background/80 backdrop-blur sticky top-0 z-50 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="BiLearnHub"
            width={32}
            height={32}
            className="rounded-md"
            priority
          />
          <span className="text-base font-semibold tracking-tight">
            BiLearnHub
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-full border border-border bg-muted/30 p-1">
          {navLinks.map((link) => {
            const active =
              link.href === "/dash"
                ? pathname === "/dash"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA — Admin (if admin) + Profile/Track progress */}
        <div className="hidden md:flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary px-3.5 py-1.5 text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Shield size={14} strokeWidth={2} />
              Admin
            </Link>
          )}

          {loading ? (
            <div className="h-8 w-32 rounded-full bg-muted/40 animate-pulse" />
          ) : user ? (
            <Link
              href="/profile"
              className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-muted/30 pl-4 pr-1.5 py-1 text-sm hover:bg-muted/60 transition-colors"
            >
              <span className="font-medium">{firstName}</span>
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || "Profile"}
                  width={28}
                  height={28}
                  className="rounded-full ring-1 ring-border"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Track progress <span aria-hidden>&#8594;</span>
            </Link>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-muted-foreground"
          aria-label="Toggle menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {menuOpen ? (
              <path d="M5 5l10 10M15 5l-10 10" />
            ) : (
              <path d="M3 5h14M3 10h14M3 15h14" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-border px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2 text-sm",
                pathname.startsWith(link.href)
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border mt-2 space-y-1">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-primary/10"
              >
                <Shield size={14} strokeWidth={2} />
                Admin Panel
              </Link>
            )}
            {user ? (
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50"
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "Profile"}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-sm font-medium">{firstName}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-full bg-primary text-primary-foreground text-sm font-medium text-center py-2"
              >
                Track progress
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
