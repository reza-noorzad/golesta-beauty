"use client";
import Image from "next/image";
import { useState } from "react";
import { HOMEPAGE_PRODUCT_LIMIT, eligibleFeatured, selectedFeatured, setFeaturedOrder } from "@/lib/product-management";
import type { EditorProps } from "./editor-types";
import { button, input } from "./editor-types";
import { Badge, EmptyState, Notice } from "./ui";
import Reorderable from "./Reorderable";
export default function FeaturedProducts({data,edit}:EditorProps) {
  const [open,setOpen]=useState(false);const [candidate,setCandidate]=useState("");
  const selected=selectedFeatured(data);const available=data.products.filter(product=>eligibleFeatured(data,product)&&!product.featured);
  return <section id="admin-featured-products" className="admin-card scroll-mt-48"><button type="button" className="flex w-full flex-wrap items-center justify-between gap-3 text-left" aria-expanded={open} onClick={()=>setOpen(previous=>!previous)}><span className="font-serif text-xl">Produkte auf der Startseite</span><Badge>{selected.length} ausgewählt · maximal {HOMEPAGE_PRODUCT_LIMIT}</Badge></button>
    {open&&<div className="mt-4 space-y-4"><p className="text-sm admin-muted">Bereite hier die Auswahl und Reihenfolge vor. Der öffentliche Produktbereich bleibt bis zur Freigabe ausgeblendet.</p>
      {(selected.length>HOMEPAGE_PRODUCT_LIMIT||selected.some(product=>!eligibleFeatured(data,product)))&&<Notice tone="error">Bitte reduziere die Auswahl auf höchstens {HOMEPAGE_PRODUCT_LIMIT} veröffentlichte Produkte aus veröffentlichten Kategorien. Entwürfe bleiben öffentlich verborgen.</Notice>}
      {!selected.length&&<EmptyState title="Noch keine Startseitenprodukte" icon="products">Veröffentlichte Produkte kannst du unten hinzufügen.</EmptyState>}
      <Reorderable compact items={selected} idOf={product=>product.id} move={(from,to)=>{if(to<0||to>=selected.length)return;const ids=selected.map(product=>product.id);const [id]=ids.splice(from,1);ids.splice(to,0,id);edit(draft=>setFeaturedOrder(draft,ids));}}>{product=><div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e3ddd3] p-3"><span className="admin-thumb">{product.images[0]&&<Image src={product.images[0]} alt="" fill sizes="42px" className="object-cover"/>}</span><span className="min-w-0 flex-1"><strong className="font-medium">{product.name||"Neues Produkt"}</strong><span className="block text-xs admin-muted">{eligibleFeatured(data,product)?"Für die Freigabe vorbereitet":"Nicht öffentlich sichtbar"}</span></span><button type="button" className={button+" admin-button-danger"} aria-label={`${product.name} von der Startseite entfernen`} onClick={()=>edit(draft=>setFeaturedOrder(draft,selected.filter(item=>item.id!==product.id).map(item=>item.id)))}>Entfernen</button></div>}</Reorderable>
      <div className="flex flex-wrap items-end gap-3"><label className="admin-field min-w-0 flex-1"><span className="admin-field-label">Veröffentlichtes Produkt hinzufügen</span><select className={input} value={available.some(product=>product.id===candidate)?candidate:""} disabled={selected.length>=HOMEPAGE_PRODUCT_LIMIT||!available.length} onChange={event=>setCandidate(event.target.value)}><option value="">Produkt auswählen</option>{available.map(product=><option key={product.id} value={product.id}>{product.name}</option>)}</select></label><button type="button" className={button} disabled={selected.length>=HOMEPAGE_PRODUCT_LIMIT||!available.some(product=>product.id===candidate)} onClick={()=>{edit(draft=>setFeaturedOrder(draft,[...selected.map(product=>product.id),candidate]));setCandidate("");}}>Hinzufügen</button></div>
    </div>}
  </section>;
}
