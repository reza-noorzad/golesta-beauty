import { z } from "zod";
import site from "@/data/site-data.json";

const text = z.string().trim().max(10000);
const name = z.string().trim().min(1).max(200);
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
const optionalText = z.string().trim().max(10000).optional();
const image = z.string().max(2000).refine(v =>
  v === "" ||
  /^\/images\/[a-zA-Z0-9_.-]+$/.test(v) ||
  /^\/Logo\.PNG$/.test(v) ||
  /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/golesta-v2%2F[a-zA-Z0-9%_.-]+\?alt=media&token=[a-zA-Z0-9-]+$/.test(v) ||
  /^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/image\/upload\/(?:v\d+\/)?golesta-v2\/[a-zA-Z0-9_-]+\.(?:webp|jpg|jpeg|png)$/.test(v),
  "Ungültiges Bild");
const price = z.number().finite().min(0).max(100000).nullable();
const base = { id, published: z.boolean(), sortOrder: z.number().int().min(0).max(10000) };
const isoDate = z.string().datetime({ offset: true }).or(z.literal(""));
const httpsUrl = z.string().url().refine(v => v.startsWith("https://"));
const optionalUrl = z.union([httpsUrl, z.literal(""), z.string().regex(/^\/(?!\/)[a-zA-Z0-9/#?=&._%-]*$/)]);
const discount = z.object({
  enabled: z.boolean(), type: z.enum(["percent", "fixed"]),
  value: z.number().finite().min(0).max(100000),
  label: z.string().max(120).optional(),
  startsAt: isoDate.optional(), endsAt: isoDate.optional(),
}).strict().superRefine((v, ctx) => {
  if (v.type === "percent" && v.value > 100) ctx.addIssue({ code: "custom", message: "Prozent max. 100" });
  if (v.startsAt && v.endsAt && Date.parse(v.endsAt) <= Date.parse(v.startsAt)) ctx.addIssue({ code: "custom", message: "Ende vor Beginn" });
});
export type Discount = z.infer<typeof discount>;
const attribute = z.object({ id, label: z.string().max(150), value: text }).strict();
export const productSchema = z.object({
  ...base, name,
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(150),
  description: text,
  shortDescription: optionalText,
  brand: z.string().max(200).optional(),
  ingredients: optionalText,
  attributes: z.array(attribute).max(40).optional(),
  price, currency: z.literal("EUR"), categoryId: id,
  images: z.array(image).max(12), featured: z.boolean(),
  variants: z.array(z.object({ id, name: z.string().max(200), price, available: z.boolean(), sku: z.string().max(100).optional() }).strict()).max(50),
  discount: discount.optional(), allowReviews: z.boolean().optional(), showRating: z.boolean().optional(),
}).strict();
const announcement = z.object({
  id, enabled: z.boolean(), title: z.string().trim().max(200),
  message: text, type: z.enum(["info", "holiday", "hours", "promotion"]),
  startsAt: isoDate.optional(), endsAt: isoDate.optional(),
  linkLabel: z.string().max(80).optional(), linkUrl: optionalUrl.optional(),
}).strict();
const promotion = discount.safeExtend({
  id, title: z.string().max(150),
  categoryIds: z.array(id).max(100).optional(),
  excludeProductIds: z.array(id).max(500).optional(),
});
const socials = z.object({ id, name: z.string().max(200), url: z.union([httpsUrl, z.literal("")]), published: z.boolean() }).strict();
export const contentSchema = z.object({
  products: z.array(productSchema).max(500),
  categories: z.array(z.object({ ...base, name }).strict()).max(100),
  team: z.array(z.object({ ...base, name, role: text, image, bio: optionalText, specialties: z.array(z.string().trim().min(1).max(300)).max(30).optional(), experience: optionalText }).strict()).max(50),
  gallery: z.array(z.object({ ...base, image, alt: name, homepage: z.boolean().optional() }).strict()).max(200),
  voucher: z.object({ published: z.boolean(), description: text, values: z.array(z.number().positive().max(100000)).max(30) }).strict(),
  settings: z.object({
    phone: z.string().regex(/^[+0-9 ()-]{3,40}$/),
    whatsapp: z.string().regex(/^[0-9]{5,20}$/), email: z.email(), address: name,
    instagram: httpsUrl, reviewUrl: httpsUrl,
    hours: z.array(z.object({ label: name, value: name }).strict()).max(14),
    salonName: z.string().max(150).optional(), logo: image.optional(),
    routeUrl: optionalUrl.optional(), socials: z.array(socials).max(30).optional(),
    heroTitle: z.string().max(200).optional(), heroAccent: z.string().max(200).optional(),
    heroDescription: z.string().max(1000).optional(), heroImage: image.optional(),
    galleryLimit: z.number().int().min(1).max(24).optional(),
    heroEyebrow: z.string().max(150).optional(),
    productHeading: z.string().max(150).optional(), productDescription: z.string().max(500).optional(),
    teamHeading: z.string().max(150).optional(), teamFooter: z.string().max(500).optional(),
    galleryHeading: z.string().max(150).optional(), galleryDescription: z.string().max(500).optional(),
    servicesHeading: z.string().max(150).optional(), servicesDescription: z.string().max(500).optional(),
    footerText: z.string().max(300).optional(), contactHeading: z.string().max(150).optional(),
    voucherHeading: z.string().max(150).optional(), appointmentLabel: z.string().max(100).optional(),
  }).strict(),
  announcements: z.array(announcement).max(40).optional(),
  promotions: z.array(promotion).max(30).optional(),
}).strict().superRefine((v, ctx) => {
  for (const key of ["products", "categories", "team", "gallery", "announcements", "promotions"] as const) {
    const rows = v[key] || [];
    if (new Set(rows.map(r => r.id)).size !== rows.length) ctx.addIssue({ code: "custom", message: "Doppelte IDs", path: [key] });
  }
  if (new Set(v.products.map(p => p.slug)).size !== v.products.length)
    ctx.addIssue({ code: "custom", message: "Produkt-URL muss eindeutig sein", path: ["products"] });
  for (const p of v.products) {
    if (!v.categories.some(c => c.id === p.categoryId)) ctx.addIssue({ code: "custom", message: "Produktkategorie fehlt", path: ["products"] });
    if (new Set(p.variants.map(x => x.id)).size !== p.variants.length) ctx.addIssue({ code: "custom", message: "Doppelte Varianten", path: ["products"] });
  }
});
export type Content = z.infer<typeof contentSchema>;
export const initialContent: Content = {
  products: [], categories: [],
  team: [
    { id: "goli", name: "MST. Golestan Sepehri", role: "", image: "/images/goli.jpg", published: true, sortOrder: 0 },
    { id: "mazari", name: "Mazari", role: "", image: "/images/mazari.jpg", published: true, sortOrder: 1 },
  ],
  gallery: Array.from({ length: 18 }, (_, i) => ({
    id: `gallery-${i + 1}`, image: `/images/gallery-${String(i + 1).padStart(2, "0")}.jpg`,
    alt: `Golesta Beauty Galerie ${i + 1}`, published: true, homepage: i < 6, sortOrder: i,
  })),
  voucher: { published: true, description: site.gutscheinText, values: [] },
  settings: {
    phone: site.phone, whatsapp: site.whatsapp, email: site.email, address: site.address,
    instagram: site.instagram, reviewUrl: site.reviewUrl, salonName: "Golesta Beauty", logo: "/Logo.PNG",
    galleryLimit: 6, heroEyebrow: "Beauty Salon · Villach",
    productHeading: "Unsere Produkte", productDescription: "Entdecke unsere ausgewählten Beauty-Produkte.",
    teamHeading: "Unser Team", teamFooter: "Persönlich, professionell und mit Leidenschaft für Beauty.",
    galleryHeading: "Unsere Galerie", galleryDescription: "Entdecke unsere Arbeiten und lass dich inspirieren.",
    servicesHeading: "Leistungen & Preise", servicesDescription: "Entdecke unsere Behandlungen und Preise.",
    footerText: "© 2026 Golesta Beauty · Villach", contactHeading: "Kontakt & Anfahrt",
    voucherHeading: "Gutschein", appointmentLabel: "Termin vereinbaren",
    heroTitle: "Deine Schönheit.", heroAccent: "Unsere Leidenschaft.",
    heroDescription: "Willkommen bei Golesta Beauty in Villach. Entdecke unsere Behandlungen, unser Team und unsere Beauty-Welt.",
    heroImage: "/images/gallery-01.jpg",
    hours: [
      { label: "Montag – Freitag", value: "09:00 – 18:00" },
      { label: "Samstag", value: "09:00 – 14:00" },
      { label: "Sonntag", value: "Geschlossen" },
    ],
  }, announcements: [], promotions: [],
};
/** Migrate older single-document content without erasing existing user values. */
export function parseStoredContent(value: unknown): Content {
  if (!value || typeof value !== "object" || Array.isArray(value)) return structuredClone(initialContent);
  const raw = value as Record<string, unknown>;
  const gallery = Array.isArray(raw.gallery) ? raw.gallery.map((x, i) => {
    if (!x || typeof x !== "object") return x;
    const row = x as Record<string, unknown>;
    return { ...row, homepage: row.homepage ?? i < 6 };
  }) : initialContent.gallery;
  const settings = raw.settings && typeof raw.settings === "object" ? raw.settings : {};
  // Older editor accidentally used the role field for long biographies.
  // Preserve the complete text as biography without pretending it is a job title.
  const team = Array.isArray(raw.team) ? raw.team.map(x => {
    if (!x || typeof x !== "object") return x;
    const row = x as Record<string, unknown>;
    if (typeof row.role === "string" && row.role.length > 180 && !row.bio)
      return { ...row, role: "", bio: row.role };
    return row;
  }) : initialContent.team;
  return contentSchema.parse({
    ...raw, team, gallery,
    settings: { ...initialContent.settings, ...settings },
    announcements: raw.announcements ?? [], promotions: raw.promotions ?? [],
  });
}
export function publicContent(data: Content): Content {
  const visible = <T extends { published: boolean; sortOrder: number }>(rows: T[]) =>
    rows.filter(r => r.published).sort((a, b) => a.sortOrder - b.sortOrder);
  const categories = visible(data.categories);
  return {
    ...data, categories,
    products: visible(data.products).filter(p => categories.some(c => c.id === p.categoryId)),
    team: visible(data.team), gallery: visible(data.gallery), settings: { ...data.settings, socials: (data.settings.socials || []).filter(s => s.published && /^https:\/\//.test(s.url) && s.name.trim()) },
    voucher: data.voucher.published ? data.voucher : { published: false, description: "", values: [] },
    announcements: (data.announcements || []).filter(a => a.enabled && a.message.trim()),
    promotions: (data.promotions || []).filter(p => p.enabled),
  };
}
