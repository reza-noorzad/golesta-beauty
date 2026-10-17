
import { createHash } from "node:crypto";
import { z } from "zod";
import {
  backend,
  failure,
  HttpError,
  limitedBody,
} from "@/lib/server/firebase";
import { parseStoredContent } from "@/lib/content";

type StoredReview = {
  productId: string;
  name: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

const schema = z
  .object({
    productId: z.string().min(1).max(100),
    name: z.string().trim().min(2).max(80),
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().min(10).max(1200),
    website: z.string().max(50).optional(),
  })
  .strict();

export async function GET(request: Request) {
  try {
    const productId =
      new URL(request.url).searchParams.get("productId") || "";

    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(productId)) {
      throw new HttpError(400, "Produkt-ID ungültig.");
    }

    const snapshot = await backend()
      .db.collection("golestaV2Reviews")
      .where("productId", "==", productId)
      .limit(200)
      .get();

    const reviews = snapshot.docs
      .map((document) => ({
        id: document.id,
        data: document.data() as StoredReview,
      }))
      .filter(({ data }) => data.status === "approved")
      .slice(-50)
      .map(({ id, data }) => ({
        id,
        name: data.name,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt,
      }));

    return Response.json(
      { reviews },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");

    if (
      !origin ||
      new URL(origin).host !== new URL(request.url).host
    ) {
      throw new HttpError(403, "Anfrage nicht erlaubt.");
    }

    let body: unknown;

    try {
      body = JSON.parse(
        (await limitedBody(request, 4500)).toString()
      );
    } catch {
      throw new HttpError(400, "Ungültige Anfrage.");
    }

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      throw new HttpError(
        400,
        "Bitte Name, Bewertung und Kommentar prüfen."
      );
    }

    // Hidden anti-spam field.
    if (parsed.data.website) {
      return Response.json({ ok: true });
    }

    const { db } = backend();

    const snapshot = await db.doc("golestaV2/content").get();

    const data = parseStoredContent(snapshot.data()?.data);

    const product = data.products.find(
      (item) =>
        item.id === parsed.data.productId &&
        item.published &&
        item.allowReviews &&
        data.categories.some(
          (category) =>
            category.id === item.categoryId &&
            category.published
        )
    );

    if (!product) {
      throw new HttpError(
        403,
        "Bewertungen für dieses Produkt nicht verfügbar."
      );
    }

    const ip =
      request.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim() || "unknown";

    const key = createHash("sha256")
      .update(ip + ":" + process.env.FIREBASE_PROJECT_ID)
      .digest("hex");

    const limitRef = db.doc(`golestaV2ReviewLimits/${key}`);

    await db.runTransaction(async (transaction) => {
      const limitSnapshot = await transaction.get(limitRef);
      const previous = limitSnapshot.data();
      const now = Date.now();

      const recent =
        typeof previous?.start === "number" &&
        now - previous.start < 86_400_000;

      const count = recent
        ? Number(previous?.count || 0)
        : 0;

      if (count >= 3) {
        throw new HttpError(
          429,
          "Zu viele Bewertungen. Bitte später versuchen."
        );
      }

      transaction.set(limitRef, {
        start: recent ? previous!.start : now,
        count: count + 1,
      });
    });

    await db.collection("golestaV2Reviews").add({
      productId: product.id,
      name: parsed.data.name,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return Response.json(
      {
        ok: true,
        message:
          "Vielen Dank! Die Bewertung wird erst nach Freigabe sichtbar.",
      },
      { status: 201 }
    );
  } catch (error) {
    return failure(error);
  }
}
