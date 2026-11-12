import type { Metadata } from "next";
import PublishedLegalPage from "@/components/public/PublishedLegalPage";

export const metadata: Metadata = { title: "Datenschutz | Golesta Beauty", robots: { index: false, follow: false } };
export default function DatenschutzPage() { return <PublishedLegalPage document="privacy" />; }
