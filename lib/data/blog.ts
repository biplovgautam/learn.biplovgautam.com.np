import { cacheLife, cacheTag } from "next/cache";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import type { BlogPost } from "@/lib/types";

export async function getBlogPosts(): Promise<BlogPost[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("blog-posts");

  if (!isFirebaseAdminConfigured()) return [];

  const snapshot = await adminDb
    .collection("blogPosts")
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .get();

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as BlogPost
  );
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`blog-post-${slug}`, "blog-posts");

  if (!isFirebaseAdminConfigured()) return null;

  const snapshot = await adminDb
    .collection("blogPosts")
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BlogPost;
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  if (!isFirebaseAdminConfigured()) return null;
  const doc = await adminDb.collection("blogPosts").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as BlogPost;
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  if (!isFirebaseAdminConfigured()) return [];
  const snapshot = await adminDb
    .collection("blogPosts")
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as BlogPost
  );
}

export async function getAllBlogSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("blog-posts");

  if (!isFirebaseAdminConfigured()) return [];

  const snapshot = await adminDb
    .collection("blogPosts")
    .where("status", "==", "published")
    .select("slug")
    .get();

  return snapshot.docs.map((doc) => doc.data().slug);
}
