"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Content } from "@/lib/content";
import { isActivePeriod } from "@/lib/pricing";
export default function AnnouncementBanner({announcements=[]}:{announcements:Content["announcements"]}){
  const [now,setNow]=useState(()=>Date.now());
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30_000);return()=>clearInterval(timer);},[]);
  const visible=(announcements||[]).filter(a=>a.message.trim()&&isActivePeriod(a,now));
  if(!visible.length)return null;
  return <aside aria-label="Aktuelle Meldungen" className="border-b border-[#dbc39c] bg-gradient-to-r from-[#f5e7cc] via-[#fff8eb] to-[#ead8ba] px-4 py-4 text-[#332b26] sm:py-5">
    <div className="mx-auto max-w-5xl space-y-3">
      {visible.map(a=><div key={a.id} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:gap-5 sm:text-left">
        <div aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#a98348] text-xl text-white">{a.type==="holiday"?"✦":a.type==="hours"?"◷":a.type==="promotion"?"%":"!"}</div>
        <div className="min-w-0"><p className="font-serif text-xl font-semibold sm:text-2xl">{a.title||"Aktuelle Information"}</p><p className="mt-1 whitespace-pre-line text-sm leading-6 sm:text-base">{a.message}</p></div>
        {a.linkUrl&&a.linkLabel&&<Link href={a.linkUrl} className="shrink-0 rounded-full border border-[#a98348] px-4 py-2 text-sm font-semibold hover:bg-white">{a.linkLabel} →</Link>}
      </div>)}
    </div>
  </aside>;
}
