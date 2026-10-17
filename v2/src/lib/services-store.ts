import {
  doc,
  getDoc,
  onSnapshot,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import { adminRequest } from "./content-client";
import siteData from "@/data/site-data.json";

export type ServiceItem = { id: string; name: string; price: string };
export type ServiceCategory = {
  id: string;
  title: string;
  desc: string;
  sortOrder: number;
  items: ServiceItem[];
};
export type ServicesDocument = {
  categories: ServiceCategory[];
  updatedAt: string;
};

const initial: ServiceCategory[] = siteData.prices.map((category, index) => ({
  id: `category-${index + 1}`,
  title: category.title,
  desc: category.desc,
  sortOrder: index,
  items: category.items.map(([name, price], itemIndex) => ({
    id: `service-${index + 1}-${itemIndex + 1}`,
    name,
    price,
  })),
}));

export function initialServices(): ServiceCategory[] {
  return JSON.parse(JSON.stringify(initial)) as ServiceCategory[];
}
export function normalizeCategories(value: unknown): ServiceCategory[] {
  if (!Array.isArray(value)) throw new Error("Ungültige Kategorien.");
  if (value.length > 100) throw new Error("Zu viele Kategorien.");
  const ids = new Set<string>();
  return value.map((raw, index) => {
    if (!raw || typeof raw !== "object")
      throw new Error("Ungültige Kategorie.");
    const row = raw as Record<string, unknown>;
    const id = String(row.id || "");
    const title = String(row.title || "").trim();
    const desc = String(row.desc || "").trim();
    if (
      !id ||
      ids.has(id) ||
      !title ||
      title.length > 150 ||
      desc.length > 1000
    )
      throw new Error("Kategorie prüfen.");
    ids.add(id);
    if (!Array.isArray(row.items) || row.items.length > 1000)
      throw new Error("Leistungen prüfen.");
    const itemIds = new Set<string>();
    const items = row.items.map((item) => {
      if (!item || typeof item !== "object")
        throw new Error("Ungültige Leistung.");
      const s = item as Record<string, unknown>;
      const serviceId = String(s.id || "");
      const name = String(s.name || "").trim();
      const price = String(s.price ?? "").trim();
      if (
        !serviceId ||
        itemIds.has(serviceId) ||
        !name ||
        name.length > 200 ||
        price.length > 100
      )
        throw new Error("Leistung oder Preis prüfen.");
      itemIds.add(serviceId);
      return { id: serviceId, name, price };
    });
    return { id, title, desc, sortOrder: index, items };
  });
}
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
export async function readServices(
  db: Firestore,
): Promise<{
  categories: ServiceCategory[];
  isLive: boolean;
  updatedAt: string | null;
}> {
  const snapshot = await getDoc(doc(db, "publicServices", "current"));
  if (!snapshot.exists())
    return { categories: initialServices(), isLive: false, updatedAt: null };
  return {
    categories: normalizeCategories(snapshot.data().categories),
    isLive: true,
    updatedAt: snapshot.data().updatedAt || null,
  };
}
export async function saveServices(
  db: Firestore,
  categories: ServiceCategory[],
  expectedUpdatedAt: string | null,
): Promise<string> {
  const safe = normalizeCategories(categories);
  const result = await adminRequest("/api/admin/services", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categories: safe, expectedUpdatedAt }),
  });
  return result.updatedAt;
}
