"use client";
import { useEffect, useState } from "react";
import { adminRequest } from "@/lib/content-client";
import type { ReviewCounts } from "@/lib/admin-api";
import type { AdminReview } from "@/lib/admin-api";
import { button, card } from "@/components/admin/editor-types";
import { Badge, EmptyState, LoadingState, Notice, PageHeader, Tabs } from "@/components/admin/ui";
const labels:Record<string,string>={pending:"Zur Prüfung",approved:"Freigegeben",rejected:"Abgelehnt"};
export default function ReviewsAdmin() {
  const [reviews,setReviews]=useState<AdminReview[]>([]);
  const [counts,setCounts]=useState<ReviewCounts|null>(null);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState<string|null>(null);
  const [tab,setTab]=useState("pending");
  useEffect(() => {
    const controller=new AbortController();
    adminRequest<{reviews:AdminReview[];counts?:ReviewCounts}>("/api/admin/reviews",{signal:controller.signal}).then((result) => {if(!controller.signal.aborted){setReviews(result.reviews);setCounts(result.counts||null);}})
      .catch((error) => {if(!controller.signal.aborted)setError(error.message);})
      .finally(() => {if(!controller.signal.aborted)setLoading(false);});
    return () => controller.abort();
  },[]);
  async function moderate(id:string,status:string) {
    if(busy)return;setBusy(id);setError("");setMessage("");
    try{await adminRequest<{ok:true}>("/api/admin/reviews",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});const previous=reviews.find(review=>review.id===id)?.status;
      setReviews(rows=>rows.map(review=>review.id===id?{...review,status}:review));
      setCounts(counts=>{if(!counts)return null;const next={...counts};if(previous&&previous in next)next[previous as keyof ReviewCounts]=Math.max(0,next[previous as keyof ReviewCounts]-1);if(status in next)next[status as keyof ReviewCounts]++;return next;});
      setMessage("Die Bewertung wurde aktualisiert.");
      try{const result=await adminRequest<{reviews:AdminReview[];counts?:ReviewCounts}>("/api/admin/reviews");setReviews(result.reviews);setCounts(result.counts||null);}catch{setError("Die Entscheidung wurde gespeichert. Weitere Bewertungen konnten gerade nicht geladen werden. Bitte lade die Liste erneut.");}}
    catch(error){setError(error instanceof Error?error.message:"Die Bewertung konnte nicht aktualisiert werden.");}
    finally{setBusy(null);}
  }
  const filtered=tab==="all"?reviews:reviews.filter((review) => review.status===tab);
  return <section className="space-y-5"><PageHeader title="Bewertungen" description="Ein wertvoller Blick aus Kundensicht. Prüfe neue Rückmeldungen, bevor sie auf der Website erscheinen." />
    {error&&<Notice tone="error">{error}</Notice>}{message&&<Notice tone="success">{message}</Notice>}
    <Tabs label="Bewertungen filtern" value={tab} onChange={setTab} panelId="admin-reviews-panel" items={[{value:"pending",label:`Zur Prüfung (${counts?.pending??reviews.filter((review) => review.status==="pending").length})`},{value:"approved",label:"Freigegeben"},{value:"rejected",label:"Abgelehnt"},{value:"all",label:"Alle"}]} />
    {counts&&counts.pending>reviews.filter(review=>review.status==="pending").length&&<Notice>Es gibt weitere offene Bewertungen. Nach dem Bearbeiten werden die nächsten geladen.</Notice>}
    <div id="admin-reviews-panel" role="tabpanel" aria-label={labels[tab]||"Alle Bewertungen"} className="space-y-4">
      {loading?<LoadingState>Bewertungen werden geladen …</LoadingState>:filtered.map((review) => <article className={card+" space-y-4"} key={review.id}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2>{review.name}</h2><p className="mt-1 text-sm text-[#785b35]" aria-label={`${review.rating} von 5 Sternen`}>{"★".repeat(Math.max(0,Math.min(5,Math.floor(review.rating))))} <span className="admin-muted">{review.rating}/5</span></p></div><Badge tone={review.status==="approved"?"success":review.status==="pending"?"warning":"neutral"}>{labels[review.status]||"Bewertung"}</Badge></div>
        <p className="text-xs admin-muted">Produktbewertung · {Number.isFinite(Date.parse(review.createdAt))?new Intl.DateTimeFormat("de-AT",{dateStyle:"medium",timeZone:"Europe/Vienna"}).format(new Date(review.createdAt)):"Datum nicht verfügbar"}</p>
        <p className="whitespace-pre-line text-sm leading-7">{review.comment}</p>
        <div className="flex flex-wrap gap-2" aria-busy={busy===review.id}><button type="button" className={button+" admin-button-primary"} disabled={busy!==null||review.status==="approved"} onClick={() => void moderate(review.id,"approved")}>{busy===review.id?"Wird gespeichert …":"Freigeben"}</button><button type="button" className={button} disabled={busy!==null||review.status==="rejected"} onClick={() => void moderate(review.id,"rejected")}>Ablehnen</button><button type="button" className={button+" admin-button-quiet"} disabled={busy!==null||review.status==="pending"} onClick={() => void moderate(review.id,"pending")}>Zur Prüfung</button></div>
      </article>)}
      {!loading&&!error&&!filtered.length&&<EmptyState title={tab==="pending"?"Alles geprüft":"Hier gibt es noch keine Bewertungen"} icon="reviews">{tab==="pending"?"Neue Rückmeldungen erscheinen hier, sobald sie eingehen.":"Wähle einen anderen Bereich, um weitere Rückmeldungen anzusehen."}</EmptyState>}
      {!loading&&error&&<button className={button} type="button" onClick={() => window.location.reload()}>Erneut versuchen</button>}
    </div>
  </section>;
}
