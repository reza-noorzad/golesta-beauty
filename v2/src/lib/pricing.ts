import type { Content, Discount } from "./content";
export function isActivePeriod(data: { enabled: boolean; startsAt?: string; endsAt?: string }, now = Date.now()): boolean {
  if (!data.enabled) return false;
  if (data.startsAt && Date.parse(data.startsAt) > now) return false;
  if (data.endsAt && Date.parse(data.endsAt) <= now) return false;
  return true;
}
export function discountedPrice(price: number | null, discount: Discount, now = Date.now()): number | null {
  if (price === null || !isActivePeriod(discount, now)) return price;
  const off = discount.type === "percent" ? price * discount.value / 100 : discount.value;
  return Math.max(0, Math.round((price - off + Number.EPSILON) * 100) / 100);
}
export function productPrice(product: Content["products"][number], promotions: Content["promotions"] = [], variantId = "", now = Date.now()) {
  const variant = product.variants.find(v => v.id === variantId);
  const base = variant ? variant.price : product.price;
  let price = base;
  let label: string | undefined;
  const offers: Array<{ label?: string; config: Discount }> = [];
  if (product.discount) offers.push({ label: product.discount.label, config: product.discount });
  for (const sale of promotions || []) {
    if (sale.categoryIds?.length && !sale.categoryIds.includes(product.categoryId)) continue;
    if (sale.excludeProductIds?.includes(product.id)) continue;
    offers.push({ label: sale.title, config: sale });
  }
  for (const offer of offers) {
    const candidate = discountedPrice(base, offer.config, now);
    if (candidate !== null && (price === null || candidate < price)) { price = candidate; label = offer.label; }
  }
  return { original: base, current: price, discounted: price !== null && base !== null && price < base, label };
}
