"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { readServices, saveServices, type ServiceCategory } from "@/lib/services-store";
import Reorderable from "@/components/admin/Reorderable";
import { Input, button, card, makeId } from "@/components/admin/editor-types";
export default function ServicesAdmin(){
  const [categories,setCategories]=useState<ServiceCategory[]>([]);const [selected,setSelected]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);const [saving,setSaving]=useState(false);const [dirty,setDirty]=useState(false);const [isLive,setIsLive]=useState(false);
  const [updatedAt,setUpdatedAt]=useState<string|null>(null);const [message,setMessage]=useState("");
  const current=categories.find(c=>c.id===selected);
  useEffect(()=>{let cancelled=false;(async()=>{if(!db||!auth?.currentUser){setMessage("Bitte erneut anmelden.");setLoading(false);return;}
    try{const result=await readServices(db);if(cancelled)return;setCategories(result.categories);setSelected(result.categories[0]?.id||null);setIsLive(result.isLive);setUpdatedAt(result.updatedAt);}
    catch(e){if(!cancelled)setMessage(e instanceof Error?e.message:"Laden fehlgeschlagen.");}finally{if(!cancelled)setLoading(false);}})();return()=>{cancelled=true;};},[]);
  useEffect(()=>{function warn(e:BeforeUnloadEvent){if(dirty){e.preventDefault();e.returnValue="";}}window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[dirty]);
  function update(fn:(draft:ServiceCategory[])=>void){setCategories(prev=>{const draft=structuredClone(prev);fn(draft);return draft.map((c,i)=>({...c,sortOrder:i}));});setDirty(true);setMessage("");}
  function moveCategory(from:number,to:number){if(to<0||to>=categories.length||from===to)return;update(d=>{const [v]=d.splice(from,1);d.splice(to,0,v);});}
  function moveService(categoryId:string,from:number,to:number){const c=categories.find(x=>x.id===categoryId);if(!c||to<0||to>=c.items.length||from===to)return;update(d=>{const arr=d.find(x=>x.id===categoryId)!.items;const [v]=arr.splice(from,1);arr.splice(to,0,v);});}
  async function save(){if(!db||!auth?.currentUser){setMessage("Bitte erneut anmelden.");return;}setSaving(true);setMessage("");try{setUpdatedAt(await saveServices(db,categories,updatedAt));setDirty(false);setIsLive(true);setMessage("Gespeichert! Änderungen sind in Firestore.");}catch(e){setMessage(e instanceof Error?e.message:"Speichern fehlgeschlagen.");}finally{setSaving(false);}}
  if(loading)return <p className="p-6">Leistungen werden geladen …</p>;
  return <section className="space-y-6"><div><p className="text-xs uppercase tracking-[0.25em] text-[#a98348]">Admin</p><h1 className="mt-3 font-serif text-4xl">Leistungen & Preise</h1>
    <p className="mt-3 text-sm leading-6 text-[#74685d]">{isLive?"Firestore-Daten geladen.":"Lokale Originaldaten geladen."} Kategorien und Leistungen per Griff ziehen; Pfeile bleiben für Tastatur und kleine Bildschirme.</p></div>
    <div className="sticky top-0 z-30 flex flex-wrap items-center gap-3 rounded-xl border border-[#e8ddd0] bg-[#faf7f2]/95 p-3 shadow-sm backdrop-blur">
      <button type="button" className="rounded-xl bg-[#a98348] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={saving||!dirty} onClick={()=>void save()}>{saving?"Speichert …":"Änderungen speichern"}</button>
      <button type="button" className={button} onClick={()=>{const id=makeId();update(d=>d.push({id,title:"Neue Kategorie",desc:"",sortOrder:d.length,items:[]}));setSelected(id);}}>+ Kategorie</button>
      <span className="text-sm text-[#74685d]">{categories.length} Kategorien · {categories.reduce((n,c)=>n+c.items.length,0)} Leistungen {dirty?"· Ungespeichert":""}</span></div>
    {message&&<p role="status" className="rounded-xl border bg-white p-3 text-sm">{message}</p>}
    <div className="grid items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)]"><div className={card+" p-3"}>
      <Reorderable items={categories} idOf={c=>c.id} move={moveCategory}>{c=><button type="button" className={`w-full rounded-lg p-2 text-left text-sm ${selected===c.id?"bg-[#eee5d9]":"hover:bg-[#faf7f2]"}`} onClick={()=>setSelected(c.id)}>{c.title} <span className="text-[#74685d]">({c.items.length})</span></button>}</Reorderable></div>
      {current?<div className={card+" space-y-5"} key={current.id}>
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-serif text-2xl">Kategorie bearbeiten</h2><button type="button" className="text-sm text-red-700 underline" onClick={()=>{if(confirm(`Kategorie „${current.title}“ und ${current.items.length} Leistungen entfernen?`)){update(d=>d.splice(d.findIndex(x=>x.id===current.id),1));setSelected(categories.find(x=>x.id!==current.id)?.id||null);}}}>Kategorie löschen</button></div>
        <Input label="Name" value={current.title} onChange={v=>update(d=>{d.find(c=>c.id===current.id)!.title=v;})}/>
        <Input label="Beschreibung" multiline value={current.desc} onChange={v=>update(d=>{d.find(c=>c.id===current.id)!.desc=v;})}/>
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-serif text-xl">Leistungen ({current.items.length})</h3><button type="button" className={button} onClick={()=>update(d=>d.find(c=>c.id===current.id)!.items.push({id:makeId(),name:"Neue Leistung",price:"Preis auf Anfrage"}))}>+ Leistung</button></div>
        <Reorderable items={current.items} idOf={x=>x.id} move={(a,b)=>moveService(current.id,a,b)}>{item=><div className="grid gap-3 rounded-xl border border-[#e8ddd0] p-3 sm:grid-cols-[1fr_135px_auto]">
          <Input label="Leistung" value={item.name} onChange={v=>update(d=>{d.find(c=>c.id===current.id)!.items.find(x=>x.id===item.id)!.name=v;})}/>
          <Input label="Preis (Text)" value={item.price} onChange={v=>update(d=>{d.find(c=>c.id===current.id)!.items.find(x=>x.id===item.id)!.price=v;})}/>
          <button type="button" className={`${button} self-end text-red-700`} onClick={()=>{if(confirm("Leistung entfernen?"))update(d=>{const cat=d.find(c=>c.id===current.id)!;cat.items=cat.items.filter(x=>x.id!==item.id);});}}>×</button>
        </div>}</Reorderable>
      </div>:<div className={card}>Kategorie auswählen oder hinzufügen.</div>}</div>
    <p className="text-xs leading-6 text-[#74685d]">Hinweis: Vor der ersten Speicherung werden die Originalleistungen übernommen. Es findet kein automatisches Überschreiben der Firestore-Daten statt.</p>
  </section>;
}
