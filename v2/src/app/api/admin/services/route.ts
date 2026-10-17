import { z } from "zod";
import {
  failure,
  HttpError,
  limitedBody,
  requireAdmin,
} from "@/lib/server/firebase";
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
export async function PUT(request: Request) {
  try {
    const { db } = await requireAdmin(request);
    let body;
    try {
      body = JSON.parse((await limitedBody(request, 800000)).toString());
    } catch (e) {
      if (e instanceof HttpError) throw e;
      throw new HttpError(400, "Ungültiges JSON.");
    }
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new HttpError(400, "Ungültige Daten.");
    const parsed = schema.safeParse(body.categories);
    if (!parsed.success) throw new HttpError(400, "Leistungen prüfen.");
    const categories = parsed.data;
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
      if ((snap.data()?.updatedAt || null) !== body.expectedUpdatedAt)
        throw new HttpError(
          409,
          "Zwischenzeitlich geändert. Bitte Seite neu laden.",
        );
      tx.set(ref, { categories, updatedAt });
    });
    return Response.json({ updatedAt });
  } catch (e) {
    return failure(e);
  }
}
