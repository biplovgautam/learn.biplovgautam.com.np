import { connection } from "next/server";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import type { UserProfile } from "@/lib/types";

export interface AdminStats {
  users: {
    total: number;
    newThisWeek: number;
    activeThisWeek: number;
  };
  content: {
    courses: { total: number; published: number; drafts: number };
    tutorials: { total: number; published: number; drafts: number };
    blogPosts: { total: number; published: number; drafts: number };
  };
  points: {
    totalAwarded: number;
    avgPerUser: number;
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  await connection();
  const empty: AdminStats = {
    users: { total: 0, newThisWeek: 0, activeThisWeek: 0 },
    content: {
      courses: { total: 0, published: 0, drafts: 0 },
      tutorials: { total: 0, published: 0, drafts: 0 },
      blogPosts: { total: 0, published: 0, drafts: 0 },
    },
    points: { totalAwarded: 0, avgPerUser: 0 },
  };

  if (!isFirebaseAdminConfigured()) return empty;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [usersSnap, coursesSnap, tutorialsSnap, blogSnap] = await Promise.all([
    adminDb.collection("users").get(),
    adminDb.collection("courses").get(),
    adminDb.collection("tutorials").get(),
    adminDb.collection("blogPosts").get(),
  ]);

  // Users
  let newThisWeek = 0;
  let activeThisWeek = 0;
  let totalPoints = 0;

  usersSnap.docs.forEach((doc) => {
    const u = doc.data() as UserProfile;
    totalPoints += u.biPoints || 0;

    const createdAtMs = (u.createdAt as unknown as { toMillis?: () => number })?.toMillis?.() ?? 0;
    if (createdAtMs > weekAgo.getTime()) newThisWeek++;

    const lastLoginMs = (u.lastLoginAt as unknown as { toMillis?: () => number })?.toMillis?.() ?? 0;
    if (lastLoginMs > weekAgo.getTime()) activeThisWeek++;
  });

  const countByStatus = (docs: FirebaseFirestore.QueryDocumentSnapshot[]) => {
    let published = 0;
    let drafts = 0;
    docs.forEach((d) => {
      const s = d.data().status;
      if (s === "published") published++;
      else drafts++;
    });
    return { total: docs.length, published, drafts };
  };

  return {
    users: {
      total: usersSnap.size,
      newThisWeek,
      activeThisWeek,
    },
    content: {
      courses: countByStatus(coursesSnap.docs),
      tutorials: countByStatus(tutorialsSnap.docs),
      blogPosts: countByStatus(blogSnap.docs),
    },
    points: {
      totalAwarded: totalPoints,
      avgPerUser: usersSnap.size > 0 ? Math.round(totalPoints / usersSnap.size) : 0,
    },
  };
}

export interface RecentUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  biPoints: number;
  joinedMs: number;
}

export async function getRecentUsers(limit = 8): Promise<RecentUser[]> {
  await connection();
  if (!isFirebaseAdminConfigured()) return [];

  const snap = await adminDb
    .collection("users")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((doc) => {
    const u = doc.data() as UserProfile;
    return {
      uid: u.uid,
      displayName: u.displayName || u.firstName || "User",
      email: u.email,
      photoURL: u.photoURL || "",
      biPoints: u.biPoints || 0,
      joinedMs:
        (u.createdAt as unknown as { toMillis?: () => number })?.toMillis?.() ?? 0,
    };
  });
}
