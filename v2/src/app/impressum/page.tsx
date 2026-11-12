import type { Metadata } from "next";
import Link from "next/link";
import { LegalContact, LegalPage } from "@/components/public/LegalPage";

export const metadata: Metadata = {
  title: "Impressum | Golesta Beauty",
  robots: { index: false, follow: false },
};

export default function ImpressumPage() {
  return <LegalPage title="Impressum">
    <section className="space-y-3" aria-labelledby="salon-kontakt">
      <h2 id="salon-kontakt" className="font-serif text-2xl">Salon und Kontakt</h2>
      <p>Friseursalon &amp; Beauty Concept in Villach. Die folgenden Kontaktdaten stammen aus dem bestehenden Salonauftritt.</p>
      <LegalContact />
    </section>
    <section className="space-y-3" aria-labelledby="impressum-freigabe">
      <h2 id="impressum-freigabe" className="font-serif text-2xl">Rechtliche Angaben noch nicht freigegeben</h2>
      <p>Die rechtliche Bezeichnung des Unternehmens beziehungsweise der Inhaberin oder des Inhabers ist noch zu bestätigen. Dasselbe gilt für die zutreffenden Gewerbe-, Kammer-, Aufsichts-, Register- und Umsatzsteuerangaben sowie die medienrechtliche Offenlegung.</p>
      <p>Die Salonbezeichnung und die Kontaktangaben ersetzen diese Bestätigung nicht. Dieser Entwurf darf deshalb noch nicht als vollständiges Impressum veröffentlicht werden.</p>
    </section>
    <p><Link href="/datenschutz" className="text-[#684b28] underline underline-offset-4">Informationen zum Datenschutz</Link></p>
  </LegalPage>;
}
