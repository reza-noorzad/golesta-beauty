import { loadEnvConfig } from "@next/env";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readDeadline } from "../src/lib/server/http";
import { parseStoredContent } from "../src/lib/content";
import { normalizeCategories } from "../src/lib/services";

// Explicit read-only diagnostic. Never creates users, records, or files.
loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey || projectId !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) throw Error("Configuration unavailable");
  const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, "\n") }) }, "golesta-read-verification");
  const db = getFirestore(app);
  try {
    const [content, services, reviews, administrators] = await readDeadline(Promise.all([
      db.doc("golestaV2/content").get(), db.doc("publicServices/current").get(),
      db.collection("golestaV2Reviews").limit(1).get(), db.collection("admins").limit(1).get(),
    ]), 15_000);
    const data = content.exists ? parseStoredContent(content.data()?.data) : null;
    const categories = services.exists ? normalizeCategories(services.data()?.categories) : null;
    console.log(JSON.stringify({
      readOnly: true, contentExists: content.exists, contentValid: Boolean(data),
      products: data?.products.length ?? null, galleryImages: data?.gallery.length ?? null,
      settingsReadable: Boolean(data?.settings), servicesExist: services.exists, serviceCategories: categories?.length ?? null,
      reviewsReadSucceeded: true, reviewSampleCount: reviews.size,
      administratorsReadSucceeded: true, administratorSampleCount: administrators.size,
    }));
  } finally { await db.terminate(); }
}
void main().catch(() => { console.error("Read-only Firebase verification failed; no credentials or record contents have been printed."); process.exitCode = 1; });
