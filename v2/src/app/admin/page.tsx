"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { adminRequest } from "@/lib/content-client";
import type { Content } from "@/lib/content";
type Review={status:string};
export default function AdminHome(){
  const [data,setData]=useState<Content|null>(null);
  const [reviews,setReviews]=useState<Review[]|null>(null);
  const [error,setError]=useState("");
  useEffect(()=>{let active=true;
    adminRequest("/api/admin/content").then(r=>{if(active)setData(r.data);}).catch(e=>{if(active)setError(e.message);});
    adminRequest("/api/admin/reviews").then(r=>{if(active)setReviews(r.reviews||[]);}).catch(()=>{});
    return ()=>{active=false;};
  },[]);
  const pending=reviews?.filter(r=>r.status==="pending").length;
  const published=data?.products.filter(p=>p.published).length;
  const activeAnnouncements=data?.announcements?.filter(a=>a.enabled&&a.message.trim()).length;
  const cards=[
    {title:"Produkte online",value:published,href:"/admin/produkte",help:"Produkte verwalten"},
    {title:"Bewertungen prüfen",value:pending,href:"/admin/bewertungen",help:"Kommentare freigeben oder ablehnen"},
    {title:"Hinweise aktiv",value:activeAnnouncements,href:"/admin/aktionen",help:"Schließzeiten und Nachrichten bearbeiten"},
    {title:"Galerie Startseite",value:data?.gallery.filter(g=>g.homepage&&g.published).length,href:"/admin/galerie",help:"Startseitenbilder auswählen"},
  ];
  return <section className="space-y-7">
    <div><p className="text-xs uppercase tracking-[0.25em] text-[#a98348]">Administration</p><h1 className="mt-3 font-serif text-4xl">Übersicht</h1><p className="mt-3 text-sm text-[#74685d]">Wichtige Aufgaben und Inhalte auf einen Blick.</p></div>
    {error&&<p role="alert" className="rounded-xl border bg-white p-3 text-red-700">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(c=><Link href={c.href} key={c.title} className="rounded-2xl border border-[#e8ddd0] bg-white p-6 transition hover:border-[#a98348] hover:shadow-md"><p className="text-sm text-[#74685d]">{c.title}</p><p className="mt-3 font-serif text-4xl">{c.value??"–"}</p><p className="mt-3 text-xs text-[#8b6a3c]">{c.help} →</p></Link>)}</div>
    {pending!==undefined&&pending>0&&<Link href="/admin/bewertungen" className="block rounded-2xl border border-[#d8c4a8] bg-[#fff4df] p-5 font-medium">{pending} Bewertung(en) warten auf Freigabe. Jetzt prüfen →</Link>}
    <section className="rounded-2xl border border-[#e8ddd0] bg-white p-6"><h2 className="font-serif text-2xl">Besucherstatistik</h2><p className="mt-3 text-sm leading-6 text-[#74685d]">Eine Besucheranalyse ist noch nicht verbunden. Besucherzahlen werden hier deshalb bewusst nicht geschätzt oder erfunden. Für eine datenschutzgerechte Einrichtung von Web-Analytics werden ein Anbieter und die nötigen Einwilligungs-Einstellungen benötigt.</p><a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-[#8b6a3c] underline">Google Analytics einrichten ↗</a></section>
    <Link href="/" className="inline-block text-sm font-medium text-[#8b6a3c] underline">Website-Vorschau ansehen →</Link>
  </section>;
}
