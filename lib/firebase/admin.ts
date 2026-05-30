import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
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

  // Full service-account JSON, base64-encoded — most reliable, carries its own projectId.
  const hasServiceAccountJson =
    !!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64?.trim();

  // ADC "authorized_user" credentials (from `gcloud auth application-default
  // login`), base64-encoded. Works where service-account key creation is
  // blocked by org policy, since this is not a service-account key.
  const hasAdc = !!process.env.FIREBASE_ADMIN_ADC_BASE64?.trim();

  const hasServiceAccount =
    hasServiceAccountJson ||
    hasAdc ||
    !!(
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim() &&
      (process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim() ||
        process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64?.trim())
    );

  // Without a service account key, we rely on ADC (gcloud auth).
  // ADC is only available at runtime, not during build.
  if (!hasServiceAccount) {
    const isBuild =
      process.env.NEXT_PHASE === "phase-production-build" ||
      process.env.NEXT_PHASE === "phase-production-server";

    if (isBuild) return false;
    return hasProjectId;
  }

  // Full JSON carries its own projectId, so don't require the separate env var.
  return hasServiceAccountJson || hasProjectId;
}

/** Strip surrounding quotes and convert escaped "\n" into real newlines. */
function normalizePem(key: string): string {
  let k = key.trim();
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1);
  }
  return k.replace(/\\n/g, "\n");
}

/**
 * Resolves the private key from env vars.
 *  - FIREBASE_ADMIN_PRIVATE_KEY_BASE64: base64 of the PEM (immune to newline mangling)
 *  - FIREBASE_ADMIN_PRIVATE_KEY: raw PEM
 * Both are normalized (quotes stripped, "\n" -> newlines) afterwards.
 */
function resolvePrivateKey(): string | undefined {
  const b64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64?.trim();
  if (b64) {
    return normalizePem(Buffer.from(b64, "base64").toString("utf8"));
  }
  const raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!raw) return undefined;
  return normalizePem(raw);
}

function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length) {
    _app = getApps()[0];
    return _app;
  }

  // 1. Preferred: entire service-account JSON, base64-encoded (one env var, no
  //    per-field newline issues). FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64.
  const serviceAccountB64 =
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64?.trim();
  if (serviceAccountB64) {
    const json = JSON.parse(
      Buffer.from(serviceAccountB64, "base64").toString("utf8")
    );
    _app = initializeApp({ credential: cert(json) });
    return _app;
  }

  // 1b. ADC "authorized_user" credentials, base64-encoded. Use when service
  //     account key creation is blocked by org policy. This is the contents of
  //     ~/.config/gcloud/application_default_credentials.json.
  //
  //     The Firestore client only accepts a cert credential or genuine ADC —
  //     it rejects firebase-admin's refreshToken() credential. So we write the
  //     JSON to /tmp and point GOOGLE_APPLICATION_CREDENTIALS at it, then use
  //     applicationDefault(); that path is accepted by both Auth and Firestore.
  const adcB64 = process.env.FIREBASE_ADMIN_ADC_BASE64?.trim();
  if (adcB64) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const json = Buffer.from(adcB64, "base64").toString("utf8");
    const credPath = join(tmpdir(), "adc-credentials.json");
    writeFileSync(credPath, json);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
    if (projectId) {
      process.env.GOOGLE_CLOUD_PROJECT = projectId;
      process.env.GCLOUD_PROJECT = projectId;
    }
    _app = initializeApp({
      credential: applicationDefault(),
      projectId,
    });
    return _app;
  }

  // 2. Individual fields (private key as raw PEM or base64).
  const privateKey = resolvePrivateKey();
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
