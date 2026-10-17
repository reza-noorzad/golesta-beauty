"use client";
import { useEffect, useState, type FormEvent } from "react";
import type { Content } from "@/lib/content";
type Review={id:string;name:string;rating:number;comment:string;createdAt:string};
export default function ProductReviews({product}:{product:Content["products"][number]}){
  const [reviews,setReviews]=useState<Review[]>([]);const [name,setName]=useState("");const [rating,setRating]=useState(5);const [comment,setComment]=useState("");const [website,setWebsite]=useState("");
  const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
  useEffect(()=>{let live=true;fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}`,{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject(Error("Bewertungen nicht verfügbar."))).then(r=>{if(live)setReviews(r.reviews||[]);}).catch(()=>{});return()=>{live=false;};},[product.id]);
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");try{const response=await fetch("/api/reviews",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productId:product.id,name,rating,comment,website})});const body=await response.json();if(!response.ok)throw Error(body.error||"Fehler");setMessage(body.message||"Vielen Dank!");setName("");setComment("");}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
  return <section className="mt-14 border-t border-[#e8ddd0] pt-10"><h2 className="font-serif text-3xl">Bewertungen & Erfahrungen</h2>
    {product.showRating&&reviews.length>0&&<p className="mt-3 text-[#8b6a3c]">★ {(reviews.reduce((sum,r)=>sum+r.rating,0)/reviews.length).toFixed(1)} / 5 · {reviews.length} Bewertung(en)</p>}
    <div className="mt-6 space-y-3">{reviews.map(r=><article key={r.id} className="rounded-xl border border-[#e8ddd0] bg-white p-5"><div className="flex flex-wrap justify-between gap-2"><strong>{r.name}</strong>{product.showRating&&<span aria-label={`${r.rating} von 5 Sternen`} className="text-[#a98348]">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>}</div><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#74685d]">{r.comment}</p></article>)}
      {reviews.length===0&&<p className="text-sm text-[#74685d]">Noch keine Bewertungen vorhanden.</p>}</div>
    <form className="mt-8 max-w-2xl space-y-3" onSubmit={e=>void submit(e)}><h3 className="font-serif text-xl">Bewertung schreiben</h3>
      <input className="w-full rounded-xl border p-3" aria-label="Name" placeholder="Dein Name" maxLength={80} minLength={2} required value={name} onChange={e=>setName(e.target.value)}/>
      <label className="block text-sm">Bewertung<select className="ml-3 rounded-xl border p-2" value={rating} onChange={e=>setRating(Number(e.target.value))}>{[5,4,3,2,1].map(n=><option value={n} key={n}>{n} Sterne</option>)}</select></label>
      <textarea className="w-full rounded-xl border p-3" rows={4} minLength={10} maxLength={1200} required placeholder="Deine Erfahrung" value={comment} onChange={e=>setComment(e.target.value)}/>
      <input className="hidden" tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)} aria-label="Website (leer lassen)"/>
      <p className="text-xs leading-6 text-[#74685d]">Nur Name, Bewertung und Kommentar werden nach Prüfung veröffentlicht. Bitte keine sensiblen persönlichen Daten eingeben.</p>
      <button disabled={busy} className="rounded-full bg-[#a98348] px-6 py-3 text-white disabled:opacity-50">{busy?"Sendet …":"Bewertung absenden"}</button>
      {message&&<p role="status" className="text-sm">{message}</p>}</form>
  </section>;
}
