import { cacheLife, cacheTag } from "next/cache";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import type { Tutorial } from "@/lib/types";

export async function getTutorials(): Promise<Tutorial[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("tutorials");

  if (!isFirebaseAdminConfigured()) return [];

  const snapshot = await adminDb
    .collection("tutorials")
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .get();

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Tutorial
  );
}

export async function getTutorialBySlug(
  slug: string
): Promise<Tutorial | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`tutorial-${slug}`, "tutorials");

  if (!isFirebaseAdminConfigured()) return null;

  const snapshot = await adminDb
    .collection("tutorials")
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Tutorial;
}

export async function getTutorialById(id: string): Promise<Tutorial | null> {
  if (!isFirebaseAdminConfigured()) return null;
  const doc = await adminDb.collection("tutorials").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Tutorial;
}

export async function getAllTutorials(): Promise<Tutorial[]> {
  if (!isFirebaseAdminConfigured()) return [];
  const snapshot = await adminDb
    .collection("tutorials")
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Tutorial
  );
}
