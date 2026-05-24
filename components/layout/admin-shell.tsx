"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AdminSidebar } from "./admin-sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-background/95 backdrop-blur border-b border-border flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="BiLearnHub"
            width={26}
            height={26}
            className="rounded"
          />
          <span className="text-sm font-semibold">BiLearnHub Admin</span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 text-muted-foreground hover:text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar — drawer on mobile, fixed on desktop */}
      <div
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky top-0 left-0 z-30 h-screen w-64 transition-transform`}
        onClick={() => setOpen(false)}
      >
        <AdminSidebar />
      </div>

      {/* Backdrop on mobile */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 p-4 lg:p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
