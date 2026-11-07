import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PUBLIC_CATALOG_ENABLED } from "@/lib/public-config";
import ProductDetail from "@/components/public/ProductDetail";
export const metadata: Metadata = {title:"Produktdetails | Golesta Beauty"};
export default function ProductPage(props:{params:Promise<{slug:string}>}) {
  if(!PUBLIC_CATALOG_ENABLED)redirect("/produkte");
  return <ProductDetail {...props}/>;
}
