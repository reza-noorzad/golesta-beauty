export default function Page() {
  return <section>
    <p className="text-xs uppercase tracking-[0.25em] text-[#a98348]">Admin / Vorschau</p>
    <h1 className="mt-3 font-serif text-4xl">Produkte</h1>
    <p className="mt-5 max-w-2xl leading-7 text-[#74685d]">Hier werden Produkte, Kategorien, Bilder, Preise und Veröffentlichungsstatus verwaltet.</p>
    <div className="mt-9 rounded-2xl border border-[#e8ddd0] bg-white p-7">
      <h2 className="font-serif text-2xl">Verwaltung in Vorbereitung</h2>
      <p className="mt-3 text-sm leading-7 text-[#74685d]">Diese Ansicht ist noch nicht mit Firebase verbunden. Änderungen sind derzeit nicht möglich. Nach Einrichtung von Anmeldung, Rollen und Datenbank werden die Bearbeitungsfunktionen hier freigeschaltet.</p>
    </div>
  </section>;
}
