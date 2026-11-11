"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { contactLinks } from "@/lib/public-content";
import { usePublicSite } from "./PublicSite";

export function ContactIcon({type}:{type:"phone"|"whatsapp"|"menu"|"close"}) {
  const path=type==="phone"?"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L9 11a16 16 0 0 0 4 4l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z":type==="whatsapp"?"M21 11.5a9 9 0 0 1-9 9 9 9 0 0 1-4-.9L3 21l1.4-4.9a9 9 0 1 1 16.6-4.6ZM8 7c0 5 4 9 9 9M8 7l2 2-1 1M17 16l-2-2-1 1":type==="menu"?"M4 6h16M4 12h16M4 18h16":"m6 6 12 12M6 18 18 6";
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path}/></svg>;
}
export default function PublicHeader() {
  const {data}=usePublicSite();const settings=data.settings;const links=contactLinks(settings);
  const pathname=usePathname();
  const [openFor,setOpenFor]=useState<string|null>(null);
  const open=openFor===pathname;
  const [compact,setCompact]=useState(false);
  const header=useRef<HTMLElement>(null);const toggle=useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update=() => setCompact((previous) => window.scrollY>64?true:window.scrollY<8?false:previous);
    const frame=requestAnimationFrame(update);window.addEventListener("scroll",update,{passive:true});
    return () => {cancelAnimationFrame(frame);window.removeEventListener("scroll",update);};
  },[]);
  useEffect(() => {
    const root=document.documentElement;
    const update=() => {
      const row=header.current?.querySelector(".public-header-row");
      const inset=header.current?parseFloat(getComputedStyle(header.current).paddingTop)||0:0;
      root.style.setProperty("--public-sticky-offset",`${Math.ceil(row?.getBoundingClientRect().height||80)+inset+16}px`);
    };
    const observer=new ResizeObserver(update);if(header.current)observer.observe(header.current);update();
    return () => {observer.disconnect();root.style.removeProperty("--public-sticky-offset");};
  },[]);
  useEffect(() => {
    if(!open)return;
    const close=(event:KeyboardEvent) => {if(event.key==="Escape"){setOpenFor(null);toggle.current?.focus();}};
    window.addEventListener("keydown",close);
    return () => window.removeEventListener("keydown",close);
  },[open]);
  const navigation=[{label:"Startseite",href:"/"},{label:"Leistungen",href:"/leistungen"},{label:"Produkte",href:"/produkte"},{label:"Team",href:"/#team"},{label:"Galerie",href:"/#galerie"},...(data.voucher.published?[{label:"Gutschein",href:"/#gutschein"}]:[]),{label:"Kontakt",href:"/#kontakt"}];
  return <header ref={header} className="public-header" data-compact={compact}>
    <div className="public-header-row">
      <Link href="/" className="public-brand" onClick={() => setOpenFor(null)}><Image src={settings.logo||"/Logo.PNG"} alt="" width={48} height={48} className="public-logo" /><span>{settings.salonName||"GOLESTA BEAUTY"}</span><span className="sr-only"> – Startseite</span></Link>
      <nav className="public-desktop-nav" aria-label="Hauptnavigation">{navigation.map((item) => <Link key={item.label} href={item.href} aria-current={item.href===pathname?"page":undefined}>{item.label}</Link>)}</nav>
      <div className="public-header-actions">
        <a href={links.phone} className="public-phone" aria-label={`Salon anrufen: ${settings.phone}`}><ContactIcon type="phone"/><span>{settings.phone}</span></a>
        <a href={links.whatsapp} className="public-whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp kontaktieren"><ContactIcon type="whatsapp"/><span>WhatsApp</span></a>
        <button ref={toggle} type="button" className="public-menu-toggle" aria-label={open?"Menü schließen":"Menü öffnen"} aria-expanded={open} aria-controls="public-mobile-navigation" onClick={() => setOpenFor(open?null:pathname)}><ContactIcon type={open?"close":"menu"}/></button>
      </div>
    </div>
    <nav id="public-mobile-navigation" aria-label="Mobile Navigation" className="public-mobile-nav" hidden={!open}>{navigation.map((item) => <Link key={item.label} href={item.href} onClick={() => setOpenFor(null)} aria-current={item.href===pathname?"page":undefined}>{item.label}</Link>)}</nav>
  </header>;
}
