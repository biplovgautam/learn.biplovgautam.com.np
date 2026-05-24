import Link from "next/link";
import Image from "next/image";
import { Zap, ArrowRight } from "lucide-react";
import { getCourses } from "@/lib/data/courses";

export default async function DashCoursesPage() {
  const courses = await getCourses();

  return (
    <div className="space-y-6">
      <div>
        <p className="label-mono mb-2">Your courses</p>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Continue your courses
        </h2>
        <p className="text-muted-foreground text-sm">
          Pick up where you left off. Earn Bi Points for every lesson.
        </p>
      </div>

      {/* Empty state — no enrolled courses yet */}
      <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center">
        <p className="text-muted-foreground mb-1 text-sm">
          You haven&apos;t enrolled in any courses yet.
        </p>
        <p className="text-xs text-muted-foreground">
          Pick one below to start your first.
        </p>
      </div>

      <div>
        <p className="label-mono mb-3">All courses</p>
        {courses.length === 0 ? (
          <div className="rounded-3xl border border-border bg-muted/20 p-12 text-center">
            <p className="text-muted-foreground">
              No courses published yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
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
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      {course.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {course.estimatedHours}h
                    </span>
                    {course.biPoints > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-primary">
                        <Zap size={12} strokeWidth={2} />
                        {course.biPoints} pts
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {course.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    View course <ArrowRight size={12} strokeWidth={2} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
