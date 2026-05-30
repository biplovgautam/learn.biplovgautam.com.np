"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { revalidateTag } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { slugify } from "@/lib/utils";
import type { TipTapContent } from "@/lib/types";

const ADMIN_EMAIL = "madhavbiplov@gmail.com";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) throw new Error("Not authenticated");

  const decoded = await adminAuth.verifySessionCookie(session);
  if (decoded.email !== ADMIN_EMAIL) {
    throw new Error("Not authorized");
  }
  return decoded;
}

// ─── Blog Posts ────────────────────────────────────────

export async function createBlogPost(data: {
  title: string;
  slug?: string;
  excerpt: string;
  content: TipTapContent;
  coverImage: string;
  tags: string[];
  category: string;
  biPoints?: number;
  status?: "draft" | "published";
}) {
  await verifyAdmin();

  const slug = data.slug || slugify(data.title);
  const status = data.status || "draft";
  const docRef = await adminDb.collection("blogPosts").add({
    ...data,
    slug,
    status,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt: status === "published" ? FieldValue.serverTimestamp() : null,
  });

  revalidateTag("blog-posts", "max");
  return docRef.id;
}

export async function updateBlogPost(
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: TipTapContent;
    coverImage?: string;
    tags?: string[];
    category?: string;
    biPoints?: number;
    status?: "draft" | "published";
  }
) {
  await verifyAdmin();

  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (data.status === "published") {
    const doc = await adminDb.collection("blogPosts").doc(id).get();
    if (doc.exists && !doc.data()?.publishedAt) {
      updateData.publishedAt = FieldValue.serverTimestamp();
    }
  }

  await adminDb.collection("blogPosts").doc(id).update(updateData);
  revalidateTag("blog-posts", "max");
}

export async function deleteBlogPost(id: string) {
  await verifyAdmin();
  await adminDb.collection("blogPosts").doc(id).delete();
  revalidateTag("blog-posts", "max");
}

// ─── Tutorials ─────────────────────────────────────────

export async function createTutorial(data: {
  title: string;
  slug?: string;
  excerpt: string;
  content: TipTapContent;
  coverImage: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  biPoints?: number;
  status?: "draft" | "published";
}) {
  await verifyAdmin();

  const slug = data.slug || slugify(data.title);
  const status = data.status || "draft";
  const docRef = await adminDb.collection("tutorials").add({
    ...data,
    slug,
    status,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt: status === "published" ? FieldValue.serverTimestamp() : null,
  });

  revalidateTag("tutorials", "max");
  return docRef.id;
}

export async function updateTutorial(
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: TipTapContent;
    coverImage?: string;
    tags?: string[];
    difficulty?: "beginner" | "intermediate" | "advanced";
    estimatedMinutes?: number;
    biPoints?: number;
    status?: "draft" | "published";
  }
) {
  await verifyAdmin();

  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (data.status === "published") {
    const doc = await adminDb.collection("tutorials").doc(id).get();
    if (doc.exists && !doc.data()?.publishedAt) {
      updateData.publishedAt = FieldValue.serverTimestamp();
    }
  }

  await adminDb.collection("tutorials").doc(id).update(updateData);
  revalidateTag("tutorials", "max");
}

export async function deleteTutorial(id: string) {
  await verifyAdmin();
  await adminDb.collection("tutorials").doc(id).delete();
  revalidateTag("tutorials", "max");
}

// ─── Courses ───────────────────────────────────────────

export async function createCourse(data: {
  title: string;
  slug?: string;
  description: string;
  coverImage: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  estimatedHours: number;
  biPoints?: number;
  authors?: string[];
  status?: "draft" | "published";
}) {
  await verifyAdmin();

  const slug = data.slug || slugify(data.title);
  const status = data.status || "draft";
  const docRef = await adminDb.collection("courses").add({
    ...data,
    slug,
    authors: data.authors ?? [],
    longDescription: null,
    status,
    moduleOrder: [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt: status === "published" ? FieldValue.serverTimestamp() : null,
  });

  revalidateTag("courses", "max");
  return docRef.id;
}

export async function updateCourse(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    longDescription?: TipTapContent | null;
    coverImage?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    tags?: string[];
    estimatedHours?: number;
    biPoints?: number;
    authors?: string[];
    moduleOrder?: string[];
    status?: "draft" | "published";
  }
) {
  await verifyAdmin();

  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (data.status === "published") {
    const doc = await adminDb.collection("courses").doc(id).get();
    if (doc.exists && !doc.data()?.publishedAt) {
      updateData.publishedAt = FieldValue.serverTimestamp();
    }
  }

  await adminDb.collection("courses").doc(id).update(updateData);
  revalidateTag("courses", "max");
}

export async function deleteCourse(id: string) {
  await verifyAdmin();

  const modulesSnap = await adminDb
    .collection("courses")
    .doc(id)
    .collection("modules")
    .get();

  const batch = adminDb.batch();
  for (const mod of modulesSnap.docs) {
    const lessonsSnap = await mod.ref.collection("lessons").get();
    for (const lesson of lessonsSnap.docs) {
      batch.delete(lesson.ref);
    }
    batch.delete(mod.ref);
  }
  batch.delete(adminDb.collection("courses").doc(id));
  await batch.commit();

  revalidateTag("courses", "max");
}

// ─── Modules ───────────────────────────────────────────

export async function createModule(
  courseId: string,
  data: {
    title: string;
    slug?: string;
    description: string;
  }
) {
  await verifyAdmin();

  const slug = data.slug || slugify(data.title);
  const existing = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .count()
    .get();
  const order = existing.data().count;

  const docRef = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .add({
      ...data,
      slug,
      order,
      lessonOrder: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  await adminDb
    .collection("courses")
    .doc(courseId)
    .update({
      moduleOrder: FieldValue.arrayUnion(docRef.id),
      updatedAt: FieldValue.serverTimestamp(),
    });

  revalidateTag("courses", "max");
  return docRef.id;
}

export async function updateModule(
  courseId: string,
  moduleId: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    order?: number;
    lessonOrder?: string[];
  }
) {
  await verifyAdmin();

  await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });

  revalidateTag("courses", "max");
}

export async function deleteModule(courseId: string, moduleId: string) {
  await verifyAdmin();

  const lessonsSnap = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .get();

  const batch = adminDb.batch();
  for (const lesson of lessonsSnap.docs) {
    batch.delete(lesson.ref);
  }
  batch.delete(
    adminDb
      .collection("courses")
      .doc(courseId)
      .collection("modules")
      .doc(moduleId)
  );
  await batch.commit();

  await adminDb
    .collection("courses")
    .doc(courseId)
    .update({
      moduleOrder: FieldValue.arrayRemove(moduleId),
      updatedAt: FieldValue.serverTimestamp(),
    });

  revalidateTag("courses", "max");
}

// ─── Lessons ───────────────────────────────────────────

export async function createLesson(
  courseId: string,
  moduleId: string,
  data: {
    title: string;
    slug?: string;
    content: TipTapContent;
    estimatedMinutes: number;
    biPoints?: number;
  }
) {
  await verifyAdmin();

  const slug = data.slug || slugify(data.title);
  const existing = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .count()
    .get();
  const order = existing.data().count;

  const docRef = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .add({
      ...data,
      slug,
      order,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .update({
      lessonOrder: FieldValue.arrayUnion(docRef.id),
      updatedAt: FieldValue.serverTimestamp(),
    });

  revalidateTag("courses", "max");
  return docRef.id;
}

export async function updateLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  data: {
    title?: string;
    slug?: string;
    content?: TipTapContent;
    estimatedMinutes?: number;
    biPoints?: number;
    order?: number;
  }
) {
  await verifyAdmin();

  await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .doc(lessonId)
    .update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });

  revalidateTag("courses", "max");
}

export async function deleteLesson(
  courseId: string,
  moduleId: string,
  lessonId: string
) {
  await verifyAdmin();

  await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .doc(lessonId)
    .delete();

  await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .update({
      lessonOrder: FieldValue.arrayRemove(lessonId),
      updatedAt: FieldValue.serverTimestamp(),
    });

  revalidateTag("courses", "max");
}

// ─── Reordering ────────────────────────────────────────

/**
 * Move a module up or down. Re-indexes every module's `order` to 0..n
 * (so legacy all-zero orders are normalised) and keeps the course's
 * moduleOrder array in sync.
 */
export async function moveModule(
  courseId: string,
  moduleId: string,
  direction: "up" | "down"
) {
  await verifyAdmin();

  const snap = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .orderBy("order")
    .get();

  const ids = snap.docs.map((d) => d.id);
  const idx = ids.indexOf(moduleId);
  if (idx === -1) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= ids.length) return;

  [ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]];

  const batch = adminDb.batch();
  ids.forEach((id, i) => {
    batch.update(
      adminDb
        .collection("courses")
        .doc(courseId)
        .collection("modules")
        .doc(id),
      { order: i }
    );
  });
  batch.update(adminDb.collection("courses").doc(courseId), {
    moduleOrder: ids,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  revalidateTag("courses", "max");
}

/**
 * Move a lesson up or down within its module. Re-indexes every lesson's
 * `order` to 0..n and keeps the module's lessonOrder array in sync.
 */
export async function moveLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  direction: "up" | "down"
) {
  await verifyAdmin();

  const moduleRef = adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId);

  const snap = await moduleRef.collection("lessons").orderBy("order").get();

  const ids = snap.docs.map((d) => d.id);
  const idx = ids.indexOf(lessonId);
  if (idx === -1) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= ids.length) return;

  [ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]];

  const batch = adminDb.batch();
  ids.forEach((id, i) => {
    batch.update(moduleRef.collection("lessons").doc(id), { order: i });
  });
  batch.update(moduleRef, {
    lessonOrder: ids,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  revalidateTag("courses", "max");
}
