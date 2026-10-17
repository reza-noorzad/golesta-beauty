"use client";
import { useEffect, useState } from "react";
import type { Content } from "@/lib/content";
import { formatProductPrice } from "@/data/products";
import { productPrice } from "@/lib/pricing";
export default function PriceDisplay({product,promotions,variantId="",className=""}:{product:Content["products"][number],promotions:Content["promotions"],variantId?:string,className?:string}){
  const [now,setNow]=useState(()=>Date.now());
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30_000);return()=>clearInterval(timer);},[]);
  const price=productPrice(product,promotions,variantId,now);
  return <div className={className}>
    {price.discounted&&<div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#e9d6b7] px-3 py-1 text-xs font-semibold text-[#60401f]">{price.label||"Angebot"}</span><del className="text-sm font-normal text-[#887b6c]">{formatProductPrice(price.original)}</del></div>}
    <span className="mt-1 block font-semibold text-[#8b6a3c]">{formatProductPrice(price.current)}</span>
  </div>;
}
