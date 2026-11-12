"use client";
import Link from "next/link";
import type { LegalDocument } from "@/lib/legal";
import { usePublicSite } from "./PublicSite";
import { LegalPage } from "./LegalPage";
import LegalDocumentBody from "./LegalDocumentBody";

export default function PublishedLegalPage({ document }: { document: LegalDocument }) {
  const { data, loading, error } = usePublicSite();
  const title = document === "impressum" ? "Impressum" : "Datenschutzerklärung";
  const published = data.legal?.[document]?.published;
  return <LegalPage title={title}>
    {published ? <>
      <p className="text-sm text-[#74685d]">Stand: {new Date(published.publishedAt).toLocaleDateString("de-AT", { timeZone: "Europe/Berlin" })}</p>
      {document === "impressum" && data.legal?.impressum?.published && <LegalDocumentBody document="impressum" content={data.legal.impressum.published.content} />}
      {document === "privacy" && data.legal?.privacy?.published && <LegalDocumentBody document="privacy" content={data.legal.privacy.published.content} />}
    </> : <div role="status" className="space-y-3 rounded-2xl border border-[#e3ddd3] bg-white p-5">
      <p>{loading ? "Rechtliche Informationen werden geladen …" : error ? "Die rechtlichen Informationen konnten gerade nicht geladen werden." : "Noch keine freigegebene Fassung veröffentlicht."}</p>
      <Link href="/#kontakt" className="underline underline-offset-4">Kontakt zum Salon</Link>
    </div>}
  </LegalPage>;
}
