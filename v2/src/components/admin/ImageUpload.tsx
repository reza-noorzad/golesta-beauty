"use client";
import { useState, type ChangeEvent } from "react";
import { adminRequest } from "@/lib/content-client";
import { withTimeout } from "@/lib/request";
import { useUploadActivity } from "./UploadActivity";
import { button } from "./editor-types";

/** Server Sharp validation/rotation is authoritative; large originals are reduced first. */
async function prepare(file:File):Promise<Blob> {
  if(!/^image\/(jpeg|png|webp)$/.test(file.type))throw Error("Bitte verwende JPG, PNG oder WebP.");
  if(!file.size)throw Error("Die ausgewählte Datei ist leer.");
  if(file.size>30*1024*1024)throw Error("Das Originalbild ist zu groß. Bitte verwende ein Bild unter 30 MB.");
  if(file.size<=4*1024*1024)return file;
  if(typeof createImageBitmap!=="function")throw Error("Bitte verwende in diesem Browser ein Bild unter 4 MB.");
  const bitmap=await createImageBitmap(file,{imageOrientation:"from-image"});
  try {
    if(bitmap.width*bitmap.height>60_000_000)throw Error("Das Bild hat zu viele Bildpunkte. Bitte verkleinere es vor dem Hochladen.");
    const scale=Math.min(1,1800/bitmap.width,1800/bitmap.height);const canvas=document.createElement("canvas");
    canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
    const context=canvas.getContext("2d");if(!context)throw Error("Das Bild konnte nicht vorbereitet werden.");
    context.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const result=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",.78));
    if(!result||result.size>4*1024*1024)throw Error("Das Bild ist nach der Verkleinerung noch zu groß.");
    return result;
  }finally{bitmap.close();}
}
export default function ImageUpload({onUploaded,multiple=false,label="Bilder auswählen",disabled=false,maxFiles=multiple?12:1}:{
  onUploaded:(urls:string[])=>void;multiple?:boolean;label?:string;disabled?:boolean;maxFiles?:number;
}) {
  const activity=useUploadActivity();const [busy,setBusy]=useState(false);const [progress,setProgress]=useState("");const [error,setError]=useState("");
  async function upload(event:ChangeEvent<HTMLInputElement>) {
    const files=Array.from(event.target.files||[]);event.target.value="";
    if(!files.length||busy)return;
    setError("");setProgress("");
    if(files.length>maxFiles){setError(`Du kannst noch ${Math.max(0,maxFiles)} ${maxFiles===1?"Bild":"Bilder"} auswählen.`);return;}
    if(files.some(file=>!/^image\/(jpeg|png|webp)$/.test(file.type)||!file.size)){setError("Bitte wähle ausschließlich gültige JPG-, PNG- oder WebP-Dateien.");return;}
    setBusy(true);activity?.begin();const uploaded:string[]=[];
    try {
      for(let index=0;index<files.length;index++){
        setProgress(`Bild ${index+1} von ${files.length}`);
        const blob=await withTimeout(prepare(files[index]),20_000,"Das Vorbereiten dauert zu lange. Bitte wähle ein kleineres Bild.");
        const response=await adminRequest<{url:string}>("/api/admin/upload",{method:"POST",headers:{"Content-Type":"application/octet-stream"},body:blob});
        uploaded.push(response.url);
      }
      setProgress(`${uploaded.length} ${uploaded.length===1?"Bild":"Bilder"} übernommen. Bitte Änderungen speichern.`);
    }catch(error){setError(`${error instanceof Error?error.message:"Das Bild konnte nicht hochgeladen werden."}${uploaded.length?` ${uploaded.length===1?"Ein bereits übernommenes Bild bleibt":`${uploaded.length} bereits übernommene Bilder bleiben`} erhalten. Bitte speichere deine Änderungen.`:""}`);}
    finally{try{if(uploaded.length)onUploaded(uploaded);}finally{setBusy(false);activity?.end();}}
  }
  return <div className="space-y-2"><label className={`${button} admin-upload cursor-pointer ${disabled||busy||maxFiles<=0?"pointer-events-none opacity-40":""}`}>
    {busy?`Wird hochgeladen: ${progress}`:label}<input aria-label={label} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} disabled={disabled||busy||maxFiles<=0} onChange={event=>void upload(event)}/>
  </label>{(error||progress)&&<p role={error?"alert":"status"} className={`text-xs ${error?"text-red-700":"admin-muted"}`}>{error||progress}</p>}</div>;
}
