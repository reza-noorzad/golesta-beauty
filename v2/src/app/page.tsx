
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useContent } from "@/lib/content-client";
import { formatProductPrice } from "@/data/products";
import ServicesGrid from "@/components/ServicesGrid";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import PriceDisplay from "@/components/PriceDisplay";

const navigation = [
  { label: "Startseite", href: "#start" },
  { label: "Leistungen", href: "#leistungen" },
  { label: "Produkte", href: "#produkte" },
  { label: "Team", href: "#team" },
  { label: "Galerie", href: "#galerie" },
  { label: "Gutschein", href: "#gutschein" },
  { label: "Kontakt", href: "#kontakt" },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#a98348]">
        {eyebrow}
      </p>

      <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
        {title}
      </h2>

      {description && (
        <p className="mt-5 leading-7 text-[#74685d]">
          {description}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const { data, error } = useContent();
  const siteData = {...data.settings, gutscheinText:data.voucher.description};
  const team = data.team;
  const [showAllGallery, setShowAllGallery] = useState(false);
  const chosenGallery = data.gallery.filter(g => g.homepage).slice(0, data.settings.galleryLimit || 6);
  const shownGallery = showAllGallery ? data.gallery : chosenGallery;
  const gallery = shownGallery.map(g => g.image);
  const featuredProducts = data.products.filter(p=>p.featured).slice(0,3);
  const whatsappUrl = `https://wa.me/${siteData.whatsapp}?text=${encodeURIComponent("Hallo Golesta Beauty, ich möchte einen Termin vereinbaren.")}`;
  const mapsUrl = siteData.routeUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteData.address)}`;

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<number | null>(null);

  useEffect(() => {
    if (activeImage === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveImage(null);
      }

      if (event.key === "ArrowRight") {
        setActiveImage((current) =>
          current === null ? null : (current + 1) % gallery.length
        );
      }

      if (event.key === "ArrowLeft") {
        setActiveImage((current) =>
          current === null
            ? null
            : (current - 1 + gallery.length) % gallery.length
        );
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeImage, gallery.length]);

  return (
    <main className="min-h-screen overflow-x-clip bg-[#faf7f2] text-[#332b26]">
      {error && <p role="status" className="p-3 text-center">{error}</p>}
      <AnnouncementBanner announcements={data.announcements}/>{/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#e9e0d3] bg-[#faf7f2]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a
            href="#start"
            className="flex min-w-0 items-center gap-2 sm:gap-3"
            onClick={() => setMenuOpen(false)}
          >
            <Image
              src={siteData.logo || "/Logo.PNG"}
              alt="Golesta Beauty"
              width={52}
              height={52}
              className="h-11 w-11 shrink-0 object-contain sm:h-13 sm:w-13"
            />

            <span className="truncate text-sm font-semibold tracking-[0.12em] sm:text-lg">
              {siteData.salonName || "GOLESTA BEAUTY"}
            </span>
          </a>

          <nav
            aria-label="Hauptnavigation"
            className="hidden items-center gap-5 text-sm lg:flex"
          >
            {navigation.slice(1).map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-[#a98348]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full bg-[#a98348] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#8d6d3f] sm:inline-flex"
            >
              Termin anfragen
            </a>

            <button
              type="button"
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e9e0d3] text-2xl lg:hidden"
            >
              {menuOpen ? "×" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile Navigation"
            className="border-t border-[#e9e0d3] bg-[#faf7f2] px-5 py-4 lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col">
              {navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-[#e9e0d3] py-3 text-sm"
                >
                  {item.label}
                </a>
              ))}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="mt-4 rounded-full bg-[#a98348] px-6 py-3 text-center text-sm text-white"
              >
                {siteData.appointmentLabel || "Termin vereinbaren"}
              </a>
            </div>
          </nav>
        )}
      </header>

      {/* HERO */}
      <section
        id="start"
        className="scroll-mt-24 mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:gap-14 lg:py-24"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#a98348] sm:text-sm">
            {siteData.heroEyebrow || "Beauty Salon · Villach"}
          </p>

          <h1 className="mt-7 font-serif text-[2.75rem] leading-[1.12] sm:text-5xl lg:text-[3.4rem] xl:text-[3.9rem]">
            {siteData.heroTitle || "Deine Schönheit."}
            <span className="mt-2 block italic text-[#a98348]">
              {siteData.heroAccent || "Unsere Leidenschaft."}
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-base leading-8 text-[#74685d] sm:text-lg">
            {siteData.heroDescription || "Willkommen bei Golesta Beauty in Villach."}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#a98348] px-7 py-4 text-sm font-medium text-white transition hover:bg-[#8d6d3f]"
            >
              {siteData.appointmentLabel || "Termin vereinbaren"}
            </a>

            <a
              href="#leistungen"
              className="rounded-full border border-[#a98348] px-7 py-4 text-sm font-medium text-[#8b6a3c] transition hover:bg-[#eee5d9]"
            >
              Leistungen entdecken
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-t-[140px] rounded-b-2xl bg-[#e8ddd0] sm:rounded-t-[180px]">
          <Image
            src={siteData.heroImage || "/images/gallery-01.jpg"}
            alt="Golesta Beauty Salon in Villach"
            width={800}
            height={950}
            priority
            className="h-[380px] w-full object-cover sm:h-[500px] lg:h-[580px]"
          />
        </div>
      </section>

      {/* SERVICES */}
      <ServicesGrid heading={siteData.servicesHeading} description={siteData.servicesDescription}/>

      {/* PRODUCTS */}
      <section
        id="produkte"
        className="scroll-mt-24 px-5 py-20 sm:px-6 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Beauty Collection"
            title={siteData.productHeading || "Unsere Produkte"}
            description={siteData.productDescription || "Entdecke unsere ausgewählten Beauty-Produkte."}
          />

          {featuredProducts.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/produkte/${product.slug}`}
                  className="group overflow-hidden rounded-2xl border border-[#eee5d9] bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/5] bg-[#eee5d9]">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#9c8d7b]">
                        Kein Bild verfügbar
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-serif text-2xl">
                      {product.name}
                    </h3>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#74685d]">
                      {product.description}
                    </p>

                    <PriceDisplay className="mt-5" product={product} promotions={data.promotions}/>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-[#e8ddd0] bg-white p-10 text-center sm:p-14">
              <h3 className="font-serif text-2xl">
                Unsere Beauty Collection kommt bald
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#74685d]">
                Unser Sortiment wird hier in Kürze vorgestellt.
              </p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/produkte"
              className="inline-flex rounded-full border border-[#a98348] px-8 py-3.5 text-sm font-medium text-[#8b6a3c] transition hover:bg-[#eee5d9]"
            >
              Alle Produkte ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section
        id="team"
        className="scroll-mt-24 bg-white px-5 py-16 sm:px-6 lg:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Die Menschen hinter Golesta"
            title={siteData.teamHeading || "Unser Team"}
          />

          <div className="mx-auto mt-12 max-w-5xl space-y-10">
            {team.map(member => <article key={member.id} className="grid items-start gap-7 rounded-2xl border border-[#e8ddd0] bg-[#faf7f2] p-5 sm:p-7 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-2xl bg-[#eee5d9]">{member.image ? <Image src={member.image} alt={member.name} width={500} height={550} className="aspect-[4/5] w-full object-cover"/> : <div className="flex aspect-[4/5] items-center justify-center text-[#74685d]">Kein Foto</div>}</div>
              <div><h3 className="font-serif text-3xl">{member.name}</h3>
                {member.role && <p className="mt-2 font-semibold text-[#9c783f]">{member.role}</p>}
                {member.experience && <p className="mt-4 text-sm font-medium text-[#74685d]">{member.experience}</p>}
                {member.bio && <p className="mt-4 whitespace-pre-line leading-8 text-[#74685d]">{member.bio}</p>}
                {!!member.specialties?.length && <div className="mt-5"><h4 className="mb-3 font-semibold">Fachgebiete & Spezialisierungen</h4><ul className="space-y-2 text-sm leading-7 text-[#74685d]">{member.specialties.map((item,index) => <li key={index} className="flex gap-2"><span className="text-[#a98348]">✧</span><span>{item}</span></li>)}</ul></div>}
              </div>
            </article>)}
          </div>

          <p className="mt-9 text-center text-sm text-[#74685d]">
            {siteData.teamFooter || "Persönlich, professionell und mit Leidenschaft für Beauty."}
          </p>
        </div>
      </section>

      {/* GALLERY */}
      <section
        id="galerie"
        className="scroll-mt-24 bg-[#faf7f2] px-5 py-20 sm:px-6 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Einblicke in unsere Arbeit"
            title={siteData.galleryHeading || "Unsere Galerie"}
            description={siteData.galleryDescription || "Entdecke unsere Arbeiten und lass dich inspirieren."}
          />

          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {gallery.map(
              (src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Galeriebild ${index + 1} vergrößern`}
                  className="group overflow-hidden rounded-xl bg-[#e8ddd0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a98348]"
                >
                  <Image
                    src={src}
                    alt={shownGallery[index]?.alt || "Golesta Beauty"}
                    width={500}
                    height={600}
                    sizes="(max-width: 767px) 50vw, 33vw"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
              )
            )}
          </div>

          {data.gallery.length > chosenGallery.length && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllGallery((current) => !current)}
                className="rounded-full border border-[#a98348] px-8 py-3.5 text-sm font-medium text-[#8b6a3c] transition hover:bg-[#eee5d9]"
              >
                {showAllGallery
                  ? "Weniger anzeigen"
                  : "Mehr Bilder ansehen"}
              </button>
            </div>
          )}

          <p className="mt-7 text-center text-sm leading-7 text-[#74685d]">
            Mehr Einblicke auf Instagram:{" "}
            <a
              href={siteData.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#9c783f] underline decoration-[#c9b08b] underline-offset-4 transition-colors hover:text-[#6f512c]"
            >
              @golesta.beauty
            </a>
          </p>
        </div>
      </section>

      {/* GIFT CARD */}
      {data.voucher.published && <section
        id="gutschein"
        className="scroll-mt-24 bg-[#eae0d3] px-5 py-20 text-center sm:px-6"
      >
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9c783f]">
            Freude schenken
          </p>

          <h2 className="mt-4 font-serif text-4xl md:text-5xl">
            {siteData.voucherHeading || "Gutschein"}
          </h2>

          <p className="mx-auto mt-6 max-w-xl leading-7 text-[#74685d]">
            {siteData.gutscheinText}
          </p><div className="mt-5 flex flex-wrap justify-center gap-3">{data.voucher.values.map((v,i)=><span className="rounded-full border px-4 py-2" key={i}>{formatProductPrice(v)}</span>)}</div>
        </div>
      </section>}

      {/* CONTACT */}
      <section
        id="kontakt"
        className="scroll-mt-24 bg-white px-5 py-20 sm:px-6 lg:py-24"
      >
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          {/* LEFT: CONTACT & DIRECTIONS */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#a98348]">
              Wir freuen uns auf dich
            </p>

            <h2 className="mt-4 font-serif text-4xl">
              {siteData.contactHeading || "Kontakt & Anfahrt"}
            </h2>

            <p className="mt-7 leading-7">
              {siteData.address}
            </p>

            <a
              href={`tel:${siteData.phone.replaceAll(" ", "")}`}
              className="mt-4 block text-[#8b6a3c]"
            >
              {siteData.phone}
            </a>

            <a
              href={`mailto:${siteData.email}`}
              className="mt-3 block break-all text-[#8b6a3c]"
            >
              {siteData.email}
            </a>

            <a
              href={siteData.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-[#8b6a3c]"
            >
              Instagram
            </a>

            {(siteData.socials || []).filter(x => x.published).map(social => <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="mt-3 block text-[#8b6a3c]">{social.name}</a>)}

            <a
              href={siteData.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-[#8b6a3c]"
            >
              Google Bewertung schreiben
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[#8b6a3c] underline underline-offset-4"
            >
              Route anzeigen
            </a>
          </div>

          {/* RIGHT: OPENING HOURS ONLY */}
          <div className="min-w-0 rounded-2xl bg-[#faf7f2] p-6 sm:p-9">
            <h3 className="font-serif text-2xl">
              Öffnungszeiten
            </h3>

            <div className="mt-6 space-y-4 text-sm">{siteData.hours.map((h,i)=><p key={i} className="flex flex-wrap justify-between gap-2"><span>{h.label}</span><span className="shrink-0 whitespace-nowrap">{h.value}</span></p>)}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#332b26] px-5 py-10 text-center text-sm text-white/80">
        <p>© 2026 Golesta Beauty · Villach</p>
      </footer>

      {/* GALLERY LIGHTBOX */}
      {activeImage !== null && gallery[activeImage] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galeriebild anzeigen"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActiveImage(null)}
        >
          <button
            type="button"
            aria-label="Galerie schließen"
            onClick={() => setActiveImage(null)}
            className="absolute top-5 right-5 z-10 rounded-full bg-white/15 px-4 py-2 text-2xl text-white"
          >
            ×
          </button>

          <button
            type="button"
            aria-label="Vorheriges Bild"
            onClick={(event) => {
              event.stopPropagation();
              setActiveImage(
                (activeImage - 1 + gallery.length) % gallery.length
              );
            }}
            className="absolute left-3 z-10 rounded-full bg-white/15 px-4 py-3 text-2xl text-white sm:left-6"
          >
            ‹
          </button>

          <div
            className="relative h-[80vh] w-[80vw]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={gallery[activeImage]}
              alt={`Golesta Beauty Galerie ${activeImage + 1}`}
              fill
              sizes="80vw"
              className="object-contain"
            />
          </div>

          <button
            type="button"
            aria-label="Nächstes Bild"
            onClick={(event) => {
              event.stopPropagation();
              setActiveImage(
                (activeImage + 1) % gallery.length
              );
            }}
            className="absolute right-3 z-10 rounded-full bg-white/15 px-4 py-3 text-2xl text-white sm:right-6"
          >
            ›
          </button>
        </div>
      )}
    </main>
  );
}
