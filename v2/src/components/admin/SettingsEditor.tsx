"use client";
import Image from "next/image";
import type { EditorProps } from "./editor-types";
import { Input, Toggle, button, card, input, makeId } from "./editor-types";
import ImageUpload from "./ImageUpload";
export default function SettingsEditor({data,edit}:EditorProps){
  const s=data.settings;
  const patch=<K extends keyof typeof s>(key:K,value:typeof s[K])=>edit(d=>{d.settings[key]=value;});
  const social=s.socials||[];
  return <div className="space-y-7">
    <section className={card}><h2 className="mb-4 font-serif text-2xl">Allgemein / Marke</h2>
      <div className="grid gap-4 sm:grid-cols-2"><Input label="Salonname" value={s.salonName||"Golesta Beauty"} onChange={v=>patch("salonName",v)}/>
        <Input label="Anzahl Startseiten-Galeriebilder" type="number" value={s.galleryLimit||6} onChange={v=>patch("galleryLimit",Number(v))}/></div>
      <div className="mt-4 flex flex-wrap items-center gap-4"><div className="relative h-24 w-24 rounded-lg bg-[#eee5d9]">{(s.logo||"/Logo.PNG")&&<Image src={s.logo||"/Logo.PNG"} alt="Logo" fill sizes="96px" className="object-contain"/>}</div>
        <div><p className="mb-2 text-sm">Logo des Salons</p><ImageUpload label="Logo ändern" onUploaded={urls=>patch("logo",urls[0])}/></div></div>
    </section>
    <section className={card}><h2 className="mb-4 font-serif text-2xl">Startseite / Hero</h2>
      <div className="space-y-4"><Input label="Haupttitel" value={s.heroTitle||"Deine Schönheit."} onChange={v=>patch("heroTitle",v)}/>
      <Input label="Akzent-Titel" value={s.heroAccent||"Unsere Leidenschaft."} onChange={v=>patch("heroAccent",v)}/>
      <Input label="Einleitung" multiline value={s.heroDescription||""} onChange={v=>patch("heroDescription",v)}/>
      <p className="text-sm">Startseitenbild</p><div className="flex gap-4 items-center"><div className="relative h-28 w-28 overflow-hidden rounded-xl bg-[#eee5d9]">{s.heroImage&&<Image src={s.heroImage} alt="Startseitenbild" fill sizes="112px" className="object-cover"/>}</div><ImageUpload label="Hero-Bild ändern" onUploaded={urls=>patch("heroImage",urls[0])}/></div></div>
    </section>
    <section className={card}><h2 className="mb-4 font-serif text-2xl">Texte & Überschriften</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {([
          ["heroEyebrow","Untertitel im Hero"], ["appointmentLabel","Termin-Button"],
          ["servicesHeading","Leistungen – Überschrift"], ["servicesDescription","Leistungen – Kurztext"],
          ["productHeading","Produkte – Überschrift"], ["productDescription","Produkte – Kurztext"],
          ["teamHeading","Team – Überschrift"], ["teamFooter","Team – Schlusssatz"],
          ["galleryHeading","Galerie – Überschrift"], ["galleryDescription","Galerie – Kurztext"],
          ["voucherHeading","Gutschein – Überschrift"], ["contactHeading","Kontakt – Überschrift"],
          ["footerText","Footer – Text"],
        ] as const).map(([key,label])=><Input key={key} label={label} value={s[key]||""} onChange={v=>patch(key,v)}/>)}
      </div></section>
    <section className={card}><h2 className="mb-4 font-serif text-2xl">Kontakt & Anfahrt</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Telefon" value={s.phone} onChange={v=>patch("phone",v)}/>
        <Input label="WhatsApp (nur Ziffern, inkl. Vorwahl)" value={s.whatsapp} onChange={v=>patch("whatsapp",v)}/>
        <Input label="E-Mail" type="email" value={s.email} onChange={v=>patch("email",v)}/>
        <Input label="Adresse" value={s.address} onChange={v=>patch("address",v)}/>
        <Input label="Google Maps / Route URL (optional)" value={s.routeUrl||""} onChange={v=>patch("routeUrl",v)}/>
        <Input label="Google Bewertung URL" value={s.reviewUrl} onChange={v=>patch("reviewUrl",v)}/>
      </div>
    </section>
    <section className={card}><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl">Öffnungszeiten</h2>
      <button type="button" className={button} onClick={()=>edit(d=>d.settings.hours.push({label:"",value:""}))}>+ Öffnungszeit</button></div>
      <div className="space-y-3">{s.hours.map((h,i)=><div key={i} className="grid gap-3 rounded-lg border border-[#e8ddd0] p-3 sm:grid-cols-[1fr_1fr_auto]">
        <Input label="Tag / Zeitraum" value={h.label} onChange={v=>edit(d=>{d.settings.hours[i].label=v;})}/>
        <Input label="Uhrzeit / Geschlossen" value={h.value} onChange={v=>edit(d=>{d.settings.hours[i].value=v;})}/>
        <button className={`${button} self-end`} type="button" onClick={()=>edit(d=>d.settings.hours.splice(i,1))}>Entfernen</button>
      </div>)}</div>
    </section>
    <section className={card}><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl">Social Media / Links</h2>
      <button type="button" className={button} onClick={()=>edit(d=>(d.settings.socials ||= []).push({id:makeId(),name:"",url:"",published:false}))}>+ Social Media</button></div>
      <p className="mb-3 text-sm text-[#74685d]">Weitere Social-Media-Profile hinzufügen. Ein Link erscheint auf der Website, sobald „Sichtbar“ aktiviert und gespeichert ist.</p>
      <div className="space-y-3">{social.map((link,i)=><div key={link.id} className="grid gap-3 rounded-lg border border-[#e8ddd0] p-3 sm:grid-cols-[1fr_1.4fr_auto]">
        <Input label="Name (Instagram, TikTok, Facebook...)" value={link.name} onChange={v=>edit(d=>{d.settings.socials![i].name=v;})}/>
        <Input label="https://..." value={link.url} onChange={v=>edit(d=>{d.settings.socials![i].url=v;})}/>
        <div className="flex flex-col justify-end gap-2"><Toggle label="Sichtbar" checked={link.published} onChange={v=>edit(d=>{d.settings.socials![i].published=v;})}/>
        <button type="button" className={button} onClick={()=>edit(d=>d.settings.socials!.splice(i,1))}>Entfernen</button></div>
      </div>)}</div>
      <div className="mt-4 rounded-lg border border-[#eee5d9] p-3 text-sm"><Input label="Instagram-Profil (Hauptlink)" value={s.instagram} onChange={v=>patch("instagram",v)}/>
      <p className="mt-2 text-xs text-[#74685d]">Hier den Instagram-Link eintragen, der auf der Website im Kontaktbereich erscheint.</p></div>
    </section>
  </div>;
}
