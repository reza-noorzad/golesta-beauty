"use client";
import Link from "next/link";
import { contactLinks } from "@/lib/public-content";
import { usePublicSite } from "./PublicSite";
export default function PublicFooter() {
  const {data}=usePublicSite();const settings=data.settings;const links=contactLinks(settings);
  return <footer className="public-footer"><div className="public-footer-inner"><div><p className="public-footer-brand">{settings.salonName||"Golesta Beauty"}</p><p>{settings.address}</p><p className="public-footer-copyright">{settings.footerText||"© Golesta Beauty · Villach"}</p></div><nav aria-label="Weitere Seiten"><Link href="/leistungen">Leistungen & Preise</Link><Link href="/produkte">Unsere Produkte</Link>{data.voucher.published&&<Link href="/#gutschein">Gutschein</Link>}<Link href="/#kontakt">Kontakt & Anfahrt</Link><Link href="/impressum">Impressum</Link><Link href="/datenschutz">Datenschutz</Link></nav><div className="public-footer-contact"><a href={links.phone}>{settings.phone}</a><a href={`mailto:${settings.email}`}>{settings.email}</a><a href={links.whatsapp} target="_blank" rel="noopener noreferrer">Kontakt per WhatsApp</a></div></div></footer>;
}
