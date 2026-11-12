import { z } from "zod";
import { contentSchema } from "./content";
import { legalResponseSchema } from "./legal";
import { ApiError, requestJson, withTimeout } from "./request";
import type { AdminRole } from "./admin-session";

export const ADMIN_ACCESS_EVENT = "golesta:admin-access-changed";
export type AdminSessionResponse = { uid: string; role: AdminRole };
export type AdminContentResponse = { data: z.infer<typeof contentSchema>; revision: number };
export type AdminReview = { id: string; productId: string; name: string; rating: number; comment: string; status: string; createdAt: string };
export type ReviewCounts = {pending:number;approved:number;rejected:number};
export type AdminUser = { uid: string; email: string; role: AdminRole; active: boolean };

const revision = z.number().int().nonnegative();
const role = z.enum(["superadmin", "admin", "editor"]);
const review = z.object({ id: z.string(), productId: z.string(), name: z.string(), rating: z.number(), comment: z.string(), status: z.string(), createdAt: z.string() });
const user = z.object({ uid: z.string(), email: z.string(), role, active: z.boolean() });
const service = z.object({ id: z.string(), title: z.string(), desc: z.string(), sortOrder: z.number(), items: z.array(z.object({ id: z.string(), name: z.string(), price: z.string() })) });
const schemas: Record<string, z.ZodType> = {
  "GET /api/admin/legal": legalResponseSchema,
  "PATCH /api/admin/legal": legalResponseSchema,
  "GET /api/admin/session": z.object({ uid: z.string().min(1), role }),
  "GET /api/admin/content": z.object({ data: contentSchema, revision }),
  "PUT /api/admin/content": z.object({ revision }),
  "GET /api/admin/reviews": z.object({ reviews: z.array(review),counts:z.object({pending:revision,approved:revision,rejected:revision}).optional() }),
  "PATCH /api/admin/reviews": z.object({ ok: z.literal(true) }),
  "GET /api/admin/users": z.object({ users: z.array(user) }),
  "POST /api/admin/users": z.object({ uid: z.string(), temporaryPassword: z.string().nullable() }),
  "PATCH /api/admin/users": z.object({ ok: z.literal(true) }),
  "GET /api/admin/services": z.object({ categories: z.array(service), isLive: z.boolean(), updatedAt: z.string().nullable() }),
  "PUT /api/admin/services": z.object({ updatedAt: z.string() }),
  "POST /api/admin/upload": z.object({ url: z.url() }),
};

export function validateAdminResponse(url: string, method: string, body: unknown) {
  const result = schemas[`${method.toUpperCase()} ${url}`]?.safeParse(body);
  if (!result?.success) throw new ApiError("Die Antwort konnte nicht verarbeitet werden. Bitte lade die Seite neu.");
  return result.data;
}

export async function authenticatedRequest<T>(user: { getIdToken: () => Promise<string> }, url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  try {
    const token = await withTimeout(user.getIdToken(), 10_000, "Die Sitzung kann gerade nicht bestätigt werden. Bitte erneut versuchen.");
    headers.set("Authorization", `Bearer ${token}`);
    return validateAdminResponse(url, options.method || "GET", await requestJson(url, { ...options, headers })) as T;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      if (url !== "/api/admin/session" && typeof window !== "undefined") window.dispatchEvent(new Event(ADMIN_ACCESS_EVENT));
      throw error;
    }
    if (error instanceof ApiError) throw error;
    const code = error && typeof error === "object" && "code" in error ? error.code : "";
    if (["auth/user-token-expired", "auth/invalid-user-token", "auth/user-disabled"].includes(String(code))) {
      if (url !== "/api/admin/session" && typeof window !== "undefined") window.dispatchEvent(new Event(ADMIN_ACCESS_EVENT));
      throw new ApiError("Deine Sitzung ist abgelaufen. Bitte erneut anmelden.", 401);
    }
    throw new ApiError("Die Sitzung kann gerade nicht bestätigt werden. Bitte prüfe deine Verbindung und versuche es erneut.");
  }
}
