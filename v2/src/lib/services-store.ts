import { doc, onSnapshot, type Firestore, type Unsubscribe } from "firebase/firestore";
import { adminRequest } from "./content-client";
import { initialServices, normalizeCategories, type ServiceCategory } from "./services";
export { initialServices, normalizeCategories, type ServiceItem, type ServiceCategory, type ServicesDocument } from "./services";

export function watchServices(
  db: Firestore,
  next: (categories: ServiceCategory[], isLive: boolean) => void,
  fail: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, "publicServices", "current"),
    (snapshot) => {
      if (!snapshot.exists()) {
        next(initialServices(), false);
        return;
      }
      try {
        next(normalizeCategories(snapshot.data().categories), true);
      } catch (error) {
        fail(error instanceof Error ? error : new Error("Ungültige Daten."));
      }
    },
    fail,
  );
}

export async function readServices(): Promise<{ categories: ServiceCategory[]; isLive: boolean; updatedAt: string | null }> {
  return adminRequest("/api/admin/services");
}
export async function saveServices(categories: ServiceCategory[], expectedUpdatedAt: string | null): Promise<string> {
  const safe = normalizeCategories(categories);
  const result = await adminRequest<{updatedAt: string}>("/api/admin/services", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categories: safe, expectedUpdatedAt }),
  });
  return result.updatedAt;
}
