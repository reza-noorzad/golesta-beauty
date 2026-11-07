"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useContent } from "@/lib/content-client";
import { publicSiteContent } from "@/lib/public-content";
import { initialServices, normalizeCategories } from "@/lib/services";
import { requestJson } from "@/lib/request";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

function useSiteData() {
  const content=useContent();
  const data=useMemo(() => publicSiteContent(content.data),[content.data]);
  const [services,setServices]=useState(initialServices);
  const [servicesError,setServicesError]=useState(false);
  useEffect(() => {
    let alive=true;let controller:AbortController|null=null;
    async function load() {
      controller?.abort();const current=new AbortController();controller=current;
      try {
        const result=await requestJson("/api/services",{signal:current.signal});
        const categories=normalizeCategories((result as {categories?:unknown}).categories);
        if(alive&&!current.signal.aborted){setServices(categories);setServicesError(false);}
      } catch {if(alive&&!current.signal.aborted)setServicesError(true);}
    }
    void load();const timer=setInterval(() => void load(),60_000);const focus=() => void load();
    window.addEventListener("focus",focus);
    return () => {alive=false;controller?.abort();clearInterval(timer);window.removeEventListener("focus",focus);};
  },[]);
  return {...content,data,services,servicesError};
}
const Context=createContext<ReturnType<typeof useSiteData>|null>(null);
function PublicFrame({children}:{children:ReactNode}) {
  const site=useSiteData();
  return <Context.Provider value={site}><div className="public-site">
    <a className="public-skip" href="#public-inhalt">Zum Inhalt springen</a>
    <AnnouncementBanner announcements={site.data.announcements} />
    <PublicHeader />
    <div id="public-inhalt" tabIndex={-1}>{children}</div>
    <PublicFooter />
  </div></Context.Provider>;
}
export default function PublicSite({children}:{children:ReactNode}) {
  const pathname=usePathname();
  if(pathname==="/admin"||pathname.startsWith("/admin/"))return <>{children}</>;
  return <PublicFrame>{children}</PublicFrame>;
}
export function usePublicSite() {
  const site=useContext(Context);
  if(!site)throw new Error("PublicSite provider fehlt.");
  return site;
}
