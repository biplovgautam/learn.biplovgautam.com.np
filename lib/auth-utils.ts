import { cookies } from "next/headers";
import { adminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

const ADMIN_EMAIL = "madhavbiplov@gmail.com";

/**
 * Verifies any signed-in user. Returns decoded token or null.
 */
export async function verifySession() {
  if (!isFirebaseAdminConfigured()) return null;

  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) return null;

  try {
    return await adminAuth.verifySessionCookie(session);
  } catch {
    return null;
  }
}

/**
 * Verifies admin user specifically. Returns decoded token or null
 * if not signed in or not the admin email.
 */
export async function verifyAdminSession() {
  const decoded = await verifySession();
  if (!decoded) return null;
  if (decoded.email !== ADMIN_EMAIL) return null;
  return decoded;
}

export function isAdminEmail(email: string | undefined | null): boolean {
  return email === ADMIN_EMAIL;
}
