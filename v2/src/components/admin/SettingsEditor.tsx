"use client";
import Image from "next/image";
import { useState } from "react";
import type { EditorProps } from "./editor-types";
import { Input, Toggle, button, card, makeId } from "./editor-types";
import ImageUpload from "./ImageUpload";
import { Tabs, EmptyState } from "./ui";
const sections=[{value:"salon",label:"Salon & Marke"},{value:"contact",label:"Kontakt"},{value:"hours",label:"Öffnungszeiten"},{value:"website",label:"Website"},{value:"social",label:"Social Media"}];
export default function SettingsEditor({data,edit}:EditorProps) {
  const [tab,setTab]=useState("salon");
  const settings=data.settings;
  const patch=<K extends keyof typeof settings>(key:K,value:typeof settings[K]) => edit((draft) => {draft.settings[key]=value;});
  return <div><Tabs label="Einstellungsbereiche" items={sections} value={tab} onChange={setTab} panelId="admin-settings-panel" />
    <div id="admin-settings-panel" role="tabpanel" aria-label={sections.find((section) => section.value===tab)?.label} className="space-y-5">
      {tab==="salon"&&<section className={card+" space-y-5"}><h2>So kennt man deinen Salon</h2><Input label="Salonname" value={settings.salonName??""} placeholder="Name des Salons" onChange={(value) => patch("salonName",value)} />
        <div className="flex flex-wrap items-center gap-5"><div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-[#e3ddd3] bg-[#f6f3ee]"><Image src={settings.logo||"/Logo.PNG"} alt="Salonlogo" fill sizes="112px" className="object-contain p-2" /></div><div><p className="mb-2 text-sm font-medium">Dein Logo</p><ImageUpload label="Logo ändern" onUploaded={(urls) => patch("logo",urls[0])} /><p className="mt-2 text-xs admin-muted">Am besten gut lesbar auf hellem Hintergrund.</p></div></div>
      </section>}
      {tab==="contact"&&<section className={card+" space-y-5"}><h2>Erreichbarkeit & Anfahrt</h2><div className="admin-grid-2">
        <Input label="Telefon" type="tel" value={settings.phone} onChange={(value) => patch("phone",value)} />
        <Input label="WhatsApp-Nummer mit Ländervorwahl" value={settings.whatsapp} placeholder="Nur Ziffern, ohne Pluszeichen" onChange={(value) => patch("whatsapp",value)} />
        <Input label="E-Mail" type="email" value={settings.email} onChange={(value) => patch("email",value)} />
        <Input label="Adresse" value={settings.address} onChange={(value) => patch("address",value)} />
        <Input label="Link zur Anfahrt (optional)" value={settings.routeUrl??""} placeholder="Link aus Google Maps" onChange={(value) => patch("routeUrl",value)} />
        <Input label="Link für Google-Bewertungen" value={settings.reviewUrl} onChange={(value) => patch("reviewUrl",value)} />
      </div></section>}
      {tab==="hours"&&<section className={card+" space-y-4"}><div className="admin-card-title"><h2>Wann dein Salon geöffnet ist</h2><button type="button" className={button} onClick={() => edit((draft) => draft.settings.hours.push({label:"",value:""}))}>+ Öffnungszeit</button></div>
        {!settings.hours.length&&<EmptyState title="Noch keine Öffnungszeiten">Ergänze Tage und Zeiten für deine Kundinnen und Kunden.</EmptyState>}
        {settings.hours.map((hours,index) => <div key={index} className="grid gap-3 rounded-xl border border-[#e3ddd3] p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"><Input label="Tag oder Zeitraum" value={hours.label} placeholder="z. B. Montag bis Freitag" onChange={(value) => edit((draft) => {draft.settings.hours[index].label=value;})} /><Input label="Uhrzeit" value={hours.value} placeholder="z. B. 09:00–18:00 oder geschlossen" onChange={(value) => edit((draft) => {draft.settings.hours[index].value=value;})} /><button type="button" className={button+" admin-button-danger self-end"} onClick={() => edit((draft) => draft.settings.hours.splice(index,1))}>Entfernen</button></div>)}
      </section>}
      {tab==="website"&&<>
        <details className="admin-disclosure" open><summary>Der erste Eindruck</summary><div className="admin-disclosure-body space-y-5">
          <div className="admin-grid-2"><Input label="Hauptüberschrift" value={settings.heroTitle??""} placeholder="Deine Hauptüberschrift" onChange={(value) => patch("heroTitle",value)} /><Input label="Zweite Titelzeile" value={settings.heroAccent??""} placeholder="Ergänzung zur Hauptüberschrift" onChange={(value) => patch("heroAccent",value)} /><Input label="Text über der Überschrift" value={settings.heroEyebrow??""} onChange={(value) => patch("heroEyebrow",value)} /><Input label="Beschriftung des Terminbuttons" value={settings.appointmentLabel??""} onChange={(value) => patch("appointmentLabel",value)} /></div>
          <Input label="Willkommenstext" multiline value={settings.heroDescription??""} onChange={(value) => patch("heroDescription",value)} />
          <div className="flex flex-wrap items-center gap-4"><div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#eee5d9]">{settings.heroImage&&<Image src={settings.heroImage} alt="Startseitenbild" fill sizes="112px" className="object-cover" />}</div><ImageUpload label="Startseitenbild ändern" onUploaded={(urls) => patch("heroImage",urls[0])} /></div>
        </div></details>
        <details className="admin-disclosure"><summary>Überschriften & kurze Texte</summary><div className="admin-disclosure-body admin-grid-2">
          {([["servicesHeading","Leistungen – Überschrift"],["servicesDescription","Leistungen – Kurztext"],["productHeading","Produkte – Überschrift"],["productDescription","Produkte – Kurztext"],["teamHeading","Team – Überschrift"],["teamFooter","Team – Abschlusstext"],["galleryHeading","Galerie – Überschrift"],["galleryDescription","Galerie – Kurztext"],["voucherHeading","Gutschein – Überschrift"],["contactHeading","Kontakt – Überschrift"],["footerText","Text am Seitenende"]] as const).map(([key,label]) => <Input key={key} label={label} value={settings[key]??""} onChange={(value) => patch(key,value)} />)}
        </div></details>
        <section className={card+" space-y-3"}><h2>Galerie auf der Startseite</h2><div className="max-w-sm"><Input label="Anzahl angezeigter Bilder" type="number" value={settings.galleryLimit??6} onChange={(value) => patch("galleryLimit",Number(value))} /></div><p className="text-sm admin-muted">Die Auswahl der Bilder findest du unter „Galerie“.</p></section>
      </>}
      {tab==="social"&&<section className={card+" space-y-5"}><h2>In Verbindung bleiben</h2><Input label="Instagram" value={settings.instagram} placeholder="https://www.instagram.com/…" onChange={(value) => patch("instagram",value)} />
        <div className="admin-card-title"><h3>Weitere Profile</h3><button type="button" className={button} onClick={() => edit((draft) => (draft.settings.socials||=[]).push({id:makeId(),name:"",url:"",published:false}))}>+ Profil hinzufügen</button></div>
        {!settings.socials?.length&&<EmptyState title="Platz für weitere Kontakte">Ergänze bei Bedarf weitere Social-Media-Profile.</EmptyState>}
        {(settings.socials||[]).map((link,index) => <div key={link.id} className="space-y-3 rounded-xl border border-[#e3ddd3] p-4"><div className="admin-grid-2"><Input label="Name des Netzwerks" value={link.name} placeholder="z. B. Facebook" onChange={(value) => edit((draft) => {draft.settings.socials![index].name=value;})} /><Input label="Profil-Link" value={link.url} placeholder="https://…" onChange={(value) => edit((draft) => {draft.settings.socials![index].url=value;})} /></div><div className="flex flex-wrap items-center justify-between gap-3"><Toggle label="Auf der Website sichtbar" checked={link.published} onChange={(value) => edit((draft) => {draft.settings.socials![index].published=value;})} /><button type="button" className={button+" admin-button-danger"} onClick={() => edit((draft) => draft.settings.socials!.splice(index,1))}>Entfernen</button></div></div>)}
      </section>}
    </div>
  </div>;
}
