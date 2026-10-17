
"use client";

import { Suspense, use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {useContent} from "@/lib/content-client";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import PriceDisplay from "@/components/PriceDisplay";
import ProductReviews from "@/components/ProductReviews";

import {
  formatProductPrice,
} from "@/data/products";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

function ProductDetailPage({ params }: Props) {
  const { slug } = use(params);
  const {data,loading,error}=useContent();
  const siteData=data.settings;
  const product = data.products.find(p=>p.slug===slug);
  const [variantId,setVariantId]=useState("");

  const [activeImage, setActiveImage] = useState(0);

  if(loading)return <p role="status" className="p-10">Produkt wird geladen …</p>;
  if(error)return <p role="alert" className="p-10">{error}</p>;
  if (!product) {
    notFound();
  }

  const variant=product.variants.find(v=>v.id===variantId);
  const message =
    `Hallo Golesta Beauty, ich interessiere mich für ` +
    `das Produkt "${product.name}"${variant ? ` – ${variant.name}` : ""}.`;

  const whatsappUrl =
    `https://wa.me/${siteData.whatsapp}?text=` +
    encodeURIComponent(message);

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

            {product.brand&&<p className="mt-3 text-sm uppercase tracking-widest text-[#a98348]">{product.brand}</p>}
            <PriceDisplay className="mt-6 text-2xl" product={product} promotions={data.promotions} variantId={variantId}/>
            {product.shortDescription&&<p className="mt-4 whitespace-pre-line text-[#74685d]">{product.shortDescription}</p>}

            {product.variants.length>0 && <label className="mt-6 block">Variante<select value={variantId} onChange={e=>setVariantId(e.target.value)} className="mt-2 w-full rounded-lg border bg-white p-3"><option value="">Bitte wählen</option>{product.variants.map(v=><option key={v.id} value={v.id} disabled={!v.available}>{v.name} – {formatProductPrice(v.price)}{!v.available?' (nicht verfügbar)':''}</option>)}</select></label>}
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
        {!!product.attributes?.length&&<section className="mt-12 rounded-2xl border border-[#e8ddd0] bg-white p-6"><h2 className="font-serif text-2xl">Produkteigenschaften</h2><dl className="mt-4 divide-y divide-[#e8ddd0]">{product.attributes.map(a=><div key={a.id} className="grid gap-2 py-3 sm:grid-cols-2"><dt className="font-medium">{a.label}</dt><dd className="whitespace-pre-line text-[#74685d]">{a.value}</dd></div>)}</dl></section>}
        {product.ingredients&&<section className="mt-8 rounded-2xl border border-[#e8ddd0] bg-white p-6"><h2 className="font-serif text-2xl">Inhaltsstoffe / INCI</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#74685d]">{product.ingredients}</p></section>}
        {product.allowReviews&&<ProductReviews product={product}/>}
      </section>

      <footer className="bg-[#332b26] px-5 py-9 text-center text-sm text-white/80">
        © 2026 Golesta Beauty · Villach
      </footer>
    </main>
  );
}

export default function Page(props:Props){return <Suspense fallback={<p className="p-10">Produkt wird geladen …</p>}><ProductDetailPage {...props}/></Suspense>;}
