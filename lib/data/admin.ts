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
}) {
  await verifyAdmin();

  const slug = data.slug || slugify(data.title);
  const docRef = await adminDb.collection("blogPosts").add({
    ...data,
    slug,
    status: "draft",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt: null,
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
}) {
  await verifyAdmin();

  const slug = data.slug || slugify(data.title);
  const docRef = await adminDb.collection("tutorials").add({
    ...data,
    slug,
    status: "draft",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt: null,
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
}) {
  await verifyAdmin();

  const slug = data.slug || slugify(data.title);
  const docRef = await adminDb.collection("courses").add({
    ...data,
    slug,
    longDescription: null,
    status: "draft",
    moduleOrder: [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt: null,
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
  const docRef = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .add({
      ...data,
      slug,
      order: 0,
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
  }
) {
  await verifyAdmin();

  const slug = data.slug || slugify(data.title);
  const docRef = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .add({
      ...data,
      slug,
      order: 0,
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
