"use client";
import { useEffect, useState } from "react";
import type { Content } from "@/lib/content";
import { adminRequest } from "@/lib/content-client";
import ProductsEditor from "./ProductsEditor";
import GalleryEditor from "./GalleryEditor";
import TeamEditor from "./TeamEditor";
import SettingsEditor from "./SettingsEditor";
import MarketingEditor from "./MarketingEditor";
import { Input, Toggle, button, card, type Edit } from "./editor-types";

type Section="products"|"gallery"|"team"|"voucher"|"settings"|"marketing";
const titles:Record<Section,string>={products:"Produkte & Kategorien",gallery:"Galerie",team:"Team",voucher:"Gutschein",settings:"Einstellungen",marketing:"Meldungen & Aktionen"};
export default function ContentEditor({section}:{section:Section}){
  const [data,setData]=useState<Content|null>(null);
  const [revision,setRevision]=useState(0);
  const [dirty,setDirty]=useState(false);
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState("");
  const [loadError,setLoadError]=useState(false);
  useEffect(()=>{let active=true;adminRequest("/api/admin/content").then(r=>{if(active){setData(r.data);setRevision(r.revision);}}).catch(e=>{if(active){setStatus(e.message);setLoadError(true);}});return ()=>{active=false;};},[]);
  useEffect(()=>{function warn(event:BeforeUnloadEvent){if(dirty){event.preventDefault();event.returnValue="";}}window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[dirty]);
  useEffect(()=>{function guard(e:MouseEvent){if(dirty&&(e.target as Element).closest("a")&&!confirm("Ungespeicherte Änderungen verwerfen?")){e.preventDefault();e.stopPropagation();}}document.addEventListener("click",guard,true);return()=>document.removeEventListener("click",guard,true);},[dirty]);
  const edit:Edit=mutate=>{setData(previous=>{if(!previous)return null;const copy=structuredClone(previous);mutate(copy);return copy;});setDirty(true);setStatus("");};
  async function save(){if(!data||!dirty)return;setBusy(true);setStatus("");try{
    const response=await adminRequest("/api/admin/content",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({data,revision})});
    setRevision(response.revision);setDirty(false);setStatus("Gespeichert! Änderungen sind veröffentlicht (Entwürfe bleiben verborgen).");
  }catch(e){setStatus(e instanceof Error?e.message:"Speichern fehlgeschlagen.");}finally{setBusy(false);}}
  if(!data)return <div className="space-y-3" role="status">{status||"Inhalte werden geladen …"}{loadError&&<button className={button} type="button" onClick={()=>window.location.reload()}>Erneut versuchen</button>}</div>;
  return <section className="space-y-6">
    <div><p className="text-xs uppercase tracking-[0.25em] text-[#a98348]">Administration</p><h1 className="mt-2 font-serif text-4xl">{titles[section]}</h1>
    <p className="mt-3 text-sm text-[#74685d]">Änderungen werden erst mit „Speichern“ übernommen. Unveröffentlichte Einträge bleiben unsichtbar.</p></div>
    <div className="sticky top-0 z-30 flex flex-wrap items-center gap-3 rounded-xl border border-[#e8ddd0] bg-[#faf7f2]/95 p-3 shadow-sm backdrop-blur">
      <button type="button" onClick={()=>void save()} disabled={!dirty||busy} className="rounded-lg bg-[#a98348] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy?"Speichert …":"Änderungen speichern"}</button>
      <span className="text-sm text-[#74685d]">{dirty?"● Nicht gespeichert":"✓ Aktueller Stand"}</span></div>
    {status&&<p role="status" className="whitespace-pre-line rounded-lg border border-[#d8c4a8] p-3 text-sm">{status}</p>}
    <fieldset disabled={busy} className="min-w-0 space-y-5 disabled:opacity-60">
      {section==="products"&&<ProductsEditor data={data} edit={edit}/>}
      {section==="gallery"&&<GalleryEditor data={data} edit={edit}/>}
      {section==="team"&&<TeamEditor data={data} edit={edit}/>}
      {section==="settings"&&<SettingsEditor data={data} edit={edit}/>}
      {section==="marketing"&&<MarketingEditor data={data} edit={edit}/>}
      {section==="voucher"&&<div className={card+" space-y-5"}><Toggle label="Gutschein anzeigen" checked={data.voucher.published} onChange={v=>edit(d=>{d.voucher.published=v;})}/>
        <Input label="Gutscheinbeschreibung" multiline value={data.voucher.description} onChange={v=>edit(d=>{d.voucher.description=v;})}/>
        <p className="text-sm text-[#74685d]">Gutscheine werden im Salon verkauft. Keine Online-Zahlung.</p>
        {data.voucher.values.map((value,i)=><div key={i} className="flex items-end gap-2"><div className="max-w-48 flex-1"><Input label="Gutscheinwert €" type="number" value={value} onChange={v=>edit(d=>{d.voucher.values[i]=Number(v);})}/></div><button className={button} type="button" onClick={()=>edit(d=>d.voucher.values.splice(i,1))}>Entfernen</button></div>)}
        <button className={button} type="button" onClick={()=>edit(d=>d.voucher.values.push(50))}>+ Gutscheinwert</button></div>}
    </fieldset>
    <button type="button" onClick={()=>void save()} disabled={!dirty||busy} className="rounded-xl bg-[#a98348] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40">Änderungen speichern</button>
  </section>;
}
