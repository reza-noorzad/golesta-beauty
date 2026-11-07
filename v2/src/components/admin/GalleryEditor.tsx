"use client";
import Image from "next/image";
import { useState } from "react";
import type { EditorProps } from "./editor-types";
import { Input, Toggle, button, makeId } from "./editor-types";
import { GALLERY_PAGE_SIZE } from "@/lib/product-management";
import Reorderable from "./Reorderable";
import ImageUpload from "./ImageUpload";
import OrderPosition from "./OrderPosition";
import { Badge, EmptyState, Tabs, Icon, Pagination } from "./ui";
export default function GalleryEditor({data,edit}:EditorProps) {
  const [tab,setTab]=useState("all");const [page,setPage]=useState(0);
  const filtered=tab==="home"?data.gallery.filter(image=>image.homepage):data.gallery;
  const currentPage=Math.min(page,Math.max(0,Math.ceil(filtered.length/GALLERY_PAGE_SIZE)-1));
  const visible=filtered.slice(currentPage*GALLERY_PAGE_SIZE,(currentPage+1)*GALLERY_PAGE_SIZE);
  const published=data.gallery.filter(image=>image.homepage&&image.published).length;
  function move(from:number,to:number) {
    if(to<0||to>=visible.length||from===to)return;
    edit(draft=>{const source=draft.gallery.findIndex(image=>image.id===visible[from].id);const target=draft.gallery.findIndex(image=>image.id===visible[to].id);const [image]=draft.gallery.splice(source,1);draft.gallery.splice(target,0,image);draft.gallery.forEach((image,index)=>image.sortOrder=index);});
  }
  return <div className="space-y-5">
    <section className="admin-upload-panel"><div className="max-w-md"><div className="flex items-center gap-2 mb-2"><Icon name="gallery"/><h2>Neue Einblicke hinzufügen</h2></div><p className="text-sm admin-muted">Wähle ein oder mehrere Fotos. Neue Bilder bleiben als Entwurf verborgen, bis du sie veröffentlichst.</p><p className="mt-2 text-xs admin-muted">{data.gallery.length}/200 Bilder</p></div><ImageUpload multiple maxFiles={200-data.gallery.length} label="+ Mehrere Fotos auswählen" onUploaded={urls=>{
      setTab("all");setPage(Math.floor((data.gallery.length+urls.length-1)/GALLERY_PAGE_SIZE));
      edit(draft=>urls.forEach(url=>{if(draft.gallery.length<200)draft.gallery.push({id:makeId(),image:url,alt:"Golesta Beauty",published:false,homepage:false,sortOrder:draft.gallery.length});}));
    }}/></section>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2>Deine Galerie</h2><Badge>{published} Bilder auf der Startseite ausgewählt</Badge></div>
    <p className="text-sm admin-muted">Auf der Startseite erscheinen höchstens {data.settings.galleryLimit??6} veröffentlichte, ausgewählte Bilder in dieser Reihenfolge. Entwürfe bleiben verborgen.</p>
    <Tabs label="Galeriebereiche" value={tab} onChange={value=>{setTab(value);setPage(0);}} panelId="admin-gallery-panel" items={[{value:"all",label:`Gesamte Galerie (${data.gallery.length})`},{value:"home",label:`Startseite (${data.gallery.filter(image=>image.homepage).length})`}]}/>
    <div role="tabpanel" id="admin-gallery-panel" aria-label={tab==="all"?"Gesamte Galerie":"Startseite"} className="space-y-4">
      {!filtered.length&&<EmptyState title={tab==="all"?"Deine Galerie wartet auf neue Bilder":"Noch keine Startseitenbilder ausgewählt"} icon="gallery">Wähle Fotos aus und gestalte den ersten Eindruck deines Salons.</EmptyState>}
      <Reorderable compact items={visible} idOf={image=>image.id} move={move} className="admin-gallery-grid" itemClassName="admin-card admin-gallery-card">{image=>{
        const index=data.gallery.findIndex(entry=>entry.id===image.id);
        return <div className="space-y-3"><div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#eee5d9]">{image.image&&<Image src={image.image} alt={image.alt} fill sizes="(max-width:639px) 45vw, (max-width:1279px) 45vw, 26vw" className="object-cover"/>}<div className="absolute left-2 top-2 flex flex-wrap gap-1"><Badge tone={image.published?"success":"neutral"}>{image.published?"Veröffentlicht":"Entwurf"}</Badge>{image.homepage&&<Badge>Startseite</Badge>}</div></div>
          <div className="space-y-1"><Toggle label="In der Galerie sichtbar" checked={image.published} onChange={value=>edit(draft=>{draft.gallery[index].published=value;})}/><label className="admin-toggle"><input type="checkbox" checked={image.homepage??false} disabled={!image.published&&!image.homepage} onChange={event=>edit(draft=>{draft.gallery[index].homepage=event.target.checked;})}/><span>Für die Startseite auswählen</span></label>{!image.published&&<p className="text-xs admin-muted">{image.homepage?"Ausgewählter Entwurf – bleibt verborgen.":"Für die Startseite zuerst veröffentlichen."}</p>}</div>
          <details className="admin-disclosure"><summary>Bild bearbeiten</summary><div className="admin-disclosure-body space-y-3"><Input label="Bildbeschreibung" value={image.alt} placeholder="Was ist auf diesem Bild zu sehen?" onChange={value=>edit(draft=>{draft.gallery[index].alt=value;})}/><OrderPosition key={index} position={index} total={data.gallery.length} label="Position in der gesamten Galerie" onMove={target=>{edit(draft=>{const from=draft.gallery.findIndex(entry=>entry.id===image.id);const [entry]=draft.gallery.splice(from,1);draft.gallery.splice(target,0,entry);draft.gallery.forEach((entry,index)=>entry.sortOrder=index);});setTab("all");setPage(Math.floor(target/GALLERY_PAGE_SIZE));}}/><div className="flex flex-wrap gap-2"><ImageUpload label="Bild ersetzen" onUploaded={urls=>edit(draft=>{const found=draft.gallery.find(entry=>entry.id===image.id);if(found)found.image=urls[0];})}/><button type="button" className={button+" admin-button-danger"} onClick={()=>{if(confirm("Dieses Bild aus der Galerie entfernen?"))edit(draft=>{draft.gallery.splice(index,1);draft.gallery.forEach((image,index)=>image.sortOrder=index);});}}>Entfernen</button></div></div></details>
        </div>;
      }}</Reorderable>
      <Pagination page={currentPage} total={filtered.length} size={GALLERY_PAGE_SIZE} onChange={setPage} label="Galerieseiten"/>
    </div>
  </div>;
}
