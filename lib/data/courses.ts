import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import {
  adminDb,
  isFirebaseAdminConfigured,
  safeRead,
} from "@/lib/firebase/admin";
import { serialize } from "@/lib/utils";
import type { Course, Module, Lesson } from "@/lib/types";

export async function getCourses(): Promise<Course[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("courses");

  if (!isFirebaseAdminConfigured()) return [];

  return safeRead(async () => {
    const snapshot = await adminDb
      .collection("courses")
      .where("status", "==", "published")
      .orderBy("publishedAt", "desc")
      .get();

    return snapshot.docs.map(
      (doc) => serialize({ id: doc.id, ...doc.data() }) as Course
    );
  }, []);
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`course-${slug}`, "courses");

  if (!isFirebaseAdminConfigured()) return null;

  return safeRead(async () => {
    const snapshot = await adminDb
      .collection("courses")
      .where("slug", "==", slug)
      .where("status", "==", "published")
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return serialize({
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    }) as Course;
  }, null);
}

export async function getCourseById(id: string): Promise<Course | null> {
  await connection();
  if (!isFirebaseAdminConfigured()) return null;
  const doc = await adminDb.collection("courses").doc(id).get();
  if (!doc.exists) return null;
  return serialize({ id: doc.id, ...doc.data() }) as Course;
}

export async function getAllCourses(): Promise<Course[]> {
  await connection();
  if (!isFirebaseAdminConfigured()) return [];
  const snapshot = await adminDb
    .collection("courses")
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map(
    (doc) => serialize({ id: doc.id, ...doc.data() }) as Course
  );
}

export async function getModules(courseId: string): Promise<Module[]> {
  await connection();
  if (!isFirebaseAdminConfigured()) return [];
  const snapshot = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .orderBy("order")
    .get();

  return snapshot.docs.map(
    (doc) => serialize({ id: doc.id, ...doc.data() }) as Module
  );
}

export async function getModuleById(
  courseId: string,
  moduleId: string
): Promise<Module | null> {
  await connection();
  if (!isFirebaseAdminConfigured()) return null;
  const doc = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .get();
  if (!doc.exists) return null;
  return serialize({ id: doc.id, ...doc.data() }) as Module;
}

export async function getModuleBySlug(
  courseId: string,
  moduleSlug: string
): Promise<Module | null> {
  await connection();
  if (!isFirebaseAdminConfigured()) return null;
  const snapshot = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .where("slug", "==", moduleSlug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return serialize({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() }) as Module;
}

export async function getLessons(
  courseId: string,
  moduleId: string
): Promise<Lesson[]> {
  await connection();
  if (!isFirebaseAdminConfigured()) return [];
  const snapshot = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .orderBy("order")
    .get();

  return snapshot.docs.map(
    (doc) => serialize({ id: doc.id, ...doc.data() }) as Lesson
  );
}

export async function getLessonBySlug(
  courseId: string,
  moduleId: string,
  lessonSlug: string
): Promise<Lesson | null> {
  await connection();
  if (!isFirebaseAdminConfigured()) return null;
  const snapshot = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .where("slug", "==", lessonSlug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return serialize({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() }) as Lesson;
}

export async function getLessonById(
  courseId: string,
  moduleId: string,
  lessonId: string
): Promise<Lesson | null> {
  await connection();
  if (!isFirebaseAdminConfigured()) return null;
  const doc = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .doc(moduleId)
    .collection("lessons")
    .doc(lessonId)
    .get();

  if (!doc.exists) return null;
  return serialize({ id: doc.id, ...doc.data() }) as Lesson;
}

export interface CourseStructure {
  course: Course;
  modules: (Module & { lessons: Lesson[] })[];
}

export async function getCourseStructure(
  courseSlug: string
): Promise<CourseStructure | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`course-${courseSlug}`, "courses");

  if (!isFirebaseAdminConfigured()) return null;

  const course = await getCourseBySlug(courseSlug);
  if (!course) return null;

  return safeRead(async () => {
    const modulesSnap = await adminDb
      .collection("courses")
      .doc(course.id)
      .collection("modules")
      .orderBy("order")
      .get();

    const modules = await Promise.all(
      modulesSnap.docs.map(async (modDoc) => {
        const mod = serialize({ id: modDoc.id, ...modDoc.data() }) as Module;
        const lessonsSnap = await modDoc.ref
          .collection("lessons")
          .orderBy("order")
          .get();
        const lessons = lessonsSnap.docs.map(
          (lesDoc) => serialize({ id: lesDoc.id, ...lesDoc.data() }) as Lesson
        );
        return { ...mod, lessons };
      })
    );

    return { course, modules };
  }, { course, modules: [] });
}
