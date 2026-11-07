import { publicContent, type Content } from "./content";
import { PUBLIC_CATALOG_ENABLED } from "./public-config";

/** Only the public projection is hidden; the source/admin document is untouched. */
export function publicSiteContent(source: Content, catalogEnabled = PUBLIC_CATALOG_ENABLED): Content {
  const visible = publicContent(source);
  return catalogEnabled ? visible : { ...visible, products: [], categories: [], promotions: [] };
}

export function contactLinks(settings: Pick<Content["settings"], "phone" | "whatsapp">) {
  return {
    phone: `tel:${settings.phone.replace(/[^+\d]/g, "")}`,
    whatsapp: `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent("Hallo Golesta Beauty, ich möchte einen Termin vereinbaren.")}`,
  };
}
