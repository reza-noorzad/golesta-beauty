"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { initialServices, watchServices, type ServiceCategory } from "@/lib/services-store";

function makeRows(items: ServiceCategory[], columns: number) {
  const rows: ServiceCategory[][] = [];
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));
  return rows;
}
function CategoryLayout({ categories, columns, visibility, activeId, onToggle, onClose }: {
  categories: ServiceCategory[]; columns: number; visibility: string; activeId: string | null;
  onToggle: (id: string) => void; onClose: () => void;
}) {
  return <div className={visibility}><div className="space-y-5">{makeRows(categories, columns).map((row, rowIndex) => {
    const activeCategory = row.find(category => category.id === activeId);
    return <div key={`${columns}-${rowIndex}`}>
      <div className={`grid gap-5 ${columns === 3 ? "grid-cols-3" : columns === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {row.map(category => {
          const isActive = activeId === category.id;
          return <button key={category.id} type="button" aria-expanded={isActive} onClick={() => onToggle(category.id)} className={`flex min-h-52 flex-col items-start rounded-2xl border p-6 text-left transition hover:shadow-md ${isActive ? "border-[#a98348] bg-[#f6efe5]" : "border-[#e8ddd0] bg-[#faf7f2]"}`}>
            <h3 className="font-serif text-2xl">{category.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-6 text-[#74685d]">{category.desc}</p>
            <div className="mt-5 flex w-full items-center justify-between text-sm text-[#9c783f]"><span>{category.items.length} Leistungen</span><span className="text-xl">{isActive ? "−" : "+"}</span></div>
          </button>;
        })}
      </div>
      {activeCategory && <div className="mt-5 rounded-2xl border border-[#e8ddd0] bg-[#faf7f2] p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-serif text-2xl">{activeCategory.title}</h3><button type="button" onClick={onClose} className="text-sm text-[#8b6a3c] underline">Schließen</button></div>
        <div className="mt-6 divide-y divide-[#e8ddd0]">{activeCategory.items.map(item => <div key={item.id} className="flex items-start justify-between gap-4 py-3 text-sm sm:text-base"><span>{item.name}</span><span className="shrink-0 text-right font-medium text-[#8b6a3c]">{item.price}</span></div>)}</div>
      </div>}
    </div>;
  })}</div></div>;
}
export default function ServicesGrid() {
  const [categories, setCategories] = useState<ServiceCategory[]>(initialServices);
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (!db) return;
    return watchServices(db, next => setCategories(next), error => console.error("Services Firestore:", error));
  }, []);
  const toggle = (id: string) => setActiveId(previous => previous === id ? null : id);
  return <section id="leistungen" className="scroll-mt-24 bg-white px-5 py-20 sm:px-6 lg:py-24"><div className="mx-auto max-w-7xl">
    <div className="mx-auto mb-12 max-w-2xl text-center"><p className="text-xs uppercase tracking-[0.3em] text-[#a98348]">Unser Angebot</p><h2 className="mt-4 font-serif text-4xl md:text-5xl">Leistungen & Preise</h2><p className="mt-5 leading-7 text-[#74685d]">Entdecke unsere Behandlungen und Preise.</p></div>
    <CategoryLayout categories={categories} columns={1} visibility="block sm:hidden" activeId={activeId} onToggle={toggle} onClose={()=>setActiveId(null)}/>
    <CategoryLayout categories={categories} columns={2} visibility="hidden sm:block lg:hidden" activeId={activeId} onToggle={toggle} onClose={()=>setActiveId(null)}/>
    <CategoryLayout categories={categories} columns={3} visibility="hidden lg:block" activeId={activeId} onToggle={toggle} onClose={()=>setActiveId(null)}/>
  </div></section>;
}
