
"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import siteData from "@/data/site-data.json";

import {
  getProductBySlug,
  formatProductPrice,
} from "@/data/products";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default function ProductDetailPage({ params }: Props) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);

  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    notFound();
  }

  const message =
    `Hallo Golesta Beauty, ich interessiere mich für ` +
    `das Produkt "${product.name}".`;

  const whatsappUrl =
    `https://wa.me/${siteData.whatsapp}?text=` +
    encodeURIComponent(message);

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#332b26]">
      <header className="border-b border-[#e9e0d3] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.12em] sm:text-lg"
          >
            GOLESTA BEAUTY
          </Link>

          <Link
            href="/produkte"
            className="text-sm font-medium text-[#8b6a3c] underline underline-offset-4"
          >
            Alle Produkte
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:py-20">
        <Link
          href="/produkte"
          className="text-sm text-[#8b6a3c] underline underline-offset-4"
        >
          Zurück zu den Produkten
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#eee5d9]">
              {product.images[activeImage] ? (
                <Image
                  src={product.images[activeImage]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#9c8d7b]">
                  Kein Bild verfügbar
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Produktbild ${index + 1} anzeigen`}
                    aria-pressed={activeImage === index}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                      activeImage === index
                        ? "border-[#a98348]"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} – Bild ${index + 1}`}
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:pt-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[#a98348]">
              Golesta Beauty Collection
            </p>

            <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">
              {product.name}
            </h1>

            <p className="mt-6 text-2xl font-medium text-[#8b6a3c]">
              {formatProductPrice(
                product.price,
                product.currency
              )}
            </p>

            <div className="mt-8 border-t border-[#e8ddd0] pt-7">
              <h2 className="font-serif text-2xl">
                Produktbeschreibung
              </h2>

              <p className="mt-4 whitespace-pre-line leading-8 text-[#74685d]">
                {product.description}
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex rounded-full bg-[#a98348] px-8 py-4 text-sm font-medium text-white transition hover:bg-[#8d6d3f]"
            >
              Per WhatsApp anfragen
            </a>

            <p className="mt-4 text-sm leading-6 text-[#74685d]">
              Anfrage unverbindlich. Kein Online-Kauf.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-[#332b26] px-5 py-9 text-center text-sm text-white/80">
        © 2026 Golesta Beauty · Villach
      </footer>
    </main>
  );
}
