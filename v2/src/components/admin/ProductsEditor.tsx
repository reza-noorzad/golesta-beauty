"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { EditorProps } from "./editor-types";
import { Input, Toggle, button, card, input, makeId, localTime, isoTime } from "./editor-types";
import ImageUpload from "./ImageUpload";
import Reorderable from "./Reorderable";

function slugify(input: string) {
  return input.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 140);
}
export default function ProductsEditor({ data, edit }: EditorProps) {
  const [search,setSearch]=useState("");
  const [categoryFilter,setCategoryFilter]=useState("all");
  const [statusFilter,setStatusFilter]=useState("all");
  const [showFeatured,setShowFeatured]=useState(false);
  const [showCategories,setShowCategories]=useState(false);
  const [showAllProducts,setShowAllProducts]=useState(false);
  const featured=data.products.filter(p=>p.featured&&p.published);
  const filtered=useMemo(()=>data.products.filter(p=>{
    const needle=search.trim().toLocaleLowerCase("de");
    return (!needle || `${p.name} ${p.brand||""} ${p.slug}`.toLocaleLowerCase("de").includes(needle))
      && (categoryFilter==="all" || p.categoryId===categoryFilter)
      && (statusFilter==="all" || (statusFilter==="published" ? p.published : !p.published));
  }),[data.products,search,categoryFilter,statusFilter]);
  const visible=showAllProducts?filtered:filtered.slice(0,15);
  function move(key: "products" | "categories", from: number, to: number) {
    if (to < 0 || to >= data[key].length || from === to) return;
    edit(d => { const rows = d[key]; const [row] = rows.splice(from, 1); rows.splice(to, 0, row as never); rows.forEach((r, i) => r.sortOrder = i); });
  }
  const patch = (i: number, key: keyof typeof data.products[number], value: unknown) => edit(d => { Object.assign(d.products[i], { [key]: value }); });
  return <div className="space-y-9">
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3"><button type="button" aria-expanded={showCategories} className="font-serif text-2xl text-left" onClick={()=>setShowCategories(v=>!v)}>{showCategories?"▾":"▸"} Produktkategorien ({data.categories.length})</button>
        <button type="button" className={button} onClick={() => { setShowCategories(true); edit(d => d.categories.push({ id: makeId(), name: "", published: false, sortOrder: d.categories.length })); }}>+ Kategorie</button></div>
      {showCategories && <p className="mt-2 text-sm text-[#74685d]">Reihenfolge durch Ziehen ändern.</p>}
      {showCategories && <div className="mt-4"><Reorderable items={data.categories} idOf={x => x.id} move={(a,b) => move("categories",a,b)}>{(c,i) =>
        <div className="rounded-xl border border-[#e8ddd0] p-3">
          <div className="flex flex-wrap items-end gap-3"><div className="min-w-[180px] flex-1"><Input label="Kategoriename" value={c.name} onChange={v => edit(d => { d.categories[i].name = v; })}/></div>
            <Toggle label="Veröffentlicht" checked={c.published} onChange={v => edit(d => { d.categories[i].published = v; })}/>
            <button type="button" className={button} onClick={() => {
              if (data.products.some(p => p.categoryId === c.id)) { alert("Kategorie wird noch von Produkten verwendet."); return; }
              if (confirm("Kategorie entfernen?")) edit(d => d.categories.splice(i,1));
            }}>Entfernen</button></div>
        </div>}</Reorderable></div>}
    </section>

    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl">Produkte ({data.products.length})</h2>
        <button type="button" className={button} onClick={() => {
          if (!data.categories.length) { setShowCategories(true); alert("Bitte zuerst eine Kategorie anlegen."); return; }
          edit(d => d.products.unshift({ id: makeId(), name: "", slug: `produkt-${crypto.randomUUID().slice(0,8)}`, description: "", price: null, currency: "EUR", categoryId: d.categories[0].id, images: [], published: false, featured: false, sortOrder: 0, variants: [], allowReviews: false, showRating: false, attributes: [], ingredients: "" }));
        }}>+ Neues Produkt (Entwurf)</button></div>
      <p className="text-sm text-[#74685d]">Zum Bearbeiten einen Produktnamen anklicken. Entwürfe sind nicht öffentlich sichtbar.</p>
      <section className={card}>
        <button type="button" aria-expanded={showFeatured} className="flex w-full items-center justify-between gap-3 text-left" onClick={()=>setShowFeatured(v=>!v)}><span className="font-serif text-xl">{showFeatured?"▾":"▸"} Produkte auf der Startseite</span><span className="text-sm">{featured.length} ausgewählt · maximal 3 sichtbar</span></button>
        {showFeatured && <div className="mt-4 space-y-3"><p className="text-sm text-[#74685d]">Auf der Startseite erscheinen derzeit die ersten drei veröffentlichten, ausgewählten Produkte. Die Reihenfolge folgt der Produktliste. Weitere ausgewählte Produkte bleiben im Shop sichtbar, aber nicht auf der Startseite.</p>
          <div className="grid gap-2 sm:grid-cols-2">{data.products.map(p=><label key={p.id} className="flex items-center gap-3 rounded-xl border p-3 text-sm"><input type="checkbox" checked={p.featured} onChange={e=>edit(d=>{const found=d.products.find(x=>x.id===p.id);if(found) found.featured=e.target.checked;})}/><span className="flex-1">{p.name || "Neues Produkt"}</span><span className="text-xs text-[#74685d]">{p.published?"Online":"Entwurf"}</span></label>)}</div>
        </div>}
      </section>
      <div className={`${card} space-y-3`}><h3 className="font-medium">Produkt finden</h3>
        <div className="grid gap-3 sm:grid-cols-3"><label className="text-sm">Suche<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, Marke oder URL suchen" className={`${input} mt-1`}/></label>
        <label className="text-sm">Kategorie<select className={`${input} mt-1`} value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option value="all">Alle Kategorien</option>{data.categories.map(c=><option key={c.id} value={c.id}>{c.name || "Ohne Name"}</option>)}</select></label>
        <label className="text-sm">Status<select className={`${input} mt-1`} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">Alle</option><option value="published">Veröffentlicht</option><option value="draft">Entwürfe</option></select></label></div>
        <p className="text-xs text-[#74685d]">{filtered.length} Treffer · Sortierung per Ziehen am Griff möglich.</p>
      </div>
      <Reorderable showArrows={false} items={visible} idOf={p => p.id} move={(a,b) => { const from=data.products.findIndex(x=>x.id===visible[a].id); const to=data.products.findIndex(x=>x.id===visible[b].id); move("products",from,to); }}>{(p) => { const i=data.products.findIndex(x=>x.id===p.id); return <details className="rounded-2xl border border-[#e8ddd0] bg-white p-4" key={p.id}>
        <summary className="cursor-pointer select-none text-base font-semibold">{p.name || "Neues Produkt"} · {p.published ? "Veröffentlicht" : "Entwurf"}</summary>
        <div className="mt-5 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Produktname" value={p.name} onChange={v => edit(d => { d.products[i].name=v; if (p.slug.startsWith("produkt-") || p.slug === slugify(p.name)) d.products[i].slug=slugify(v)||p.slug; })}/>
            <Input label="Marke (optional)" value={p.brand || ""} onChange={v => patch(i,"brand",v)}/>
            <Input label="Produktlink / URL (automatisch; nur bei Bedarf ändern)" value={p.slug} onChange={v => patch(i,"slug",slugify(v))}/>
            <label className="block text-sm">Kategorie<select className={`${input} mt-1`} value={p.categoryId} onChange={e => patch(i,"categoryId",e.target.value)}>{data.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <Input label="Preis in EUR (leer = auf Anfrage)" type="number" value={p.price ?? ""} onChange={v => patch(i,"price",v===""?null:Number(v))}/>
          </div>
          <Input label="Kurzbeschreibung (optional)" multiline value={p.shortDescription || ""} onChange={v => patch(i,"shortDescription",v)}/>
          <Input label="Produktbeschreibung – Absätze mit Enter" multiline value={p.description} onChange={v => patch(i,"description",v)}/>
          <Input label="Inhaltsstoffe / INCI (optional)" multiline value={p.ingredients || ""} onChange={v => patch(i,"ingredients",v)}/>
          <div className={card}>
            <h3 className="mb-2 font-serif text-xl">Weitere Produkteigenschaften</h3><p className="mb-3 text-sm text-[#74685d]">Feste Angaben wie Haartyp, Duft oder Anwendung. Varianten sind dagegen auswählbare Größen oder Mengen mit eigenem Preis.</p>
            {(p.attributes || []).map((a,j) => <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]" key={a.id}>
              <Input label="Eigenschaft" value={a.label} onChange={v => edit(d => { d.products[i].attributes![j].label=v; })}/>
              <Input label="Wert" value={a.value} onChange={v => edit(d => { d.products[i].attributes![j].value=v; })}/>
              <button type="button" className={`${button} self-end`} onClick={() => edit(d => d.products[i].attributes!.splice(j,1))}>Entfernen</button>
            </div>)}
            <button type="button" className={button} onClick={() => edit(d => { (d.products[i].attributes ||= []).push({ id: makeId(), label:"", value:"" }); })}>+ Eigenschaft</button>
          </div>
          <div className={card}>
            <h3 className="font-serif text-xl">Produktbilder ({p.images.length}/12)</h3>
            <p className="mb-3 text-sm text-[#74685d]">Mehrere Bilder gleichzeitig hochladen. Das erste Foto ist das Titelbild. JPG, PNG und WebP werden für die Website verkleinert und in WebP umgewandelt; Speicherung in Cloudinary.</p>
            <ImageUpload multiple disabled={p.images.length>=12} onUploaded={urls => edit(d => { const product = d.products.find(x=>x.id===p.id); if(product) product.images.push(...urls.slice(0,12-product.images.length)); })}/>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{p.images.map((url,j) =>
              <div key={`${url}-${j}`} className="min-w-0 rounded-xl border border-[#e8ddd0] p-2">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-[#eee5d9]">{j===0 && <span className="absolute left-1 top-1 z-10 rounded-md bg-[#684b28] px-2 py-1 text-xs text-white">Titelbild</span>}<Image src={url} alt={`${p.name} ${j+1}`} fill sizes="200px" className="object-cover"/></div>
                <div className="mt-2 flex flex-wrap gap-1"><button type="button" className={button} disabled={j===0} onClick={()=>edit(d=>{const a=d.products[i].images;const [selected]=a.splice(j,1);a.unshift(selected);})}>Als Titelbild</button><button className={button} type="button" disabled={j===0} onClick={() => edit(d => { const a=d.products[i].images; [a[j-1],a[j]]=[a[j],a[j-1]]; })}>←</button>
                  <button className={button} type="button" disabled={j===p.images.length-1} onClick={() => edit(d => { const a=d.products[i].images; [a[j+1],a[j]]=[a[j],a[j+1]]; })}>→</button>
                  <button className={button} type="button" onClick={() => edit(d => d.products[i].images.splice(j,1))}>×</button></div>
              </div>)}</div>
          </div>
          <div className={card}>
            <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-serif text-xl">Varianten / Größen</h3>
              <button type="button" className={button} onClick={() => edit(d => d.products[i].variants.push({ id: makeId(), name: "", price: null, available: true }))}>+ Variante</button></div>
            <p className="mt-2 text-xs text-[#74685d]">Beispiel: 500 ml, 1 Liter, Größe M. Links eine Größe oder Menge wie „500 ml“ eingeben, rechts den zugehörigen Preis nur als Zahl. Ist kein Variantenpreis angegeben, gilt der Produktpreis.</p>
            {p.variants.map((v,j) => <div key={v.id} className="mt-3 grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_140px_auto]">
              <Input label="Größe / Inhalt" value={v.name} onChange={x => edit(d => { d.products[i].variants[j].name=x; })}/>
              <Input label="Preis €" type="number" value={v.price??""} onChange={x => edit(d => { d.products[i].variants[j].price=x===""?null:Number(x); })}/>
              <div className="flex flex-col justify-center gap-2"><Toggle label="Verfügbar" checked={v.available} onChange={x => edit(d => { d.products[i].variants[j].available=x; })}/>
                <button className={button} type="button" onClick={() => edit(d => d.products[i].variants.splice(j,1))}>Entfernen</button></div>
            </div>)}
          </div>
          <div className={card}><h3 className="font-serif text-xl">Individueller Rabatt</h3>
            <Toggle label="Rabatt aktivieren" checked={p.discount?.enabled || false} onChange={v => edit(d => { d.products[i].discount = { enabled:v, type:p.discount?.type||"percent", value:p.discount?.value||0, label:p.discount?.label||"", startsAt:p.discount?.startsAt||"", endsAt:p.discount?.endsAt||"" }; })}/>
            {p.discount && <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">Art<select className={input} value={p.discount.type} onChange={e => edit(d => { d.products[i].discount!.type=e.target.value as "percent"|"fixed"; })}><option value="percent">Prozent (%)</option><option value="fixed">Fester Betrag (€)</option></select></label>
              <Input label="Rabattwert" type="number" value={p.discount.value} onChange={v => edit(d => { d.products[i].discount!.value=Number(v); })}/>
              <Input label="Hinweis (z. B. Weihnachten)" value={p.discount.label||""} onChange={v => edit(d => { d.products[i].discount!.label=v; })}/>
              <Input label="Beginn (optional)" type="datetime-local" value={localTime(p.discount.startsAt)} onChange={v => edit(d => { d.products[i].discount!.startsAt=isoTime(v); })}/>
              <Input label="Ende (optional)" type="datetime-local" value={localTime(p.discount.endsAt)} onChange={v => edit(d => { d.products[i].discount!.endsAt=isoTime(v); })}/>
            </div>}</div>
          <div className="flex flex-wrap gap-4"><Toggle label="Veröffentlicht" checked={p.published} onChange={v => patch(i,"published",v)}/>
            <Toggle label="Auf Startseite" checked={p.featured} onChange={v => patch(i,"featured",v)}/>
            <Toggle label="Bewertungen / Kommentare zulassen" checked={p.allowReviews || false} onChange={v => patch(i,"allowReviews",v)}/>
            <Toggle label="Sterne anzeigen" checked={p.showRating || false} onChange={v => patch(i,"showRating",v)}/>
          </div>
          <button type="button" className={`${button} text-red-700`} onClick={() => { if (confirm(`Produkt „${p.name}“ entfernen?`)) edit(d => d.products.splice(i,1)); }}>Produkt entfernen</button>
        </div>
      </details>; }}</Reorderable>
      {!showAllProducts && filtered.length>15 && <button type="button" className={button} onClick={()=>setShowAllProducts(true)}>Alle {filtered.length} Treffer anzeigen</button>}
    </section>
  </div>;
}
