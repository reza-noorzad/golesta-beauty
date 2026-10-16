
export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number | null;
  currency: "EUR";
  categoryId: string;
  images: string[];
  published: boolean;
  featured: boolean;
  sortOrder: number;
};

export type ProductCategory = {
  id: string;
  name: string;
  sortOrder: number;
  published: boolean;
};

// Temporary local data.
// Later, the Admin Panel will manage this data in Firestore.

export const productCategories: ProductCategory[] = [];

export const products: Product[] = [];

export function getPublishedProducts(): Product[] {
  return products
    .filter((product) => product.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPublishedCategories(): ProductCategory[] {
  return productCategories
    .filter((category) => category.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getProductBySlug(
  slug: string
): Product | undefined {
  return getPublishedProducts().find(
    (product) => product.slug === slug
  );
}

export function formatProductPrice(
  price: number | null,
  currency: "EUR" = "EUR"
): string {
  if (price === null) {
    return "Preis auf Anfrage";
  }

  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency,
  }).format(price);
}
