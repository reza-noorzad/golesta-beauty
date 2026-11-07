"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { readServices, saveServices, type ServiceCategory } from "@/lib/services-store";
import Reorderable from "@/components/admin/Reorderable";
import { Input, button, card, input, makeId } from "@/components/admin/editor-types";
import { Badge, EmptyState, Icon, LoadingState, Notice, PageHeader, SaveBar } from "@/components/admin/ui";
import { useUnsavedChanges } from "@/components/admin/useUnsavedChanges";
export default function ServicesAdmin() {
  const [categories,setCategories]=useState<ServiceCategory[]>([]);
  const [selected,setSelected]=useState<string|null>(null);
  const [expanded,setExpanded]=useState<string|null>(null);
  const [search,setSearch]=useState("");
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [dirty,setDirty]=useState(false);
  const [loadError,setLoadError]=useState(false);
  const [updatedAt,setUpdatedAt]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const [tone,setTone]=useState<"success"|"error">("success");
  const current=categories.find((category) => category.id===selected);
  useEffect(() => {
    let active=true;
    readServices().then((result) => {if(active){setCategories(result.categories);setSelected(result.categories[0]?.id||null);setUpdatedAt(result.updatedAt);}})
      .catch((error) => {if(active){setMessage(error instanceof Error?error.message:"Die Leistungen konnten nicht geladen werden.");setLoadError(true);}})
      .finally(() => {if(active)setLoading(false);});
    return () => {active=false;};
  },[]);
  useUnsavedChanges(dirty);
  function update(mutate:(draft:ServiceCategory[]) => void) {
    setCategories((previous) => {const draft=structuredClone(previous);mutate(draft);return draft.map((category,index) => ({...category,sortOrder:index}));});
    setDirty(true);setMessage("");
  }
  function choose(id:string) {setSelected(id);setExpanded(null);setSearch("");}
  function moveCategory(from:number,to:number) {if(to<0||to>=categories.length||from===to)return;update((draft) => {const [category]=draft.splice(from,1);draft.splice(to,0,category);});}
  function moveService(from:number,to:number) {
    if(!current||to<0||to>=current.items.length||from===to)return;
    update((draft) => {const items=draft.find((category) => category.id===current.id)!.items;const [item]=items.splice(from,1);items.splice(to,0,item);});
  }
  async function save() {
    if(saving||!dirty)return;
    if(!auth?.currentUser){setTone("error");setMessage("Bitte erneut anmelden.");return;}
    if(categories.some((category) => !category.title.trim()||category.items.some((item) => !item.name.trim()))){setTone("error");setMessage("Bitte gib allen Kategorien und Leistungen einen Namen.");return;}
    setSaving(true);setMessage("");
    try{setUpdatedAt(await saveServices(categories,updatedAt));setDirty(false);setTone("success");setMessage("Deine Leistungen und Preise wurden gespeichert.");}
    catch(error){setTone("error");setMessage(error instanceof Error?error.message:"Speichern fehlgeschlagen. Bitte erneut versuchen.");}
    finally{setSaving(false);}
  }
  return <section>
    <PageHeader title="Leistungen & Preise" description="Dein Angebot im Überblick. Wähle eine Kategorie und öffne nur die Leistung, die du bearbeiten möchtest." />
    {loading?<LoadingState>Leistungen werden geladen …</LoadingState>:loadError?<div className="space-y-4"><Notice tone="error">{message}</Notice><button type="button" className={button} onClick={() => window.location.reload()}>Erneut versuchen</button></div>:<>
      <SaveBar dirty={dirty} busy={saving} onSave={() => void save()} />
      {message&&<div className="mb-5"><Notice tone={tone}>{message}</Notice></div>}
      <fieldset disabled={saving} className="min-w-0 space-y-5" aria-busy={saving}>
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm admin-muted">{categories.length} Kategorien · {categories.reduce((count,category) => count+category.items.length,0)} Leistungen</p><button type="button" className={button} onClick={() => {const id=makeId();update((draft) => draft.push({id,title:"",desc:"",sortOrder:draft.length,items:[]}));choose(id);}}>+ Kategorie</button></div>
        <div className="admin-service-choice"><label className="admin-field"><span className="admin-field-label">Kategorie auswählen</span><select className={input} value={selected||""} onChange={(event) => choose(event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.title||"Neue Kategorie"}</option>)}</select></label></div>
        <div className="admin-service-layout">
          <aside className={card+" admin-service-categories"} aria-label="Leistungskategorien"><h2 className="mb-4">Kategorien</h2><div className="space-y-1">{categories.map((category) => <button type="button" key={category.id} aria-pressed={selected===category.id} className={`admin-nav-link w-full text-left ${selected===category.id?"bg-[#eee6d8] text-[#654924]":""}`} onClick={() => choose(category.id)}><span className="min-w-0 flex-1">{category.title||"Neue Kategorie"}</span><span className="text-xs">{category.items.length}</span></button>)}</div></aside>
          {current?<div className="min-w-0 space-y-4" key={current.id}>
            <details className="admin-disclosure"><summary><span className="min-w-0 flex-1">{current.title||"Neue Kategorie"}</span><Badge>Kategorie bearbeiten</Badge></summary><div className="admin-disclosure-body space-y-4">
              <Input label="Kategoriename" placeholder="Name der Kategorie" value={current.title} onChange={(value) => update((draft) => {draft.find((category) => category.id===current.id)!.title=value;})} />
              <Input label="Beschreibung" multiline placeholder="Kurze Beschreibung des Angebots" value={current.desc} onChange={(value) => update((draft) => {draft.find((category) => category.id===current.id)!.desc=value;})} />
              <button type="button" className={button+" admin-button-danger"} onClick={() => {if(confirm(`Kategorie „${current.title||"Neue Kategorie"}“ mit ${current.items.length} Leistungen entfernen?`)){update((draft) => draft.splice(draft.findIndex((category) => category.id===current.id),1));choose(categories.find((category) => category.id!==current.id)?.id||"");}}}>Kategorie entfernen</button>
            </div></details>
            <div className="flex flex-wrap items-center justify-between gap-3"><h2>Leistungen <span className="admin-muted">({current.items.length})</span></h2><button type="button" className={button} onClick={() => {const id=makeId();update((draft) => draft.find((category) => category.id===current.id)!.items.push({id,name:"",price:""}));setSearch("");setExpanded(id);}}>+ Leistung</button></div>
            {!current.items.length&&<EmptyState title="Platz für dein Angebot" icon="services">Füge die erste Leistung in dieser Kategorie hinzu.</EmptyState>}
            <label className="admin-field"><span className="admin-field-label">Leistungen in dieser Kategorie suchen</span><input type="search" className={input} value={search} placeholder="Name oder Preis suchen" onChange={event=>setSearch(event.target.value)}/></label>
            {search&&!current.items.some(item=>`${item.name} ${item.price}`.toLocaleLowerCase("de").includes(search.trim().toLocaleLowerCase("de")))&&<EmptyState title="Keine passende Leistung">Passe die Suche an.</EmptyState>}
            <Reorderable compact items={current.items.filter(item=>`${item.name} ${item.price}`.toLocaleLowerCase("de").includes(search.trim().toLocaleLowerCase("de")))} idOf={(item) => item.id} move={(from,to)=>{const visible=current.items.filter(item=>`${item.name} ${item.price}`.toLocaleLowerCase("de").includes(search.trim().toLocaleLowerCase("de")));moveService(current.items.findIndex(item=>item.id===visible[from].id),current.items.findIndex(item=>item.id===visible[to].id));}}>{(item) => <details className="admin-disclosure" open={expanded===item.id}>
              <summary onClick={(event) => {event.preventDefault();setExpanded((previous) => previous===item.id?null:item.id);}}><span className="min-w-0 flex-1">{item.name||"Neue Leistung"}</span><Badge>{item.price||"Preis festlegen"}</Badge></summary>
              <div className="admin-disclosure-body space-y-4"><div className="admin-grid-2"><Input label="Leistung" placeholder="Name der Behandlung" value={item.name} onChange={(value) => update((draft) => {draft.find((category) => category.id===current.id)!.items.find((entry) => entry.id===item.id)!.name=value;})} /><Input label="Preis" placeholder="z. B. 45 € oder auf Anfrage" value={item.price} onChange={(value) => update((draft) => {draft.find((category) => category.id===current.id)!.items.find((entry) => entry.id===item.id)!.price=value;})} /></div>
                <button type="button" className={button+" admin-button-danger"} onClick={() => {if(confirm("Diese Leistung entfernen?"))update((draft) => {const category=draft.find((category) => category.id===current.id)!;category.items=category.items.filter((entry) => entry.id!==item.id);});}}>Leistung entfernen</button>
              </div>
            </details>}</Reorderable>
          </div>:<EmptyState title="Dein Angebot beginnt hier" icon="services">Lege eine Kategorie für deine Leistungen an.</EmptyState>}
        </div>
        {categories.length>1&&<details className="admin-disclosure"><summary><Icon name="grip" />Reihenfolge der Kategorien</summary><div className="admin-disclosure-body"><Reorderable items={categories} idOf={(category) => category.id} move={moveCategory}>{(category) => <p className="text-sm">{category.title||"Neue Kategorie"}</p>}</Reorderable></div></details>}
      </fieldset>
    </>}
  </section>;
}
