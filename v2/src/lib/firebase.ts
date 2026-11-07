"use client";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth, initializeAuth, indexedDBLocalPersistence, browserLocalPersistence,
  browserSessionPersistence, inMemoryPersistence, type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
export const firebaseConfigured = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
export let auth: Auth | null = null;
export let db: Firestore | null = null;
export let firebaseInitializationError = "";

if (firebaseConfigured) {
  try {
    const app = getApps().find((app) => app.name === "[DEFAULT]") ? getApp() : initializeApp(config);
    try {
      auth = initializeAuth(app, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence],
      });
    } catch (error) {
      if ((error as { code?: string }).code !== "auth/already-initialized") throw error;
      auth = getAuth(app);
    }
    db = getFirestore(app);
  } catch {
    auth = null;
    db = null;
    firebaseInitializationError = "Die Anmeldung konnte nicht gestartet werden. Bitte lade die Seite neu oder kontaktiere den Salon.";
  }
}
