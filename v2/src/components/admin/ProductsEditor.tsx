"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { EditorProps } from "./editor-types";
import { Input, Toggle, button, card, input, makeId } from "./editor-types";
import { PRODUCT_PAGE_SIZE, uniqueProductSlug } from "@/lib/product-management";
import Reorderable from "./Reorderable";
import ProductForm from "./ProductForm";
import FeaturedProducts from "./FeaturedProducts";
import OrderPosition from "./OrderPosition";
import { Badge, EmptyState, Icon, Pagination } from "./ui";
export default function ProductsEditor({data,edit}:EditorProps) {
  const [search,setSearch]=useState("");const [categoryFilter,setCategoryFilter]=useState("all");const [statusFilter,setStatusFilter]=useState("all");
  const [selected,setSelected]=useState<string|null>(null);const [page,setPage]=useState(0);
  const [showCategories,setShowCategories]=useState(false);const [categoryEditor,setCategoryEditor]=useState<string|null>(null);
  const filtered=useMemo(()=>data.products.filter(product=>{
    const needle=search.trim().toLocaleLowerCase("de");
    return product.id===selected||(!needle||`${product.name} ${product.brand??""}`.toLocaleLowerCase("de").includes(needle))&&(categoryFilter==="all"||product.categoryId===categoryFilter)&&(statusFilter==="all"||(statusFilter==="published"?product.published:!product.published));
  }),[data.products,search,categoryFilter,statusFilter,selected]);
  const currentPage=Math.min(page,Math.max(0,Math.ceil(filtered.length/PRODUCT_PAGE_SIZE)-1));
  const visible=filtered.slice(currentPage*PRODUCT_PAGE_SIZE,(currentPage+1)*PRODUCT_PAGE_SIZE);
  function move(key:"products"|"categories",from:number,to:number) {
    if(from===to||to<0||to>=data[key].length)return;
    edit(draft=>{const rows=draft[key];const [row]=rows.splice(from,1);rows.splice(to,0,row as never);rows.forEach((row,index)=>row.sortOrder=index);});
  }
  return <div className="space-y-5">
    <section className={card}>
      <div className="admin-card-title"><button type="button" aria-expanded={showCategories} className="font-serif text-2xl text-left" onClick={()=>setShowCategories(previous=>!previous)}>Produktkategorien ({data.categories.length})</button><button type="button" className={button} onClick={()=>{const id=makeId();setShowCategories(true);setCategoryEditor(id);edit(draft=>draft.categories.push({id,name:"",published:false,sortOrder:draft.categories.length}));}}>+ Kategorie</button></div>
      {showCategories&&<Reorderable compact items={data.categories} idOf={category=>category.id} move={(from,to)=>move("categories",from,to)}>{(category,index)=>{
        const count=data.products.filter(product=>product.categoryId===category.id).length;
        return <details className="admin-disclosure" open={categoryEditor===category.id}><summary onClick={event=>{event.preventDefault();setCategoryEditor(previous=>previous===category.id?null:category.id);}}><span className="min-w-0 flex-1">{category.name||"Neue Kategorie"}</span><Badge>{count} Produkte</Badge><Badge tone={category.published?"success":"neutral"}>{category.published?"Veröffentlicht":"Entwurf"}</Badge></summary><div className="admin-disclosure-body space-y-4">
          <Input label="Kategoriename" placeholder="Name der Kategorie" value={category.name} onChange={value=>edit(draft=>{draft.categories[index].name=value;})}/>
          <Toggle label="Kategorie veröffentlichen" checked={category.published} onChange={value=>{const affected=data.products.filter(product=>product.categoryId===category.id&&product.featured);if(!value&&affected.length&&!confirm("Kategorie ausblenden und ihre Produkte aus der Startseitenauswahl entfernen?"))return;edit(draft=>{draft.categories[index].published=value;if(!value)draft.products.filter(product=>product.categoryId===category.id).forEach(product=>{product.featured=false;delete product.featuredOrder;});});}}/>
          {count>0&&<p className="text-sm admin-muted">Diese Kategorie enthält Produkte. Ordne sie vor dem Entfernen einer anderen Kategorie zu.</p>}
          <OrderPosition key={index} position={index} total={data.categories.length} onMove={target=>move("categories",index,target)} label="Position der Kategorie"/>
          <button type="button" className={button+" admin-button-danger"} disabled={count>0} onClick={()=>{if(confirm("Diese leere Kategorie entfernen?"))edit(draft=>draft.categories.splice(index,1));}}>Kategorie entfernen</button>
        </div></details>;
      }}</Reorderable>}
    </section>
    <section className="space-y-4">
      <div className="admin-card-title"><h2>Produkte ({data.products.length})</h2><button type="button" className={button} onClick={()=>{
        if(!data.categories.length){setShowCategories(true);alert("Bitte lege zuerst eine Kategorie an.");return;}
        const id=makeId();setSearch("");setCategoryFilter("all");setStatusFilter("all");setPage(0);setSelected(id);
        edit(draft=>{draft.products.unshift({id,name:"",slug:uniqueProductSlug("produkt",draft.products),description:"",price:null,currency:"EUR",categoryId:draft.categories[0].id,images:[],published:false,featured:false,sortOrder:0,variants:[],allowReviews:false,showRating:false,attributes:[],ingredients:""});draft.products.forEach((product,index)=>product.sortOrder=index);});
      }}>+ Neues Produkt (Entwurf)</button></div>
      <FeaturedProducts data={data} edit={edit}/>
      <div className={card+" space-y-3"}><h3>Produkt finden</h3><div className="grid gap-3 sm:grid-cols-3">
        <label className="admin-field"><span className="admin-field-label">Suche</span><input type="search" value={search} onChange={event=>{setSearch(event.target.value);setSelected(null);setPage(0);}} placeholder="Name oder Marke suchen" className={input}/></label>
        <label className="admin-field"><span className="admin-field-label">Kategorie</span><select className={input} value={categoryFilter} onChange={event=>{setCategoryFilter(event.target.value);setSelected(null);setPage(0);}}><option value="all">Alle Kategorien</option>{data.categories.map(category=><option key={category.id} value={category.id}>{category.name||"Ohne Name"}</option>)}</select></label>
        <label className="admin-field"><span className="admin-field-label">Status</span><select className={input} value={statusFilter} onChange={event=>{setStatusFilter(event.target.value);setSelected(null);setPage(0);}}><option value="all">Alle</option><option value="published">Veröffentlicht</option><option value="draft">Entwürfe</option></select></label>
      </div><p className="text-xs admin-muted">{filtered.length} {filtered.length===1?"Produkt gefunden":"Produkte gefunden"} · Zum Bearbeiten einen Produktnamen öffnen. Das geöffnete Produkt bleibt während der Bearbeitung sichtbar.</p></div>
      <Reorderable compact items={visible} idOf={product=>product.id} move={(from,to)=>move("products",data.products.findIndex(product=>product.id===visible[from].id),data.products.findIndex(product=>product.id===visible[to].id))}>{product=><details className="admin-disclosure" data-product-id={product.id} open={selected===product.id}>
        <summary onClick={event=>{event.preventDefault();setSelected(previous=>previous===product.id?null:product.id);}}><span className="admin-summary-content"><span className="admin-thumb">{product.images[0]?<Image src={product.images[0]} alt="" fill sizes="42px" className="object-cover"/>:<span className="flex h-full items-center justify-center"><Icon name="products"/></span>}</span><span className="min-w-0"><span className="admin-summary-name">{product.name||"Neues Produkt"}</span><span className="admin-summary-meta">{product.brand||"Produkt bearbeiten"}{product.price!==null?` · ${new Intl.NumberFormat("de-AT",{style:"currency",currency:"EUR"}).format(product.price)}`:""}</span></span></span><Badge tone={product.published?"success":"neutral"}>{product.published?"Veröffentlicht":"Entwurf"}</Badge></summary>
        {selected===product.id&&<ProductForm data={data} edit={edit} productId={product.id} onMove={target=>{move("products",data.products.findIndex(item=>item.id===product.id),target);setSearch("");setCategoryFilter("all");setStatusFilter("all");setPage(Math.floor(target/PRODUCT_PAGE_SIZE));}}/>}
      </details>}</Reorderable>
      {!filtered.length&&<EmptyState title={data.products.length?"Keine passenden Produkte":"Noch keine Produkte angelegt"} icon="products">{data.products.length?"Passe die Suche oder die Filter an.":"Lege eine Kategorie und dein erstes Produkt an."}</EmptyState>}
      <Pagination page={currentPage} total={filtered.length} size={PRODUCT_PAGE_SIZE} onChange={setPage} label="Produktseiten"/>
    </section>
  </div>;
}
