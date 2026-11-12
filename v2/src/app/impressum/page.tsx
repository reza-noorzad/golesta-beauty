import type { Metadata } from "next";
import PublishedLegalPage from "@/components/public/PublishedLegalPage";

export const metadata: Metadata = { title: "Impressum | Golesta Beauty", robots: { index: false, follow: false } };
export default function ImpressumPage() { return <PublishedLegalPage document="impressum" />; }
