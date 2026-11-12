import Link from "next/link";
import type { ReactNode } from "react";
import site from "@/data/site-data.json";

/** Review drafts: keep the notice and noindex until the owner approves the legal text. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return <main className="bg-[#faf7f2] px-5 py-12 text-[#332b26] sm:px-6 sm:py-16">
    <article className="mx-auto max-w-3xl space-y-8 break-words leading-7">
      <div>
        <Link href="/" className="text-[#684b28] underline underline-offset-4">Zur Startseite</Link>
        <h1 className="mt-5 font-serif text-4xl sm:text-5xl">{title}</h1>
      </div>
      <aside aria-label="Freigabestatus" className="rounded-2xl border border-[#c9a24a] bg-white p-5">
        <p className="font-semibold">Entwurf – noch nicht zur Veröffentlichung freigegeben</p>
        <p>Die rechtlich verantwortliche Person und die vollständigen Pflichtangaben müssen vom Salon bestätigt werden. Diese Fassung ist keine abschließend freigegebene Rechtsinformation.</p>
      </aside>
      {children}
    </article>
  </main>;
}

export function LegalContact() {
  return <address className="not-italic">
    <p className="font-semibold">Golesta Beauty</p>
    <p>{site.address}</p>
    <p><a className="text-[#684b28] underline underline-offset-4" href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}>{site.phone}</a></p>
    <p><a className="text-[#684b28] underline underline-offset-4" href={`mailto:${site.email}`}>{site.email}</a></p>
  </address>;
}
