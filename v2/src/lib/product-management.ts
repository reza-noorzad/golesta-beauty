import type { Content } from "./content";
export const HOMEPAGE_PRODUCT_LIMIT=3;
export const PRODUCT_PAGE_SIZE=15;
export const GALLERY_PAGE_SIZE=24;
export type Product=Content["products"][number];
export function productSlug(name:string) {
  return name.toLocaleLowerCase("de").replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,140);
}
export function uniqueProductSlug(name:string,products:Product[],excludeId="") {
  const base=productSlug(name)||"produkt";const occupied=new Set(products.filter((product) => product.id!==excludeId).map((product) => product.slug));
  let candidate=base;let suffix=2;while(occupied.has(candidate))candidate=`${base}-${suffix++}`;
  return candidate;
}
export function eligibleFeatured(data:Content,product:Product) {return product.published&&data.categories.some((category) => category.id===product.categoryId&&category.published);}
export function selectedFeatured(data:Content) {return data.products.filter((product) => product.featured).sort((a,b) => (a.featuredOrder??a.sortOrder)-(b.featuredOrder??b.sortOrder));}
export function visibleFeatured(data:Content) {return selectedFeatured(data).filter((product) => eligibleFeatured(data,product)).slice(0,HOMEPAGE_PRODUCT_LIMIT);}
export function setFeaturedOrder(data:Content,ids:string[]) {
  data.products.forEach((product) => {product.featured=ids.includes(product.id);if(product.featured)product.featuredOrder=ids.indexOf(product.id);else delete product.featuredOrder;});
}
/** Validate changed selections without silently rewriting legacy records. */
export function validateProductChanges(previous:Content,next:Content) {
  const before=selectedFeatured(previous);const after=selectedFeatured(next);
  const signature=(products:Product[]) => JSON.stringify(products.map((product) => [product.id,product.featuredOrder??null]));
  const eligibilityChanged=after.some((product) => {const old=previous.products.find((item) => item.id===product.id);return old&&eligibleFeatured(previous,old)!==eligibleFeatured(next,product);});
  if(signature(before)!==signature(after)||eligibilityChanged){
    if(after.length>HOMEPAGE_PRODUCT_LIMIT)throw Error(`Bitte wähle höchstens ${HOMEPAGE_PRODUCT_LIMIT} Startseitenprodukte aus.`);
    if(after.some((product) => !eligibleFeatured(next,product)))throw Error("Startseitenprodukte und ihre Kategorien müssen veröffentlicht sein.");
  }
  for(const product of next.products){
    const old=previous.products.find((item) => item.id===product.id);
    if(JSON.stringify(product.variants)!==JSON.stringify(old?.variants)&&product.variants.some((variant) => !variant.name.trim()))throw Error(`Bitte gib jeder Variante von „${product.name||"Neues Produkt"}“ eine Größe oder Bezeichnung.`);
  }
}
