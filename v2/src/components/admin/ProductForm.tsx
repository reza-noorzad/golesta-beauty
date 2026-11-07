"use client";
import Image from "next/image";
import type { EditorProps } from "./editor-types";
import { Input, Toggle, button, input, makeId, localTime, isoTime } from "./editor-types";
import { productSlug, uniqueProductSlug } from "@/lib/product-management";
import ImageUpload from "./ImageUpload";
import OrderPosition from "./OrderPosition";
import { Badge, Icon } from "./ui";
export default function ProductForm({data,edit,productId,onMove}:EditorProps & {productId:string;onMove:(index:number)=>void}) {
  const i=data.products.findIndex(product=>product.id===productId);
  const p=data.products[i];if(!p)return null;
  const patch=(index:number,key:keyof typeof p,value:unknown)=>edit(d=>{Object.assign(d.products[index],{[key]:value});});
  return (        <div className="admin-disclosure-body space-y-4">
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Produktname" placeholder="Name des Produkts" value={p.name} onChange={v => edit(d => { d.products[i].name=v; if (!p.name.trim() || p.slug === uniqueProductSlug(p.name,data.products,p.id)) d.products[i].slug=uniqueProductSlug(v,data.products,p.id); })}/>
            <Input label="Marke (optional)" value={p.brand || ""} onChange={v => patch(i,"brand",v)}/>
            <Input label="Produktlink" value={p.slug} onChange={v => {const slug=productSlug(v);patch(i,"slug",slug&&v.endsWith("-")?slug+"-":slug);}}/>
            <label className="block text-sm">Kategorie<select className={`${input} mt-1`} value={p.categoryId} onChange={e => patch(i,"categoryId",e.target.value)}>{data.categories.map(c => <option key={c.id} value={c.id}>{c.name}{c.published?"":" (Entwurf)"}</option>)}</select></label>
            <Input label="Preis in EUR (leer = auf Anfrage)" type="number" value={p.price ?? ""} onChange={v => patch(i,"price",v===""?null:Number(v))}/>
            <label className="admin-field"><span className="admin-field-label">Verfügbarkeit (optional)</span><select className={input} value={p.available===undefined?"":String(p.available)} onChange={event=>edit(d=>{if(event.target.value==="")delete d.products[i].available;else d.products[i].available=event.target.value==="true";})}><option value="">Keine Angabe</option><option value="true">Verfügbar</option><option value="false">Derzeit nicht verfügbar</option></select></label>
          </div>
          <details className="admin-disclosure"><summary>Beschreibung & Inhaltsstoffe</summary><div className="admin-disclosure-body space-y-4"><Input label="Kurzbeschreibung (optional)" multiline value={p.shortDescription || ""} onChange={v => patch(i,"shortDescription",v)}/>
          <Input label="Produktbeschreibung – Absätze mit Enter" multiline value={p.description} onChange={v => patch(i,"description",v)}/>
          <Input label="Inhaltsstoffe (optional)" multiline value={p.ingredients || ""} onChange={v => patch(i,"ingredients",v)}/></div></details>
          <details className="admin-disclosure"><summary>Produkteigenschaften</summary><div className="admin-disclosure-body"><p className="mb-3 text-sm text-[#74685d]">Feste Angaben wie Haartyp, Duft oder Anwendung. Varianten sind dagegen auswählbare Größen oder Mengen mit eigenem Preis.</p>
            {(p.attributes || []).map((a,j) => <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]" key={a.id}>
              <Input label="Eigenschaft" value={a.label} onChange={v => edit(d => { d.products[i].attributes![j].label=v; })}/>
              <Input label="Wert" value={a.value} onChange={v => edit(d => { d.products[i].attributes![j].value=v; })}/>
              <button type="button" className={`${button} self-end`} onClick={() => edit(d => d.products[i].attributes!.splice(j,1))}>Entfernen</button>
            </div>)}
            <button type="button" className={button} onClick={() => edit(d => { (d.products[i].attributes ||= []).push({ id: makeId(), label:"", value:"" }); })}>+ Eigenschaft</button>
          </div></details>
          <details className="admin-disclosure"><summary>Produktbilder <Badge>{p.images.length}/12</Badge></summary><div className="admin-disclosure-body">
            <p className="mb-3 text-sm text-[#74685d]">Wähle mehrere Fotos aus. Das erste Bild ist das Titelbild. JPG, PNG und WebP werden automatisch für die Website optimiert.</p>
            <ImageUpload multiple maxFiles={12-p.images.length} disabled={p.images.length>=12} onUploaded={urls => edit(d => { const product = d.products.find(x=>x.id===p.id); if(product) product.images.push(...urls.slice(0,12-product.images.length)); })}/>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{p.images.map((url,j) =>
              <div key={`${url}-${j}`} className="min-w-0 rounded-xl border border-[#e8ddd0] p-2">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-[#eee5d9]">{j===0 && <span className="absolute left-1 top-1 z-10 rounded-md bg-[#684b28] px-2 py-1 text-xs text-white">Titelbild</span>}<Image src={url} alt={`${p.name} ${j+1}`} fill sizes="200px" className="object-cover"/></div>
                <div className="mt-2 flex flex-wrap gap-1"><button type="button" className={button} disabled={j===0} onClick={()=>edit(d=>{const a=d.products[i].images;const [selected]=a.splice(j,1);a.unshift(selected);})}>Als Titelbild</button><button className={button} type="button" aria-label="Bild nach vorne verschieben" disabled={j===0} onClick={() => edit(d => { const a=d.products[i].images; [a[j-1],a[j]]=[a[j],a[j-1]]; })}>←</button>
                  <button className={button} type="button" aria-label="Bild nach hinten verschieben" disabled={j===p.images.length-1} onClick={() => edit(d => { const a=d.products[i].images; [a[j+1],a[j]]=[a[j],a[j+1]]; })}>→</button>
                  <button className={button+" admin-button-danger"} type="button" aria-label="Produktbild entfernen" onClick={() => {if(confirm("Dieses Bild vom Produkt entfernen?"))edit(d => d.products[i].images.splice(j,1));}}><Icon name="close"/></button></div>
              </div>)}</div>
          </div></details>
          <details className="admin-disclosure"><summary>Größen & Varianten <Badge>{p.variants.length}</Badge></summary><div className="admin-disclosure-body">
            <div className="flex flex-wrap items-center justify-between gap-3"><h3>Verfügbare Ausführungen</h3>
              <button type="button" className={button} onClick={() => edit(d => d.products[i].variants.push({ id: makeId(), name: "", price: null, available: true }))}>+ Variante</button></div>
            <p className="mt-2 text-xs text-[#74685d]">Ergänze auswählbare Größen oder Mengen und ihren Preis.</p>
            {p.variants.map((v,j) => <div key={v.id} className="mt-3 grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_140px_auto]">
              <Input label="Größe / Inhalt" placeholder="z. B. 250 ml oder Größe M" value={v.name} onChange={x => edit(d => { d.products[i].variants[j].name=x; })}/>
              <Input label="Preis €" type="number" value={v.price??""} onChange={x => edit(d => { d.products[i].variants[j].price=x===""?null:Number(x); })}/>
              <div className="flex flex-col justify-center gap-2"><Toggle label="Verfügbar" checked={v.available} onChange={x => edit(d => { d.products[i].variants[j].available=x; })}/>
                <button className={button} type="button" onClick={() => edit(d => d.products[i].variants.splice(j,1))}>Entfernen</button></div>
            </div>)}
          </div></details>
          <details className="admin-disclosure"><summary>Individueller Rabatt <Badge>{p.discount?.enabled?"Aktiv":"Nicht aktiv"}</Badge></summary><div className="admin-disclosure-body">
            <Toggle label="Rabatt aktivieren" checked={p.discount?.enabled || false} onChange={v => edit(d => { d.products[i].discount = { enabled:v, type:p.discount?.type||"percent", value:p.discount?.value||0, label:p.discount?.label||"", startsAt:p.discount?.startsAt||"", endsAt:p.discount?.endsAt||"" }; })}/>
            {p.discount && <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">Art<select className={input} value={p.discount.type} onChange={e => edit(d => { d.products[i].discount!.type=e.target.value as "percent"|"fixed"; })}><option value="percent">Prozent (%)</option><option value="fixed">Fester Betrag (€)</option></select></label>
              <Input label="Rabattwert" type="number" value={p.discount.value} onChange={v => edit(d => { d.products[i].discount!.value=Number(v); })}/>
              <Input label="Hinweis (z. B. Weihnachten)" value={p.discount.label||""} onChange={v => edit(d => { d.products[i].discount!.label=v; })}/>
              <Input label="Beginn (optional)" type="datetime-local" value={localTime(p.discount.startsAt)} onChange={v => edit(d => { d.products[i].discount!.startsAt=isoTime(v); })}/>
              <Input label="Ende (optional)" type="datetime-local" value={localTime(p.discount.endsAt)} onChange={v => edit(d => { d.products[i].discount!.endsAt=isoTime(v); })}/>
            </div>}</div></details>
          <div className="flex flex-wrap gap-x-5 gap-y-1 rounded-xl bg-[#f6f3ee] p-4"><Toggle label="Veröffentlicht" checked={p.published} onChange={v => {if(!v&&p.featured&&!confirm("Produkt als Entwurf speichern und von der Startseitenauswahl entfernen?"))return;edit(d=>{d.products[i].published=v;if(!v){d.products[i].featured=false;delete d.products[i].featuredOrder;}});}}/>
            <a href="#admin-featured-products" className="admin-button admin-button-quiet">Startseitenprodukte verwalten</a>
            <Toggle label="Bewertungen / Kommentare zulassen" checked={p.allowReviews || false} onChange={v => patch(i,"allowReviews",v)}/>
            <Toggle label="Sterne anzeigen" checked={p.showRating || false} onChange={v => patch(i,"showRating",v)}/>
          </div>
          <details className="admin-disclosure"><summary>Reihenfolge im Sortiment</summary><div className="admin-disclosure-body"><OrderPosition key={i} position={i} total={data.products.length} onMove={onMove} label="Position im Sortiment"/></div></details>
          <button type="button" className={`${button} text-red-700`} onClick={() => { if (confirm(`Produkt „${p.name}“ entfernen?`)) edit(d => d.products.splice(i,1)); }}>Produkt entfernen</button>
        </div>);
}
