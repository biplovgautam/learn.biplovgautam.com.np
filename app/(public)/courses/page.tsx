import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCourses } from "@/lib/data/courses";
import { ContentSidebar } from "@/components/layout/content-sidebar";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Structured courses on ROS 2, robotics, and software engineering.",
};

const difficultyColors = {
  beginner: "bg-primary/15 text-primary",
  intermediate: "bg-yellow-500/15 text-yellow-400",
  advanced: "bg-red-500/15 text-red-400",
};

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="label-mono mb-3">Catalog</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          Courses
        </h1>
        <p className="text-muted-foreground text-lg">
          Step-by-step structured courses to master new skills.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <ContentSidebar type="courses" />

        <div className="flex-1 min-w-0">
          {courses.length === 0 ? (
            <div className="rounded-3xl border border-border bg-muted/20 p-12 text-center">
              <p className="text-muted-foreground">
                No courses published yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="group block rounded-2xl border border-border bg-muted/20 overflow-hidden hover:bg-muted/40 hover:border-primary/40 transition-colors"
                >
                  {course.coverImage && (
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Image
                        src={course.coverImage}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColors[course.difficulty]}`}
                      >
                        {course.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {course.estimatedHours}h
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
