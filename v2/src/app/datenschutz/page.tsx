import type { Metadata } from "next";
import Link from "next/link";
import { LegalContact, LegalPage } from "@/components/public/LegalPage";

export const metadata: Metadata = {
  title: "Datenschutz | Golesta Beauty",
  robots: { index: false, follow: false },
};

export default function DatenschutzPage() {
  return <LegalPage title="Datenschutz">
    <section className="space-y-3" aria-labelledby="datenschutz-kontakt">
      <h2 id="datenschutz-kontakt" className="font-serif text-2xl">Kontakt und Verantwortlichkeit</h2>
      <p>Für Fragen zu diesem Internetauftritt erreichen Sie den Salon unter den folgenden Kontaktdaten. Die rechtlich verantwortliche Person beziehungsweise Gesellschaft muss vor Freigabe dieser Erklärung bestätigt werden.</p>
      <LegalContact />
    </section>
    <section className="space-y-3" aria-labelledby="hosting">
      <h2 id="hosting" className="font-serif text-2xl">Bereitstellung der Website – Vercel</h2>
      <p>Die Website wird über Vercel bereitgestellt. Beim Abruf von Seiten, Bildern und Schnittstellen fallen technische Verbindungs- und Anfragedaten an, insbesondere die IP-Adresse, der Zeitpunkt, die angeforderte Adresse und Angaben zu Browser und Gerät. Diese Daten werden für die Auslieferung und den sicheren Betrieb verarbeitet.</p>
      <p>Die Schriftarten werden mit der Website ausgeliefert. Der Browser muss sie nicht von Google Fonts abrufen.</p>
    </section>
    <section className="space-y-3" aria-labelledby="firebase">
      <h2 id="firebase" className="font-serif text-2xl">Inhalte und Anmeldung – Google Firebase</h2>
      <p>Saloninformationen und Leistungen werden serverseitig aus Cloud Firestore geladen. Dort liegen auch Verwaltungsberechtigungen und veröffentlichte Team- und Galeriedaten.</p>
      <p>Firebase Authentication prüft die Anmeldung freigeschalteter Mitarbeitender. Dabei werden unter anderem die E-Mail-Adresse, die Konto-ID und Anmeldeinformationen verarbeitet. Die Anmeldung kann im Browser über IndexedDB, lokalen Speicher oder Sitzungsspeicher erhalten bleiben; andernfalls wird eine Sitzung im Arbeitsspeicher verwendet.</p>
      <p>Die Firebase-Anmeldebibliothek wird derzeit auch mit öffentlichen Seiten initialisiert. Technische Speicher- und Verbindungszugriffe sind deshalb nicht pauschal auf die Verwaltungsseiten beschränkt. Daraus folgt keine Anmeldung eines Besuchers und kein öffentliches Kundenkonto.</p>
      <p>Die Verwaltung speichert außerdem Rollen, Freigabestatus und Änderungsinformationen wie Konto-ID und Zeitpunkt. Sofern bereits Produktbewertungen gespeichert sind, können berechtigte Mitarbeitende diese weiterhin zur Moderation aufrufen, einschließlich Name, Bewertung, Kommentar und Erstellungszeitpunkt. Neue öffentliche Produktbewertungen sind derzeit deaktiviert.</p>
    </section>
    <section className="space-y-3" aria-labelledby="bilder">
      <h2 id="bilder" className="font-serif text-2xl">Bilder – Cloudinary und Firebase Storage</h2>
      <p>Freigeschaltete Mitarbeitende können Bilder hochladen. Der Server verarbeitet sie zu WebP-Dateien und speichert sie bei Cloudinary. Die Uploadbegrenzung wird anhand der Konto-ID und eines Zeitfensters in Firestore geführt.</p>
      <p>Die Bildauslieferung unterstützt außerdem bereits gespeicherte Firebase-Storage-Adressen. Veröffentlichte Bilder werden über die Bildoptimierung der Website geladen, die das Bild gegebenenfalls beim jeweiligen Speicherdienst abruft. Welche Personenbilder veröffentlicht werden dürfen und wie lange sie gespeichert bleiben, muss der Salon festlegen.</p>
    </section>
    <section className="space-y-3" aria-labelledby="kontakt-links">
      <h2 id="kontakt-links" className="font-serif text-2xl">Kontakt und externe Links</h2>
      <p>Telefon, E-Mail und WhatsApp dienen der direkten Kontaktaufnahme. Wenn Sie einen solchen Link öffnen, übernimmt die gewählte Anwendung beziehungsweise der jeweilige Anbieter die weitere Kommunikation. Bei WhatsApp können insbesondere Ihre Telefonnummer, Nachrichten und Verbindungsdaten verarbeitet werden.</p>
      <p>Links zu Instagram, Google Maps und Google-Bewertungen sowie vom Salon ergänzte Social-Media-Links führen zu externen Angeboten. Karten und Social-Media-Feeds sind nicht als Widgets eingebettet. Nach dem Öffnen eines externen Angebots gelten auch die Datenschutzinformationen seines Anbieters.</p>
      <p>Die Website bietet derzeit keinen öffentlichen Produktkatalog, keine Produktbewertungen, kein Kundenkonto und keinen Online-Gutscheinkauf. Gutscheine können direkt im Salon gekauft werden.</p>
    </section>
    <section className="space-y-3" aria-labelledby="speicher">
      <h2 id="speicher" className="font-serif text-2xl">Browserspeicher, Analyse und Zugriffsschutz</h2>
      <p>In die geprüfte Website sind keine eigenen Analyse- oder Werbeskripte eingebunden. Technische Hosting- und Anmeldedienste verarbeiten dennoch Daten. Eine pauschale Zusicherung, dass keine Cookies oder vergleichbare Speichertechniken verwendet werden, wird nicht gegeben.</p>
      <p>Auf geschützten Bereitstellungsadressen kann vor dem Websitezugriff zusätzlich die Vercel-Zugangskontrolle erscheinen. Sie ist von der Anmeldung zur Salonverwaltung getrennt.</p>
    </section>
    <section className="space-y-3" aria-labelledby="rechte">
      <h2 id="rechte" className="font-serif text-2xl">Ihre Datenschutzrechte</h2>
      <p>Unter den jeweiligen gesetzlichen Voraussetzungen haben Sie Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Soweit eine Verarbeitung auf einer Einwilligung beruht, kann diese für die Zukunft widerrufen werden.</p>
      <p>Sie können sich auch bei der <a href="https://www.dsb.gv.at/" target="_blank" rel="noopener noreferrer" className="text-[#684b28] underline underline-offset-4">österreichischen Datenschutzbehörde</a> beschweren.</p>
    </section>
    <section className="space-y-3" aria-labelledby="datenschutz-freigabe">
      <h2 id="datenschutz-freigabe" className="font-serif text-2xl">Vor Veröffentlichung zu bestätigen</h2>
      <p>Verantwortlichkeit, Rechtsgrundlagen je Verarbeitung, konkrete Vertragspartner, Aufbewahrungs- und Löschfristen sowie etwaige Übermittlungen außerhalb des Europäischen Wirtschaftsraums und deren Absicherung sind noch rechtlich freizugeben. Einwilligungen, abgeschlossene Auftragsverarbeitungsverträge oder bestimmte Speicherorte werden hier nicht als bestätigt dargestellt.</p>
      <p>Auch die Abläufe für E-Mail und WhatsApp, Veröffentlichungsrechte für Personenbilder und gegebenenfalls erforderliche Einwilligungen gehören zu dieser Freigabe. Bis dahin bleibt diese Seite ausdrücklich ein Entwurf.</p>
    </section>
    <p><Link href="/impressum" className="text-[#684b28] underline underline-offset-4">Zum Impressum</Link></p>
  </LegalPage>;
}
