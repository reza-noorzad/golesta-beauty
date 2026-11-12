import { z } from "zod";
import { initialContent } from "@/lib/content";
import { changeLegal, legalActionSchema, legalSchema } from "@/lib/legal";
import { failure, HttpError, json, readDeadline, readJson, requireAdmin } from "@/lib/server/firebase";

export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const { db } = await requireAdmin(request, ["admin", "superadmin"]);
    const snap = await readDeadline(db.doc("golestaV2/content").get());
    return json({ legal: legalSchema.parse(snap.data()?.data?.legal || {}), revision: snap.data()?.revision || 0 });
  } catch (error) { return failure(error); }
}
export async function PATCH(request: Request) {
  try {
    const { db, uid, role } = await requireAdmin(request, ["admin", "superadmin"]);
    const input = legalActionSchema.parse(await readJson(request, 200_000));
    if (input.action === "publish" && role !== "superadmin") throw new HttpError(403, "Nur die Salonleitung kann rechtliche Texte freigeben und veröffentlichen.");
    const ref = db.doc("golestaV2/content");
    const result = await db.runTransaction(async tx => {
      const actor = await tx.get(db.doc(`admins/${uid}`));
      const snap = await tx.get(ref);
      const account = actor.data();
      const currentRole = account?.role === undefined || account?.role === null || account?.role === "" ? "admin" : account.role;
      if (account?.active !== true || !["admin", "superadmin"].includes(currentRole) || input.action === "publish" && currentRole !== "superadmin") {
        throw new HttpError(403, "Deine Berechtigung hat sich geändert. Bitte erneut anmelden.");
      }
      const stored = snap.data();
      const revision = stored?.revision || 0;
      if (revision !== input.revision) throw new HttpError(409, "Zwischenzeitlich geändert. Bitte neu laden; dein Entwurf bleibt im Editor erhalten.");
      const data = snap.exists ? stored?.data : initialContent;
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new HttpError(409, "Die vorhandenen Inhalte können nicht sicher geändert werden.");
      const now = new Date().toISOString();
      let legal;
      try { legal = changeLegal(legalSchema.parse(data.legal || {}), input, uid, now); }
      catch (error) {
        if (error instanceof z.ZodError) throw new HttpError(400, error.issues[0]?.message || "Bitte rechtliche Angaben prüfen.");
        throw new HttpError(400, error instanceof Error ? error.message : "Bitte zuerst einen vollständigen Entwurf speichern.");
      }
      tx.set(ref, { ...stored, data: { ...data, legal }, revision: revision + 1, updatedBy: uid, updatedAt: now });
      return { legal, revision: revision + 1 };
    });
    return json(result);
  } catch (error) {
    if (error instanceof z.ZodError) return json({ error: "Ungültige Aktion. Eine Veröffentlichung benötigt eine ausdrückliche Freigabe." }, 400);
    return failure(error);
  }
}
