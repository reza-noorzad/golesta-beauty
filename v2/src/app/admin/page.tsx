import Link from "next/link";

const sections = [
  ["Leistungen & Preise", "/admin/leistungen", "Kategorien, Reihenfolge und Preise"],
  ["Produkte", "/admin/produkte", "Produkte und Produktkategorien"],
  ["Galerie", "/admin/galerie", "Bilder und Reihenfolge"],
  ["Team", "/admin/team", "Mitarbeiter und Fotos"],
  ["Gutschein", "/admin/gutschein", "Texte und Gutscheinwerte"],
  ["Einstellungen", "/admin/einstellungen", "Kontakt und Öffnungszeiten"],
];
export default function AdminHome() {
  return <>
    <p className="text-xs uppercase tracking-[0.25em] text-[#a98348]">Dashboard</p>
    <h1 className="mt-3 font-serif text-4xl">Übersicht</h1>
    <p className="mt-4 text-[#74685d]">Wähle einen Bereich. Die Bearbeitungsfunktionen werden nach der sicheren Datenbankanbindung aktiviert.</p>
    <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sections.map(([name, href, desc]) => <Link key={href} href={href} className="rounded-2xl border border-[#e8ddd0] bg-white p-6 transition hover:border-[#a98348] hover:shadow-sm">
        <h2 className="font-serif text-xl">{name}</h2><p className="mt-3 text-sm leading-6 text-[#74685d]">{desc}</p>
      </Link>)}
    </div>
  </>;
}
