"use client";
import type { EditorProps } from "./editor-types";
import { Input, Toggle, button, card, input, localTime, isoTime, makeId } from "./editor-types";
export default function MarketingEditor({data,edit}:EditorProps){
  const announcements=data.announcements||[];
  const promotions=data.promotions||[];
  return <div className="space-y-8">
    <section className={card}><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl">Hinweise & Ankündigungen</h2>
      <button className={button} type="button" onClick={()=>edit(d=>(d.announcements ||= []).unshift({id:makeId(),enabled:false,type:"info",title:"",message:"",startsAt:"",endsAt:""}))}>+ Neue Meldung</button></div>
      <p className="mt-2 text-sm text-[#74685d]">Für Feiertagsgrüße, Betriebsschließung, geänderte Öffnungszeiten und Hinweise. Ohne aktive Meldung verschwindet der Bereich vollständig.</p>
      {announcements.map((a,i)=><details key={a.id} className="mt-4 rounded-xl border p-4" open={undefined}><summary className="cursor-pointer font-medium">{a.title||"Neue Meldung"} · {a.enabled?"Aktiv":"Inaktiv"}</summary>
        <div className="mt-4 space-y-3"><Toggle label="Veröffentlichen" checked={a.enabled} onChange={v=>edit(d=>{d.announcements![i].enabled=v;})}/>
          <label className="block text-sm">Art<select className={input} value={a.type} onChange={e=>edit(d=>{d.announcements![i].type=e.target.value as typeof a.type;})}>
            <option value="info">Allgemein</option><option value="holiday">Feiertag / Urlaub</option><option value="hours">Geänderte Öffnungszeiten</option><option value="promotion">Aktion</option></select></label>
          <Input label="Überschrift" value={a.title} onChange={v=>edit(d=>{d.announcements![i].title=v;})}/>
          <Input label="Meldung (Absätze möglich)" multiline value={a.message} onChange={v=>edit(d=>{d.announcements![i].message=v;})}/>
          <div className="grid gap-3 sm:grid-cols-2"><Input label="Beginn (optional)" type="datetime-local" value={localTime(a.startsAt)} onChange={v=>edit(d=>{d.announcements![i].startsAt=isoTime(v);})}/>
            <Input label="Ende (optional)" type="datetime-local" value={localTime(a.endsAt)} onChange={v=>edit(d=>{d.announcements![i].endsAt=isoTime(v);})}/>
            <Input label="Linktext (optional)" value={a.linkLabel||""} onChange={v=>edit(d=>{d.announcements![i].linkLabel=v;})}/>
            <Input label="Linkadresse (https oder /...)" value={a.linkUrl||""} onChange={v=>edit(d=>{d.announcements![i].linkUrl=v;})}/></div>
          <button className={`${button} text-red-700`} type="button" onClick={()=>{if(confirm("Meldung entfernen?"))edit(d=>d.announcements!.splice(i,1));}}>Entfernen</button></div>
      </details>)}</section>
    <section className={card}><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl">Produktaktionen / Globale Rabatte</h2>
      <button className={button} type="button" onClick={()=>edit(d=>(d.promotions ||= []).push({id:makeId(),title:"",enabled:false,type:"percent",value:0,startsAt:"",endsAt:"",categoryIds:[],excludeProductIds:[]}))}>+ Aktion</button></div>
      <p className="mt-2 text-sm text-[#74685d]">Für alle Produkte oder bestimmte Kategorien. Einzelrabatte und Aktionsrabatte werden nicht addiert – der günstigste Preis gewinnt. Nach Ablauf gilt automatisch der Normalpreis.</p>
      {promotions.map((p,i)=><details className="mt-4 rounded-xl border p-4" key={p.id}><summary className="cursor-pointer font-medium">{p.title} · {p.enabled?"Aktiv":"Inaktiv"}</summary>
        <div className="mt-4 space-y-3"><Toggle label="Aktiv" checked={p.enabled} onChange={v=>edit(d=>{d.promotions![i].enabled=v;})}/>
        <Input label="Aktionstitel" value={p.title} onChange={v=>edit(d=>{d.promotions![i].title=v;})}/>
        <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm">Rabattart<select className={input} value={p.type} onChange={e=>edit(d=>{d.promotions![i].type=e.target.value as "percent"|"fixed";})}><option value="percent">Prozent (%)</option><option value="fixed">Fester Betrag (€)</option></select></label>
        <Input label="Rabattwert" type="number" value={p.value} onChange={v=>edit(d=>{d.promotions![i].value=Number(v);})}/>
        <Input label="Beginn" type="datetime-local" value={localTime(p.startsAt)} onChange={v=>edit(d=>{d.promotions![i].startsAt=isoTime(v);})}/>
        <Input label="Ende" type="datetime-local" value={localTime(p.endsAt)} onChange={v=>edit(d=>{d.promotions![i].endsAt=isoTime(v);})}/></div>
        <fieldset className="rounded-xl border p-3"><legend className="px-2 font-medium">Kategorien (keine Auswahl = alle)</legend>{data.categories.length===0&&<p className="text-sm text-[#74685d]">Noch keine Kategorien vorhanden. Lege sie unter „Produkte & Kategorien“ an.</p>}
          <div className="flex flex-wrap gap-3">{data.categories.map(c=><Toggle key={c.id} label={c.name} checked={(p.categoryIds||[]).includes(c.id)} onChange={v=>edit(d=>{const list=d.promotions![i].categoryIds ||= []; d.promotions![i].categoryIds=v?[...list,c.id]:list.filter(id=>id!==c.id);})}/>)}</div></fieldset>
        <fieldset className="rounded-xl border p-3"><legend className="px-2 font-medium">Ausnahmen: Diese Produkte bekommen keinen Aktionsrabatt</legend>{data.products.length===0&&<p className="text-sm text-[#74685d]">Noch keine Produkte vorhanden. Hier erscheinen deine Produkte, sobald du sie angelegt hast.</p>}
          <div className="flex flex-wrap gap-3">{data.products.map(product=><Toggle key={product.id} label={product.name} checked={(p.excludeProductIds||[]).includes(product.id)} onChange={v=>edit(d=>{const list=d.promotions![i].excludeProductIds ||= []; d.promotions![i].excludeProductIds=v?[...list,product.id]:list.filter(id=>id!==product.id);})}/>)}</div></fieldset>
        <button className={`${button} text-red-700`} type="button" onClick={()=>{if(confirm("Aktion entfernen?"))edit(d=>d.promotions!.splice(i,1));}}>Aktion entfernen</button>
        </div></details>)}</section>
  </div>;
}
