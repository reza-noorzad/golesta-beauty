"use client";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { initialContent, type Content } from "./content";
export async function adminRequest(url:string,options:RequestInit={}){
  const user=auth?.currentUser;if(!user)throw Error("Bitte anmelden.");
  const response=await fetch(url,{...options,headers:{...options.headers,Authorization:`Bearer ${await user.getIdToken()}`},cache:"no-store"});
  const body=await response.json();if(!response.ok)throw Error(body.error||"Anfrage fehlgeschlagen.");return body;
}
export function useContent(){
  const [data,setData]=useState<Content>(initialContent);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  useEffect(()=>{let alive=true;let controller:AbortController|null=null;
    async function load(){controller?.abort();controller=new AbortController();try{const r=await fetch("/api/content",{cache:"no-store",signal:controller.signal});if(!r.ok)throw Error("Inhalte können momentan nicht geladen werden.");const result=await r.json();if(alive){setData(result);setError("");}}
      catch(e){if(alive&&(e as Error).name!=="AbortError")setError((e as Error).message);}finally{if(alive)setLoading(false);}}
    void load();const interval=setInterval(()=>void load(),60_000);const focus=()=>void load();window.addEventListener("focus",focus);
    return()=>{alive=false;controller?.abort();clearInterval(interval);window.removeEventListener("focus",focus);};
  },[]);
  return {data,loading,error};
}
