"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function useAdminClock() {
  const [now,setNow]=useState(() => Date.now());
  useEffect(() => {
    const update=() => setNow(Date.now());
    const timer=setInterval(update,60_000);
    document.addEventListener("visibilitychange",update);
    return () => {clearInterval(timer);document.removeEventListener("visibilitychange",update);};
  },[]);
  return now;
}

const paths = {
  overview: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  services: "m4 4 16 16M4 20 20 4M8 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm0 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  products: "m4 7 8-4 8 4v13H4V7Zm0 0 8 4 8-4M12 11v9",
  gallery: "M3 3h18v18H3zM3 16l5-5 5 5 3-3 5 5M15 7h.01",
  team: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  reviews: "M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 1 1 17-5ZM8 9h8M8 13h5",
  voucher: "M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z",
  promotions: "m3 3 8 0 10 10-8 8L3 11V3ZM7 7h.01",
  settings: "M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6",
  users: "M3 21v-2a6 6 0 0 1 12 0v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M17 11h6",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  external: "M14 3h7v7M10 14 21 3M21 14v7H3V3h7",
  logout: "M9 3H3v18h6M9 12h12m-5-5 5 5-5 5",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6",
  check: "m5 12 4 4L19 6",
  info: "M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  up: "m6 14 6-6 6 6",
  down: "m6 10 6 6 6-6",
  grip: "M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01",
};
export type IconName = keyof typeof paths;
export function Icon({ name }: { name: IconName }) {
  return <svg className="admin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return <header className="admin-page-header"><div><p className="admin-eyebrow">Dein Salon. Dein Überblick.</p><h1>{title}</h1>{description && <p>{description}</p>}</div>{children}</header>;
}
export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "success" | "error" }) {
  return <div className="admin-notice" data-tone={tone} role={tone === "error" ? "alert" : "status"}><Icon name={tone === "success" ? "check" : "info"} /><div className="min-w-0">{children}</div></div>;
}
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" }) {
  return <span className="admin-badge" data-tone={tone}>{children}</span>;
}
export function EmptyState({ title, children, icon = "info" }: { title: string; children?: ReactNode; icon?: IconName }) {
  return <div className="admin-empty"><Icon name={icon} /><strong>{title}</strong>{children && <div className="max-w-md text-sm">{children}</div>}</div>;
}
export function LoadingState({ children = "Inhalte werden geladen …" }: { children?: ReactNode }) {
  return <div className="admin-loading" role="status"><span className="admin-spinner" aria-hidden="true" />{children}</div>;
}
export function Pagination({page,total,size,onChange,label}:{page:number;total:number;size:number;onChange:(page:number)=>void;label:string}) {
  const pages=Math.ceil(total/size);if(pages<=1)return null;
  return <nav aria-label={label} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e3ddd3] p-3"><span className="text-sm admin-muted">Seite {page+1} von {pages} · {total} Einträge</span><div className="flex gap-2"><button type="button" className="admin-button" disabled={page===0} onClick={()=>onChange(page-1)}>Vorherige</button><button type="button" className="admin-button" disabled={page>=pages-1} onClick={()=>onChange(page+1)}>Nächste</button></div></nav>;
}
export function SaveBar({ dirty, busy, blocked=false, onSave }: { dirty: boolean; busy: boolean; blocked?:boolean; onSave: () => void }) {
  return <div className="admin-savebar"><span className="admin-savebar-state" role="status"><span className="admin-save-dot" data-dirty={dirty} />{busy ? "Wird gespeichert …" : blocked ? "Bilder werden übernommen …" : dirty ? "Ungespeicherte Änderungen" : "Alles auf dem neuesten Stand"}</span><button type="button" className="admin-button admin-button-primary" disabled={!dirty || busy || blocked} onClick={onSave}>{busy ? <><span className="admin-spinner" aria-hidden="true" />Speichert …</> : <><Icon name="check" />Änderungen speichern</>}</button></div>;
}
export function Tabs({ items, value, onChange, label, panelId }: { items: { value: string; label: string }[]; value: string; onChange: (value: string) => void; label: string; panelId?: string }) {
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return <div className="admin-tabs" role="tablist" aria-label={label}>{items.map((item,index) => <button key={item.value} ref={(node) => { buttons.current[index] = node; }} type="button" role="tab" className="admin-tab" id={`${id}-${item.value}`} aria-controls={panelId} aria-selected={value === item.value} tabIndex={value === item.value ? 0 : -1} onClick={() => onChange(item.value)} onKeyDown={(event) => {
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length-1 : direction ? (index+direction+items.length)%items.length : -1;
    if (next < 0) return; event.preventDefault(); onChange(items[next].value); buttons.current[next]?.focus();
  }}>{item.label}</button>)}</div>;
}
