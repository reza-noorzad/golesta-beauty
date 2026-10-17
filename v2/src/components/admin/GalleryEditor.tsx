"use client";
import Image from "next/image";
import { useState } from "react";
import type { EditorProps } from "./editor-types";
import { Input, Toggle, button, card, makeId } from "./editor-types";
import Reorderable from "./Reorderable";
import ImageUpload from "./ImageUpload";

export default function GalleryEditor({ data, edit }: EditorProps) {
  const [tab, setTab] = useState<"all" | "home">("all");
  const filtered = tab === "home" ? data.gallery.filter(x => x.homepage) : data.gallery;
  function move(from: number, to: number) {
    if (to < 0 || to >= filtered.length || from === to) return;
    const sourceId = filtered[from].id;
    const destinationId = filtered[to].id;
    edit(d => { const fromIndex=d.gallery.findIndex(x=>x.id===sourceId),toIndex=d.gallery.findIndex(x=>x.id===destinationId);
      const [x]=d.gallery.splice(fromIndex,1);d.gallery.splice(toIndex,0,x);d.gallery.forEach((g,i)=>g.sortOrder=i); });
  }
  const featured = data.gallery.filter(x => x.homepage && x.published).length;
  return <div className="space-y-7">
    <section className={card}>
      <h2 className="font-serif text-2xl">Bilder hochladen</h2>
      <p className="my-3 text-sm text-[#74685d]">Fotos können gleichzeitig ausgewählt werden. Neue Fotos werden als Entwurf angelegt. Du bestimmst, welche in der Startseite erscheinen.</p>
      <ImageUpload multiple label="+ Mehrere Fotos auswählen" onUploaded={urls => edit(d => urls.forEach(url => { if (d.gallery.length<200) d.gallery.unshift({ id: makeId(), image:url, alt:"Golesta Beauty", published:false, homepage:false, sortOrder:0 }); }))}/>
    </section>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl">Galerie ({data.gallery.length})</h2><span className="text-sm text-[#74685d]">{featured} Fotos für die Startseite ausgewählt</span></div>
    <div role="tablist" aria-label="Galeriebereiche" className="flex flex-wrap gap-2">
      <button role="tab" aria-selected={tab === "all"} type="button" className={`${button} ${tab === "all" ? "bg-[#eae0d3] font-semibold" : ""}`} onClick={() => setTab("all")}>Gesamte Galerie ({data.gallery.length})</button>
      <button role="tab" aria-selected={tab === "home"} type="button" className={`${button} ${tab === "home" ? "bg-[#eae0d3] font-semibold" : ""}`} onClick={() => setTab("home")}>Startseite ({data.gallery.filter(x => x.homepage).length})</button>
    </div>
    <p className="text-sm text-[#74685d]">{tab === "all" ? "Alle Bilder: veröffentlichen, als Startseitenbild markieren und bearbeiten." : "Nur für die Startseite ausgewählte Bilder. Markierung ausschalten, um ein Bild von der Startseite zu entfernen."} Mit Griff oder Pfeilen sortieren.</p>
    <Reorderable items={filtered} idOf={g => g.id} move={move} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" itemClassName="rounded-2xl border border-[#e8ddd0] bg-white p-3">
      {(g) => { const i=data.gallery.findIndex(x=>x.id===g.id); return <div className="min-w-0 space-y-3"><div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#eee5d9]">{g.image && <Image src={g.image} alt={g.alt} fill sizes="(max-width: 639px) 100vw, 33vw" className="object-cover"/>}</div>
        <Input label="Bildbeschreibung" value={g.alt} onChange={v => edit(d => { d.gallery[i].alt=v; })}/>
        <div className="flex flex-col gap-2">
          <Toggle label="In Galerie veröffentlicht" checked={g.published} onChange={v => edit(d => { d.gallery[i].published=v; })}/>
          <Toggle label="Auf Startseite anzeigen" checked={g.homepage || false} onChange={v => edit(d => { d.gallery[i].homepage=v; })}/>
        </div>
        <div className="flex flex-wrap gap-2"><ImageUpload label="Bild ersetzen" onUploaded={urls => edit(d => { const image=d.gallery.find(x=>x.id===g.id); if(image)image.image=urls[0]; })}/>
        <button className={`${button} text-red-700`} type="button" onClick={() => { if (confirm("Bild aus Galerie entfernen? (Cloudinary-Datei wird nicht automatisch gelöscht.)")) edit(d => d.gallery.splice(i,1)); }}>Entfernen</button></div>
      </div>; }}
    </Reorderable>
  </div>;
}
