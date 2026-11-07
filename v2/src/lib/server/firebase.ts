import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import type { AdminRole } from "../admin-session";
import { authorizeAdmin, bearerToken } from "./authorization";
import { HttpError } from "./http";
export { failure, HttpError, limitedBody, readJson, readDeadline, json } from "./http";
export type { AdminRole } from "../admin-session";

export function backend() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey || projectId !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    throw new HttpError(503, "Die Verwaltung ist vorübergehend nicht verfügbar. Bitte später erneut versuchen.");
  }
  try {
    const app = getApps().find((app) => app.name === "golesta-server") || initializeApp({
      credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, "\n") }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    }, "golesta-server");
    return { auth: getAuth(app), db: getFirestore(app), storage: getStorage(app) };
  } catch {
    throw new HttpError(503, "Die Verwaltung ist vorübergehend nicht verfügbar. Bitte später erneut versuchen.");
  }
}

export async function requireAdmin(request: Request, roles?: AdminRole[]) {
  const token = bearerToken(request);
  const services = backend();
  const identity = await authorizeAdmin(token, {
    verify: (value) => services.auth.verifyIdToken(value, true),
    administrator: async (uid) => (await services.db.doc(`admins/${uid}`).get()).data(),
  }, roles);
  return { ...services, ...identity };
}
