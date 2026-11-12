import { z } from "zod";

const field = z.string().trim().max(2000);
export const imprintSchema = z.object({
  proprietor: field, address: field, email: field, phone: field, legalForm: field,
  registrationNumber: field, registerCourt: field, gisa: field, uid: field,
  chamber: field, supervisoryAuthority: field, profession: field,
  regulations: field, disclosure: z.string().trim().max(5000),
}).strict();
export type Imprint = z.infer<typeof imprintSchema>;
export const privacySchema = z.object({
  sections: z.array(z.object({
    id: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
    title: z.string().trim().max(160), body: z.string().trim().max(10000),
  }).strict()).max(12),
}).strict().refine(value => new Set(value.sections.map(section => section.id)).size === value.sections.length, "Abschnitts-IDs müssen eindeutig sein.");
export type Privacy = z.infer<typeof privacySchema>;
export const imprintFields: { key: keyof Imprint; label: string; required?: boolean; multiline?: boolean }[] = [
  { key: "proprietor", label: "Rechtliche Inhaberin / rechtlicher Inhaber oder Unternehmen", required: true },
  { key: "legalForm", label: "Rechtsform", required: true },
  { key: "address", label: "Offizielle Geschäftsanschrift", required: true, multiline: true },
  { key: "email", label: "Kontakt-E-Mail", required: true },
  { key: "phone", label: "Kontakt-Telefon", required: true },
  { key: "registrationNumber", label: "Firmenbuch- / Registernummer" },
  { key: "registerCourt", label: "Registergericht" }, { key: "gisa", label: "GISA-Zahl" },
  { key: "uid", label: "UID-Nummer" }, { key: "chamber", label: "Kammer / Berufsverband" },
  { key: "supervisoryAuthority", label: "Aufsichts- / Gewerbebehörde" },
  { key: "profession", label: "Berufsbezeichnung und Verleihungsstaat" },
  { key: "regulations", label: "Anwendbare Rechtsvorschriften und Zugang", multiline: true },
  { key: "disclosure", label: "Medienrechtliche Offenlegung / weitere Pflichtangaben", multiline: true },
];
export const emptyImprint: Imprint = {
  proprietor: "", address: "", email: "", phone: "", legalForm: "", registrationNumber: "",
  registerCourt: "", gisa: "", uid: "", chamber: "", supervisoryAuthority: "", profession: "", regulations: "", disclosure: "",
};
export const emptyPrivacy: Privacy = { sections: [] };
const publishImprint = imprintSchema.superRefine((value, context) => {
  for (const entry of imprintFields.filter(entry => entry.required)) {
    if (!value[entry.key]) context.addIssue({ code: "custom", path: [entry.key], message: `${entry.label} fehlt.` });
  }
  if (!z.email().safeParse(value.email).success) context.addIssue({ code: "custom", path: ["email"], message: "Kontakt-E-Mail ist ungültig." });
  if (!/^[+0-9 ()-]{3,40}$/.test(value.phone)) context.addIssue({ code: "custom", path: ["phone"], message: "Kontakt-Telefon ist ungültig." });
});
const publishPrivacy = privacySchema.refine(value => value.sections.length > 0 && value.sections.every(section => section.title && section.body), "Mindestens ein vollständiger Abschnitt mit Überschrift und Text ist erforderlich.");
const timestamp = z.string().datetime({ offset: true });
const actor = z.string().min(1).max(128);
function documentSchema<D extends z.ZodType, P extends z.ZodType>(draft: D, published: P) {
  return z.object({
    draft: z.object({ content: draft, updatedAt: timestamp, updatedBy: actor.optional() }).strict().optional(),
    published: z.object({ content: published, approved: z.literal(true), publishedAt: timestamp, approvedBy: actor.optional() }).strict().optional(),
  }).strict();
}
export const legalSchema = z.object({
  impressum: documentSchema(imprintSchema, publishImprint).optional(),
  privacy: documentSchema(privacySchema, publishPrivacy).optional(),
}).strict();
export type Legal = z.infer<typeof legalSchema>;
export type LegalDocument = "impressum" | "privacy";
export const legalResponseSchema = z.object({ legal: legalSchema, revision: z.number().int().nonnegative() }).strict();
export type LegalResponse = z.infer<typeof legalResponseSchema>;
export const legalActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save-draft"), document: z.enum(["impressum", "privacy"]), content: z.unknown(), revision: z.number().int().nonnegative() }).strict(),
  z.object({ action: z.literal("publish"), document: z.enum(["impressum", "privacy"]), approved: z.literal(true), revision: z.number().int().nonnegative() }).strict(),
]);

/** Server supplies actor/time. Publication always copies the saved, checked draft. */
export function changeLegal(previous: Legal, input: z.infer<typeof legalActionSchema>, uid: string, now: string): Legal {
  const next = structuredClone(previous);
  if (input.document === "impressum") {
    const current = next.impressum || {};
    if (input.action === "save-draft") current.draft = { content: imprintSchema.parse(input.content), updatedAt: now, updatedBy: uid };
    else {
      if (!current.draft) throw Error("Bitte zuerst einen Entwurf speichern.");
      current.published = { content: publishImprint.parse(current.draft.content), approved: true, publishedAt: now, approvedBy: uid };
    }
    next.impressum = current;
  } else {
    const current = next.privacy || {};
    if (input.action === "save-draft") current.draft = { content: privacySchema.parse(input.content), updatedAt: now, updatedBy: uid };
    else {
      if (!current.draft) throw Error("Bitte zuerst einen Entwurf speichern.");
      current.published = { content: publishPrivacy.parse(current.draft.content), approved: true, publishedAt: now, approvedBy: uid };
    }
    next.privacy = current;
  }
  return legalSchema.parse(next);
}

/** Explicit allow-list: never ship drafts or private audit UIDs to public clients. */
export function publicLegal(legal: Legal): Legal {
  const result: Legal = {};
  if (legal.impressum?.published) {
    const { content, publishedAt } = legal.impressum.published;
    result.impressum = { published: { content, publishedAt, approved: true } };
  }
  if (legal.privacy?.published) {
    const { content, publishedAt } = legal.privacy.published;
    result.privacy = { published: { content, publishedAt, approved: true } };
  }
  return result;
}
