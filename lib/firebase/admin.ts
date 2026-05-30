import {
  initializeApp,
  getApps,
  cert,
  applicationDefault,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _app: App | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function isFirebaseAdminConfigured(): boolean {
  const hasProjectId = !!process.env.FIREBASE_ADMIN_PROJECT_ID;
  const hasServiceAccount = !!(
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim() &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim()
  );

  // Without a service account key, we rely on ADC (gcloud auth).
  // ADC is only available at runtime, not during build.
  // Detect build: NEXT_PHASE is set during build, or we can check if we have
  // neither service account nor ADC file.
  if (!hasServiceAccount) {
    // If GOOGLE_APPLICATION_CREDENTIALS env is not set AND the default ADC
    // file likely doesn't exist in build environments, be conservative.
    // At runtime (dev/prod server), ADC works fine via gcloud auth.
    const isBuild = process.env.NEXT_PHASE === "phase-production-build" ||
      process.env.NEXT_PHASE === "phase-production-server";

    if (isBuild) return false;
  }

  return hasProjectId;
}

/**
 * Normalizes a service-account private key pulled from an env var.
 * Handles the two ways the key commonly gets mangled:
 *  - wrapped in surrounding double/single quotes (copied from JSON)
 *  - escaped "\n" sequences instead of real newlines
 * Without this you get: error:1E08010C:DECODER routines::unsupported
 */
function normalizePrivateKey(raw?: string): string | undefined {
  if (!raw) return undefined;
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  // Convert literal backslash-n into real newlines (no-op if already real).
  key = key.replace(/\\n/g, "\n");
  return key;
}

function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length) {
    _app = getApps()[0];
    return _app;
  }

  // If private key is available, use service account cert
  // Otherwise fall back to Application Default Credentials (ADC)
  const privateKey = normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const hasServiceAccount = !!(clientEmail && privateKey);

  if (hasServiceAccount) {
    _app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Uses gcloud auth application-default login locally
    // Uses service account automatically on GCP/Vercel with GOOGLE_APPLICATION_CREDENTIALS
    _app = initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    });
  }

  return _app;
}

export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_, prop) {
    if (!_auth) _auth = getAuth(getAdminApp());
    return Reflect.get(_auth, prop);
  },
});

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_, prop) {
    if (!_db) _db = getFirestore(getAdminApp());
    return Reflect.get(_db, prop);
  },
});

/**
 * Runs a Firestore read and returns `fallback` if it throws (bad creds,
 * network, or running during a build with no valid credentials). This keeps
 * `next build` prerendering from crashing when the database is unreachable —
 * the static shell renders empty and fills in at runtime via revalidation.
 */
export async function safeRead<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[firestore] read failed, using fallback:", err);
    return fallback;
  }
}
