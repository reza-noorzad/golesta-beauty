
"use client";

import { useMemo, useState } from "react";
import ServicesAccordion from "@/components/ServicesAccordion";
import { usePublicSite } from "@/components/public/PublicSite";

export default function LeistungenPage() {
  const { data, services, servicesError } = usePublicSite();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("de");

    return services
      .filter(
        (category) =>
          selectedCategory === "all" ||
          category.id === selectedCategory
      )
      .map((category) => ({
        ...category,
        items: category.items.filter(({ name }) =>
          name.toLocaleLowerCase("de").includes(search)
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [services, query, selectedCategory]);

  const resultCount = categories.reduce(
    (total, category) => total + category.items.length,
    0
  );

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#332b26]">
      <section className="px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#a98348]">
              Golesta Beauty · Villach
            </p>

            <h1 className="mt-5 font-serif text-4xl sm:text-5xl">
              Leistungen & Preise
            </h1>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-[#74685d]">
              Alle Behandlungen und Preise auf einen Blick.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Leistung suchen
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Leistung suchen ..."
                className="w-full rounded-xl border border-[#e3d7c8] bg-white px-4 py-3.5 outline-none focus:border-[#a98348]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Kategorie
              </span>
              <select
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(event.target.value)
                }
                className="w-full rounded-xl border border-[#e3d7c8] bg-white px-4 py-3.5 outline-none focus:border-[#a98348]"
              >
                <option value="all">Alle Kategorien</option>
                {services.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p
            aria-live="polite"
            className="mt-7 text-center text-sm text-[#74685d]"
          >
            {resultCount} {resultCount === 1 ? "Leistung gefunden" : "Leistungen gefunden"}
          </p>

          {servicesError && (
            <p role="status" className="mt-4 text-center text-sm text-[#74685d]">
              Die aktuellen Leistungen können gerade nicht geladen werden. Wir zeigen dir
              die zuletzt verfügbaren Informationen. Bitte bestätige die Preise bei der Terminvereinbarung.
            </p>
          )}

          <div className="mt-10">
            {categories.length > 0 ? (
              <ServicesAccordion
                key={`${query}-${selectedCategory}`}
                categories={categories}
                expandResults={Boolean(query.trim()) || selectedCategory !== "all"}
              />
            ) : (
              <div className="rounded-2xl border border-[#eee5d9] bg-white p-10 text-center">
                <p className="font-serif text-2xl">
                  Keine Leistungen gefunden
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-5 text-sm font-medium text-[#8b6a3c] underline underline-offset-4"
                >
                  Filter zurücksetzen
                </button>
              </div>
            )}
          </div>

          <div className="mt-14 text-center">
            <p className="mb-5 text-[#74685d]">
              Du möchtest einen Termin vereinbaren?
            </p>
            <a
              href={`https://wa.me/${data.settings.whatsapp}?text=${encodeURIComponent(
                "Hallo Golesta Beauty, ich möchte einen Termin vereinbaren."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full bg-[#a98348] px-8 py-4 text-sm font-medium text-white"
            >
              Termin per WhatsApp anfragen
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
