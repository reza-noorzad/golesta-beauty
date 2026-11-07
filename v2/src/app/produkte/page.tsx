import type { Metadata } from "next";
import { PUBLIC_CATALOG_ENABLED, PRODUCTS_COMING_SOON } from "@/lib/public-config";
import ProductsComingSoon from "@/components/public/ProductsComingSoon";
import ProductCatalog from "@/components/public/ProductCatalog";
export const metadata: Metadata = {
  title: `${PUBLIC_CATALOG_ENABLED?"Unsere Produkte":PRODUCTS_COMING_SOON.title} | Golesta Beauty`,
  description: PUBLIC_CATALOG_ENABLED?"Entdecke die Beauty- und Pflegeprodukte von Golesta Beauty in Villach.":PRODUCTS_COMING_SOON.description,
};
export default function ProductsPage() {return PUBLIC_CATALOG_ENABLED?<ProductCatalog/>:<ProductsComingSoon/>;}
