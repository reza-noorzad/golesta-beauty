import { z } from "zod";
import {
  failure,
  HttpError,
  readJson,
  readDeadline,
  json,
  requireAdmin,
} from "@/lib/server/firebase";
import { initialServices, normalizeCategories } from "@/lib/services";
export const runtime = "nodejs";
const item = z
  .object({
    id: z.string().min(1).max(100),
    name: z.string().trim().min(1).max(200),
    price: z.string().max(100),
  })
  .strict();
const schema = z
  .array(
    z
      .object({
        id: z.string().min(1).max(100),
        title: z.string().trim().min(1).max(150),
        desc: z.string().max(1000),
        sortOrder: z.number().int().min(0),
        items: z.array(item).max(1000),
      })
      .strict(),
  )
  .max(100);
export async function GET(request: Request) {
  try {
    const { db } = await requireAdmin(request);
    const snap = await readDeadline(db.doc("publicServices/current").get());
    return json({ categories: snap.exists ? normalizeCategories(snap.data()?.categories) : initialServices(),
      isLive: snap.exists, updatedAt: snap.data()?.updatedAt || null });
  } catch (error) { return failure(error); }
}
export async function PUT(request: Request) {
  try {
    const { db } = await requireAdmin(request);
    const parsed = z.object({ categories: schema, expectedUpdatedAt: z.string().datetime().nullable() }).strict()
      .safeParse(await readJson(request, 800000));
    if (!parsed.success) throw new HttpError(400, "Leistungen prüfen.");
    const { categories, expectedUpdatedAt } = parsed.data;
    if (
      new Set(categories.map((c) => c.id)).size !== categories.length ||
      categories.some(
        (c) => new Set(c.items.map((i) => i.id)).size !== c.items.length,
      )
    )
      throw new HttpError(400, "Doppelte IDs.");
    const updatedAt = new Date().toISOString();
    const ref = db.doc("publicServices/current");
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if ((snap.data()?.updatedAt || null) !== expectedUpdatedAt)
        throw new HttpError(
          409,
          "Zwischenzeitlich geändert. Bitte Seite neu laden.",
        );
      tx.set(ref, { categories, updatedAt });
    });
    return json({ updatedAt });
  } catch (e) {
    return failure(e);
  }
}
