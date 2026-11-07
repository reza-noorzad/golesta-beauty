"use client";
import Link from "next/link";
import { Notice, PageHeader } from "@/components/admin/ui";
export default function AdminError({retry}:{retry:() => void}) {
  return <section className="space-y-5"><PageHeader title="Einen Moment bitte" /><Notice tone="error">Die Verwaltung konnte nicht geladen werden. Deine gespeicherten Daten bleiben erhalten.</Notice><div className="flex flex-wrap gap-3"><button type="button" onClick={retry} className="admin-button admin-button-primary">Erneut versuchen</button><Link href="/admin/login" className="admin-button">Zur Anmeldung</Link></div></section>;
}
