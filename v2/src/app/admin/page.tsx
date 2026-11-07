"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { adminRequest } from "@/lib/content-client";
import type { ReviewCounts } from "@/lib/admin-api";
import type { AdminContentResponse } from "@/lib/admin-api";
import type { Content } from "@/lib/content";
import { isActivePeriod } from "@/lib/pricing";
import { Badge, Icon, Notice, PageHeader, useAdminClock, type IconName } from "@/components/admin/ui";
import { useAdminSession } from "@/components/admin/AdminSession";
type Review={status:string};
export default function AdminHome() {
  const {state}=useAdminSession();
  const [data,setData]=useState<Content|null>(null);
  const [reviews,setReviews]=useState<Review[]|null>(null);
  const [counts,setCounts]=useState<ReviewCounts|null>(null);
  const [error,setError]=useState("");
  const now=useAdminClock();
  useEffect(() => {
    const controller=new AbortController();
    adminRequest<AdminContentResponse>("/api/admin/content",{signal:controller.signal}).then((result) => {if(!controller.signal.aborted)setData(result.data);}).catch((error) => {if(!controller.signal.aborted)setError(error.message);});
    adminRequest<{reviews:Review[];counts?:ReviewCounts}>("/api/admin/reviews",{signal:controller.signal}).then((result) => {if(!controller.signal.aborted){setReviews(result.reviews);setCounts(result.counts||null);}}).catch((error) => {if(!controller.signal.aborted)setError(error.message);});
    return () => {controller.abort();};
  },[]);
  const pending=counts?.pending??reviews?.filter((review) => review.status==="pending").length;
  const cards:{title:string;value:number|undefined;href:string;icon:IconName;help:string}[]=[
    {title:"Veröffentlichte Produkte",value:data?.products.filter((product) => product.published).length,href:"/admin/produkte",icon:"products",help:"Sortiment ansehen"},
    {title:"Produktentwürfe",value:data?.products.filter((product) => !product.published).length,href:"/admin/produkte",icon:"products",help:"Entwürfe bearbeiten"},
    {title:"Offene Bewertungen",value:pending,href:"/admin/bewertungen",icon:"reviews",help:"Bewertungen prüfen"},
    {title:"Aktive Meldungen",value:data&&now!==null?(data.announcements||[]).filter((item) => item.message.trim()&&isActivePeriod(item,now)).length:undefined,href:"/admin/aktionen",icon:"info",help:"Meldungen verwalten"},
    {title:"Aktive Aktionen",value:data&&now!==null?(data.promotions||[]).filter((item) => isActivePeriod(item,now)).length:undefined,href:"/admin/aktionen",icon:"promotions",help:"Angebote verwalten"},
    {title:"Startseitenbilder",value:data?.gallery.filter((image) => image.homepage&&image.published).length,href:"/admin/galerie",icon:"gallery",help:"Galerie gestalten"},
  ];
  const editor=state.status==="allowed"&&state.role==="editor";
  return <section className="space-y-6">
    <PageHeader title="Übersicht" description="Willkommen zurück. Hier findest du alles Wichtige für deinen Salon."><Badge>Golesta Beauty · Villach</Badge></PageHeader>
    {error&&<Notice tone="error">{error}</Notice>}
    <div className="admin-metrics">{cards.map((item) => {
      const restricted=editor&&item.href==="/admin/aktionen";
      const contents=<><div className="admin-metric-top"><span>{item.title}</span><Icon name={item.icon} /></div><span className="admin-metric-value">{item.value??"–"}</span><span className="admin-metric-link">{restricted?"Durch die Administration verwaltet":`${item.help} →`}</span></>;
      return restricted?<article className="admin-metric" key={item.title}>{contents}</article>:<Link href={item.href} className="admin-metric" key={item.title} aria-label={`${item.title}: ${item.value??"wird geladen"}`}>{contents}</Link>;
    })}</div>
    {!!pending&&<Link href="/admin/bewertungen" className="admin-notice"><Icon name="reviews" /><span><strong>{pending} {pending===1?"Bewertung wartet":"Bewertungen warten"} auf deine Freigabe.</strong> Jetzt ansehen →</span></Link>}
    <div className="admin-grid-2">
      <section className="admin-card space-y-4"><div className="admin-card-title"><h2>Deine nächsten Handgriffe</h2><Icon name="services" /></div>
        <Link href="/admin/leistungen" className="admin-nav-link"><Icon name="services" /><span>Leistungen & Preise pflegen</span><Icon name="arrow" /></Link>
        <Link href="/admin/galerie" className="admin-nav-link"><Icon name="gallery" /><span>Neue Einblicke in den Salon</span><Icon name="arrow" /></Link>
        <Link href="/admin/team" className="admin-nav-link"><Icon name="team" /><span>Das Team vorstellen</span><Icon name="arrow" /></Link>
      </section>
      <section className="admin-card flex flex-col items-start gap-4"><Badge>Optional</Badge><h2>Besucherstatistik</h2><p className="text-sm admin-muted">Eine Besucheranalyse ist noch nicht eingerichtet. Wenn du später mehr über die Nutzung deiner Website erfahren möchtest, kannst du sie mit einer passenden Datenschutzeinstellung ergänzen.</p><Link href="/" target="_blank" rel="noopener noreferrer" className="admin-button mt-auto"><Icon name="external" />Website ansehen</Link></section>
    </div>
  </section>;
}
