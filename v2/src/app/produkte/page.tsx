
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
} from "@/data/products";

import { useContent } from "@/lib/content-client";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import PriceDisplay from "@/components/PriceDisplay";
import { productPrice } from "@/lib/pricing";

const PAGE_SIZE = 9;

export default function ProductsPage() {
 const {data, loading, error}=useContent();
 const allProducts=data.products;
 const categories=data.categories;
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("de");

    const result = allProducts.filter((product) => {
      const matchesSearch =
        product.name.toLocaleLowerCase("de").includes(query) ||
        product.description.toLocaleLowerCase("de").includes(query);

      const matchesCategory =
        categoryId === "all" ||
        product.categoryId === categoryId;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "price-asc") {
      result.sort(
        (a, b) =>
          (productPrice(a, data.promotions).current ?? Infinity) - (productPrice(b, data.promotions).current ?? Infinity)
      );
    }

    if (sortBy === "price-desc") {
      result.sort(
        (a, b) =>
          (productPrice(b, data.promotions).current ?? -Infinity) - (productPrice(a, data.promotions).current ?? -Infinity)
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name, "de")
      );
    }

    return result;
  }, [search, categoryId, sortBy, allProducts, data.promotions]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  function resetVisibleCount() {
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#332b26]">
      <AnnouncementBanner announcements={data.announcements}/>
      <header className="border-b border-[#e9e0d3] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.12em] sm:text-lg"
          >
            GOLESTA BEAUTY
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-[#8b6a3c] underline underline-offset-4"
          >
            Zur Startseite
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#a98348]">
            Beauty Collection
          </p>

          <h1 className="mt-5 font-serif text-4xl sm:text-5xl">
            Unsere Produkte
          </h1>

          <p className="mt-5 leading-7 text-[#74685d]">
            Entdecke unsere ausgewählten Beauty-Produkte.
          </p>
        </div>

        {loading ? <p role="status" className="mt-10">Produkte werden geladen …</p> : error ? <p role="alert" className="mt-10">{error}</p> : allProducts.length === 0 ? (
          <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-[#e8ddd0] bg-white px-6 py-16 text-center sm:px-12">
            <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-[#e8ddd0] text-2xl text-[#a98348]">
              ✧
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl">
              Unsere Produktauswahl folgt in Kürze
            </h2>

            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#74685d]">
              Wir stellen unsere Beauty-Produkte bald hier vor.
              Bei Fragen zu unserem Sortiment kannst du uns
              gerne kontaktieren.
            </p>

            <Link
              href="/#kontakt"
              className="mt-8 inline-flex rounded-full border border-[#a98348] px-7 py-3.5 text-sm font-medium text-[#8b6a3c] transition hover:bg-[#eee5d9]"
            >
              Kontakt
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Produkte suchen
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    resetVisibleCount();
                  }}
                  placeholder="Produktname eingeben ..."
                  className="w-full rounded-xl border border-[#e3d7c8] bg-white px-4 py-3.5 outline-none focus:border-[#a98348]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Kategorie
                </span>

                <select
                  value={categoryId}
                  onChange={(event) => {
                    setCategoryId(event.target.value);
                    resetVisibleCount();
                  }}
                  className="w-full rounded-xl border border-[#e3d7c8] bg-white px-4 py-3.5 outline-none focus:border-[#a98348]"
                >
                  <option value="all">Alle Kategorien</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Sortieren
                </span>

                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value);
                    resetVisibleCount();
                  }}
                  className="w-full rounded-xl border border-[#e3d7c8] bg-white px-4 py-3.5 outline-none focus:border-[#a98348]"
                >
                  <option value="default">Standard</option>
                  <option value="name">Name A–Z</option>
                  <option value="price-asc">Preis aufsteigend</option>
                  <option value="price-desc">Preis absteigend</option>
                </select>
              </label>
            </div>

            <p
              aria-live="polite"
              className="mt-8 text-sm text-[#74685d]"
            >
              {filteredProducts.length} Produkte gefunden
            </p>

            {filteredProducts.length > 0 ? (
              <>
                <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleProducts.map((product) => (
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
                        <h2 className="font-serif text-2xl">
                          {product.name}
                        </h2>

                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#74685d]">
                          {product.shortDescription || product.description}
                        </p>

                        <PriceDisplay className="mt-5" product={product} promotions={data.promotions}/>
                      </div>
                    </Link>
                  ))}
                </div>

                {visibleCount < filteredProducts.length && (
                  <div className="mt-12 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount(
                          (current) => current + PAGE_SIZE
                        )
                      }
                      className="rounded-full border border-[#a98348] px-8 py-4 text-sm font-medium text-[#8b6a3c] transition hover:bg-[#eee5d9]"
                    >
                      Mehr laden
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-10 rounded-2xl border border-[#eee5d9] bg-white p-10 text-center">
                <h2 className="font-serif text-2xl">
                  Keine Produkte gefunden
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategoryId("all");
                    setSortBy("default");
                    resetVisibleCount();
                  }}
                  className="mt-5 text-sm font-medium text-[#8b6a3c] underline underline-offset-4"
                >
                  Filter zurücksetzen
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <footer className="bg-[#332b26] px-5 py-9 text-center text-sm text-white/80">
        © 2026 Golesta Beauty · Villach
      </footer>
    </main>
  );
}
