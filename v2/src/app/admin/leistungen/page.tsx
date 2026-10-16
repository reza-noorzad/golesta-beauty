"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { initialServices, readServices, saveServices, type ServiceCategory } from "@/lib/services-store";

function newId(): string { return `item-${crypto.randomUUID()}`; }
const field = "w-full rounded-lg border border-[#e8ddd0] bg-white px-3 py-2 text-sm outline-[#a98348]";
const action = "rounded-lg border border-[#d8c4a8] px-3 py-2 text-sm hover:bg-[#f6efe5] disabled:opacity-40";

export default function ServicesAdmin() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [message, setMessage] = useState("");
  const current = categories.find(c => c.id === selected);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!db || !auth?.currentUser) { setMessage("Bitte erneut anmelden."); setLoading(false); return; }
      try {
        const result = await readServices(db);
        if (cancelled) return;
        setCategories(result.categories);
        setSelected(result.categories[0]?.id || null);
        setIsLive(result.isLive);
      } catch (e) { if (!cancelled) setMessage(e instanceof Error ? e.message : "Laden fehlgeschlagen."); }
      finally { if (!cancelled) setLoading(false); }
    };
    void run();
    return () => { cancelled = true; };
  }, []);

  function update(mutator: (draft: ServiceCategory[]) => void) {
    setCategories(previous => {
      const draft = structuredClone(previous);
      mutator(draft);
      return draft.map((category, index) => ({ ...category, sortOrder: index }));
    });
    setDirty(true); setMessage("");
  }
  function changeCategory(id: string, key: "title" | "desc", value: string) {
    update(draft => { const c = draft.find(c => c.id === id); if (c) c[key] = value; });
  }
  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= categories.length) return;
    update(draft => { const [item] = draft.splice(index, 1); draft.splice(target, 0, item); });
  }
  function addCategory() {
    const id = newId();
    update(draft => { draft.push({ id, title: "Neue Kategorie", desc: "", sortOrder: draft.length, items: [] }); });
    setSelected(id);
  }
  function removeCategory(id: string) {
    const c = categories.find(item => item.id === id);
    if (!c || !window.confirm(`Kategorie „${c.title}“ und ${c.items.length} Leistungen löschen? Erst nach Speichern wird die Website geändert.`)) return;
    update(draft => { draft.splice(draft.findIndex(item => item.id === id), 1); });
    if (selected === id) setSelected(categories.find(item => item.id !== id)?.id || null);
  }
  function addItem(id: string) {
    update(draft => { draft.find(c => c.id === id)?.items.push({ id: newId(), name: "Neue Leistung", price: "Preis auf Anfrage" }); });
  }
  function editItem(categoryId: string, itemId: string, key: "name" | "price", value: string) {
    update(draft => { const item = draft.find(c => c.id === categoryId)?.items.find(s => s.id === itemId); if (item) item[key] = value; });
  }
  function removeItem(categoryId: string, itemId: string) {
    if (!window.confirm("Diese Leistung entfernen?")) return;
    update(draft => { const c = draft.find(x => x.id === categoryId); if (c) c.items = c.items.filter(x => x.id !== itemId); });
  }
  function moveItem(categoryId: string, index: number, delta: number) {
    update(draft => { const items = draft.find(c => c.id === categoryId)?.items; if (!items || index + delta < 0 || index + delta >= items.length) return; const [item] = items.splice(index, 1); items.splice(index + delta, 0, item); });
  }
  async function save() {
    if (!db || !auth?.currentUser) { setMessage("Bitte erneut anmelden."); return; }
    if (!window.confirm("Alle Änderungen in Firestore speichern und auf der lokalen Website anzeigen?")) return;
    setSaving(true); setMessage("");
    try { await saveServices(db, categories); setDirty(false); setIsLive(true); setMessage("Gespeichert! Änderungen sind in Firestore."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Speichern fehlgeschlagen."); }
    finally { setSaving(false); }
  }
  if (loading) return <p className="p-6">Leistungen werden geladen …</p>;
  return <section className="space-y-6">
    <div><p className="text-xs uppercase tracking-[0.25em] text-[#a98348]">Admin</p><h1 className="mt-3 font-serif text-4xl">Leistungen & Preise</h1>
      <p className="mt-3 text-sm leading-6 text-[#74685d]">{isLive ? "Firestore-Daten geladen" : "Originaldaten aus site-data.json geladen – noch nicht in Firestore gespeichert"}. Änderungen werden erst mit „Speichern“ übernommen.</p>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className="rounded-xl bg-[#a98348] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={saving || !dirty} onClick={() => void save()}>{saving ? "Speichert …" : "Änderungen speichern"}</button>
      <button type="button" className={action} onClick={addCategory}>+ Kategorie</button>
      <span className="text-sm text-[#74685d]">{categories.length} Kategorien · {categories.reduce((n,c) => n+c.items.length,0)} Leistungen {dirty ? "· Ungespeichert" : ""}</span>
    </div>
    {message && <p role="status" className="rounded-lg border border-[#d8c4a8] bg-white p-3 text-sm">{message}</p>}
    <div className="grid items-start gap-5 lg:grid-cols-[280px_1fr]">
      <div className="space-y-2 rounded-2xl border border-[#e8ddd0] bg-white p-3">
        {categories.map((c,i) => <div key={c.id} className={`flex items-center gap-1 rounded-xl p-2 ${selected===c.id?"bg-[#eee5d9]":""}`}>
          <button type="button" onClick={()=>setSelected(c.id)} className="min-w-0 flex-1 truncate text-left text-sm">{c.title} <span className="text-[#74685d]">({c.items.length})</span></button>
          <button type="button" title="Nach oben" aria-label={`${c.title} nach oben`} disabled={i===0} onClick={()=>move(i,-1)} className="px-1 disabled:opacity-20">↑</button>
          <button type="button" title="Nach unten" aria-label={`${c.title} nach unten`} disabled={i===categories.length-1} onClick={()=>move(i,1)} className="px-1 disabled:opacity-20">↓</button>
        </div>)}
      </div>
      {current ? <div className="space-y-5 rounded-2xl border border-[#e8ddd0] bg-white p-4 sm:p-6" key={current.id}>
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-serif text-2xl">Kategorie bearbeiten</h2><button type="button" onClick={()=>removeCategory(current.id)} className="text-sm text-red-700 underline">Kategorie löschen</button></div>
        <label className="block text-sm">Name<input className={`${field} mt-2`} value={current.title} onChange={e=>changeCategory(current.id,"title",e.target.value)}/></label>
        <label className="block text-sm">Beschreibung<textarea rows={2} className={`${field} mt-2`} value={current.desc} onChange={e=>changeCategory(current.id,"desc",e.target.value)}/></label>
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-serif text-xl">Leistungen ({current.items.length})</h3><button type="button" onClick={()=>addItem(current.id)} className={action}>+ Leistung</button></div>
        <div className="space-y-3">{current.items.map((item,index)=><div key={item.id} className="grid gap-2 rounded-xl border border-[#e8ddd0] p-3 sm:grid-cols-[1fr_155px_auto]">
          <label className="text-xs text-[#74685d]">Leistung<input className={`${field} mt-1`} value={item.name} onChange={e=>editItem(current.id,item.id,"name",e.target.value)}/></label>
          <label className="text-xs text-[#74685d]">Preis (Text)<input className={`${field} mt-1`} value={item.price} onChange={e=>editItem(current.id,item.id,"price",e.target.value)}/></label>
          <div className="flex items-end gap-1"><button type="button" aria-label="Leistung nach oben" className={action} disabled={index===0} onClick={()=>moveItem(current.id,index,-1)}>↑</button><button type="button" aria-label="Leistung nach unten" className={action} disabled={index===current.items.length-1} onClick={()=>moveItem(current.id,index,1)}>↓</button><button type="button" aria-label="Leistung löschen" className={`${action} text-red-700`} onClick={()=>removeItem(current.id,item.id)}>×</button></div>
        </div>)}</div>
      </div> : <div className="rounded-xl border border-[#e8ddd0] bg-white p-8 text-sm">Kategorie auswählen oder hinzufügen.</div>}
    </div>
    <p className="text-xs leading-6 text-[#74685d]">Hinweis: Vor der ersten Speicherung werden die bestehenden 8 Kategorien und 117 Leistungen aus der lokalen Datei übernommen. Kein automatisches Überschreiben der Datenbank.</p>
  </section>;
}
