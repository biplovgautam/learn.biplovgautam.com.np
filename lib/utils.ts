export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDate(
  date: string | number | Date | { toDate(): Date }
): string {
  let d: Date;
  if (typeof date === "string" || typeof date === "number") {
    d = new Date(date);
  } else if ("toDate" in date) {
    d = date.toDate();
  } else {
    d = date;
  }
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Deep-convert Firestore Timestamp instances (and admin SDK
 * { _seconds, _nanoseconds } shapes) into ISO strings so the data
 * can cross the Server -> Client Component boundary safely.
 */
function isTimestampLike(v: unknown): boolean {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.toDate === "function" ||
    typeof o._seconds === "number" ||
    (typeof o.seconds === "number" && typeof o.nanoseconds === "number")
  );
}

function timestampToISO(v: unknown): string {
  const o = v as {
    toDate?: () => Date;
    _seconds?: number;
    seconds?: number;
  };
  if (typeof o.toDate === "function") return o.toDate().toISOString();
  const sec = o._seconds ?? o.seconds ?? 0;
  return new Date(sec * 1000).toISOString();
}

export function serialize<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.map((item) => serialize(item)) as unknown as T;
  }
  if (typeof data === "object") {
    if (isTimestampLike(data)) return timestampToISO(data) as unknown as T;
    const out: Record<string, unknown> = {};
    for (const key in data as Record<string, unknown>) {
      out[key] = serialize((data as Record<string, unknown>)[key]);
    }
    return out as T;
  }
  return data;
}

export function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
