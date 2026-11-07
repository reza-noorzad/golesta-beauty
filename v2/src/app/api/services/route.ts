import { backend, failure, json, readDeadline } from "@/lib/server/firebase";
import { initialServices, normalizeCategories } from "@/lib/services";
export const runtime = "nodejs";

export async function GET() {
  try {
    if (!process.env.FIREBASE_PROJECT_ID && !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return json({ categories: initialServices() });
    const snapshot = await readDeadline(backend().db.doc("publicServices/current").get());
    return json({ categories: snapshot.exists ? normalizeCategories(snapshot.data()?.categories) : initialServices() });
  } catch (error) { return failure(error); }
}
