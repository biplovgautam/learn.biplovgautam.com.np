import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "__session";
const SESSION_EXPIRY = 60 * 60 * 24 * 5 * 1000; // 5 days
const ADMIN_EMAIL = "madhavbiplov@gmail.com";

export async function POST(request: Request) {
  const { idToken } = await request.json();

  if (!idToken) {
    return Response.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    // Verify token — any signed-in Google user is allowed
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Save / upsert user profile to Firestore
    const userRef = adminDb.collection("users").doc(decoded.uid);
    const existing = await userRef.get();

    const displayName = decoded.name || decoded.email?.split("@")[0] || "User";
    const firstName = displayName.split(" ")[0];

    const profileData = {
      uid: decoded.uid,
      email: decoded.email || "",
      displayName,
      firstName,
      photoURL: decoded.picture || "",
      lastLoginAt: FieldValue.serverTimestamp(),
      role: decoded.email === ADMIN_EMAIL ? "admin" : "user",
    };

    if (existing.exists) {
      await userRef.update(profileData);
    } else {
      await userRef.set({
        ...profileData,
        createdAt: FieldValue.serverTimestamp(),
        biPoints: 0,
        streak: 0,
        lastActiveDate: null,
        level: 1,
      });
    }

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRY,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_EXPIRY / 1000,
      path: "/",
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Auth error:", err);
    const message = err instanceof Error ? err.message : String(err);
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: unknown }).code)
        : undefined;
    // Temporary: surface the real cause to diagnose the 401 in production.
    return Response.json(
      { error: "Invalid token", detail: message, code },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return Response.json({ success: true });
}
