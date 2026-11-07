import type { AdminRole } from "../admin-session";
import { HttpError, readDeadline } from "./http";

export function bearerToken(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer ([^\s]+)$/i)?.[1];
  if (!token || token.length > 16000) throw new HttpError(401, "Bitte anmelden.");
  return token;
}
export async function authorizeAdmin(token: string, dependencies: {
  verify: (token: string) => Promise<{ uid: string }>;
  administrator: (uid: string) => Promise<{ active?: unknown; role?: unknown } | undefined>;
}, roles: AdminRole[] = ["superadmin", "admin", "editor"], timeoutMs = 10_000) {
  let uid: string;
  try { uid = (await readDeadline(dependencies.verify(token), timeoutMs)).uid; }
  catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : "";
    if (["auth/id-token-expired", "auth/id-token-revoked", "auth/invalid-id-token", "auth/argument-error", "auth/invalid-argument", "auth/user-disabled", "auth/user-not-found"].includes(String(code))) {
      throw new HttpError(401, "Sitzung abgelaufen. Bitte erneut anmelden.");
    }
    throw new HttpError(503, "Die Anmeldung kann gerade nicht geprüft werden. Bitte später erneut versuchen.");
  }
  if (!uid || /[\/]/.test(uid)) throw new HttpError(401, "Ungültige Sitzung. Bitte erneut anmelden.");
  let admin;
  try { admin = await readDeadline(dependencies.administrator(uid), timeoutMs); }
  catch { throw new HttpError(503, "Die Berechtigung kann gerade nicht geprüft werden. Bitte später erneut versuchen."); }
  if (admin?.active !== true) throw new HttpError(403, "Keine Admin-Berechtigung.");
  // Preserve existing active administrators without a role; reject unknown roles.
  const value = admin.role;
  const role = value === undefined || value === null || value === "" ? "admin" : value;
  if (role !== "superadmin" && role !== "admin" && role !== "editor") throw new HttpError(403, "Keine gültige Admin-Berechtigung.");
  if (!roles.includes(role)) throw new HttpError(403, "Keine Berechtigung für diesen Bereich.");
  return { uid, role };
}
