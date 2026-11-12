import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return <main className="bg-[#faf7f2] px-5 py-12 text-[#332b26] sm:px-6 sm:py-16">
    <article className="mx-auto max-w-3xl space-y-8 break-words leading-7">
      <div>
        <Link href="/" className="text-[#684b28] underline underline-offset-4">Zur Startseite</Link>
        <h1 className="mt-5 font-serif text-4xl sm:text-5xl">{title}</h1>
      </div>
      {children}
    </article>
  </main>;
}
