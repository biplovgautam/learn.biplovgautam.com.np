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

function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length) {
    _app = getApps()[0];
    return _app;
  }

  // If private key is available, use service account cert
  // Otherwise fall back to Application Default Credentials (ADC)
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const hasServiceAccount = !!(clientEmail && privateKey);

  if (hasServiceAccount) {
    _app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
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
