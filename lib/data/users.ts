import { connection } from "next/server";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { serialize } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  await connection();
  if (!isFirebaseAdminConfigured()) return null;

  const doc = await adminDb.collection("users").doc(uid).get();
  if (!doc.exists) return null;

  return serialize({ ...doc.data() }) as UserProfile;
}

/**
 * Top users ranked by bi points (leaderboard).
 */
export async function getLeaderboard(limit = 50): Promise<UserProfile[]> {
  await connection();
  if (!isFirebaseAdminConfigured()) return [];

  const snapshot = await adminDb
    .collection("users")
    .orderBy("biPoints", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map(
    (doc) => serialize({ ...doc.data() }) as UserProfile
  );
}
