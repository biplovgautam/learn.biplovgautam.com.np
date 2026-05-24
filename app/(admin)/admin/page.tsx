import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const contentTypes = [
  {
    title: "Blog Posts",
    description: "Write and manage blog articles",
    href: "/admin/blog",
    count: "—",
  },
  {
    title: "Tutorials",
    description: "Create standalone tutorials",
    href: "/admin/tutorials",
    count: "—",
  },
  {
    title: "Courses",
    description: "Build structured courses with modules and lessons",
    href: "/admin/courses",
    count: "—",
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contentTypes.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg border border-border bg-background p-6 transition-colors hover:border-primary hover:bg-muted"
          >
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
            <p className="text-muted-foreground text-sm">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
