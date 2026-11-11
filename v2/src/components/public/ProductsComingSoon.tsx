import Link from "next/link";
import { PRODUCTS_COMING_SOON } from "@/lib/public-config";
export default function ProductsComingSoon() {
  return <main className="public-coming-soon"><section className="public-coming-soon-inner">
    <p className="text-xs uppercase tracking-[0.25em]">Beauty & Pflege · Golesta Beauty</p>
    <h1>{PRODUCTS_COMING_SOON.title}</h1>
    <p>{PRODUCTS_COMING_SOON.description}</p>
    <div className="public-coming-soon-actions"><Link href="/leistungen" className="public-link-button public-link-button-primary">Unsere Leistungen entdecken</Link><Link href="/#kontakt" className="public-link-button">Kontakt zum Salon</Link></div>
  </section></main>;
}
