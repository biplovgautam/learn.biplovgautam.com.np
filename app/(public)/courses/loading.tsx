export default function CoursesLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="animate-pulse">
        <div className="h-10 bg-muted rounded w-40 mb-2" />
        <div className="h-5 bg-muted rounded w-72 mb-10" />
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-border p-5 space-y-3">
              <div className="aspect-video bg-muted rounded" />
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
