"use client";
import { useEffect, useState } from "react";
import { adminRequest } from "@/lib/content-client";
import { button, card } from "@/components/admin/editor-types";
type Review={id:string;productId:string;name:string;rating:number;comment:string;status:string;createdAt:string};
export default function ReviewsAdmin(){const [reviews,setReviews]=useState<Review[]>([]);const [error,setError]=useState("");
  async function refresh(){try{const r=await adminRequest("/api/admin/reviews");setReviews(r.reviews);}catch(e){setError((e as Error).message);}}
  useEffect(()=>{void refresh();},[]);
  async function moderate(id:string,status:string){try{await adminRequest("/api/admin/reviews",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});await refresh();}catch(e){setError((e as Error).message);}}
  return <section className="space-y-5"><h1 className="font-serif text-4xl">Bewertungen</h1><p className="text-sm text-[#74685d]">Kommentare werden nie automatisch veröffentlicht. Zuerst prüfen, dann freigeben.</p>
    {error&&<p role="alert" className="text-red-700">{error}</p>}{reviews.map(r=><article className={card} key={r.id}><div className="flex flex-wrap justify-between gap-3"><strong>{r.name} · {r.rating}/5 Sterne</strong><span className="text-sm">{r.status}</span></div>
      <p className="mt-2 text-xs text-[#74685d]">Produkt-ID: {r.productId} · {r.createdAt}</p><p className="mt-3 whitespace-pre-wrap">{r.comment}</p>
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" className={button} onClick={()=>void moderate(r.id,"approved")}>Freigeben</button><button type="button" className={button} onClick={()=>void moderate(r.id,"rejected")}>Ablehnen</button><button type="button" className={button} onClick={()=>void moderate(r.id,"pending")}>Zur Prüfung</button></div></article>)}
    {!reviews.length&&<p>Noch keine Bewertungen.</p>}</section>;
}
