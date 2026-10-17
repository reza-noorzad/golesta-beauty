"use client";
import Image from "next/image";
import type { EditorProps } from "./editor-types";
import { Input, Toggle, button, card, makeId } from "./editor-types";
import Reorderable from "./Reorderable";
import ImageUpload from "./ImageUpload";
export default function TeamEditor({ data, edit }: EditorProps) {
  function move(from:number,to:number) { if(to<0||to>=data.team.length||from===to)return;edit(d=>{const [x]=d.team.splice(from,1);d.team.splice(to,0,x);d.team.forEach((m,i)=>m.sortOrder=i);}); }
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl">Mitarbeiter ({data.team.length})</h2><button type="button" className={button} onClick={()=>edit(d=>d.team.push({id:makeId(),name:"",role:"",image:"",bio:"",experience:"",specialties:[],published:false,sortOrder:d.team.length}))}>+ Teammitglied</button></div>
    <p className="text-sm text-[#74685d]">Name, Position, persönliche Vorstellung, Berufserfahrung und Spezialisierungen werden separat gepflegt.</p>
    <Reorderable items={data.team} idOf={m=>m.id} move={move}>{(m,i)=><details className={card} open={undefined}>
      <summary className="cursor-pointer font-serif text-xl">{m.name} · {m.published?"Sichtbar":"Entwurf"}</summary>
      <div className="mt-5 grid gap-4 lg:grid-cols-[200px_1fr]">
        <div className="space-y-3"><div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#eee5d9]">{m.image && <Image src={m.image} alt={m.name} fill sizes="200px" className="object-cover"/>}</div><ImageUpload label="Foto ändern" onUploaded={urls=>edit(d=>{const member=d.team.find(x=>x.id===m.id);if(member)member.image=urls[0];})}/></div>
        <div className="space-y-4">
          <Input label="Name" value={m.name} onChange={v=>edit(d=>{d.team[i].name=v;})}/>
          <Input label="Position / Funktion" value={m.role} onChange={v=>edit(d=>{d.team[i].role=v;})}/>
          <Input label="Berufserfahrung (optional)" value={m.experience||""} onChange={v=>edit(d=>{d.team[i].experience=v;})}/>
          <Input label="Persönliche Vorstellung (mehrere Absätze möglich)" multiline value={m.bio||""} onChange={v=>edit(d=>{d.team[i].bio=v;})}/>
          <div className="rounded-xl border border-[#e8ddd0] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">Fachgebiete & Spezialisierungen</h3><button type="button" className={button} onClick={()=>edit(d=>{(d.team[i].specialties ||= []).push("");})}>+ Spezialgebiet</button></div>
            {(m.specialties||[]).map((s,j)=><div key={j} className="mt-2 flex gap-2"><input aria-label={`Spezialisierung ${j+1}`} className="min-w-0 flex-1 rounded-xl border px-3 py-2" value={s} placeholder="z. B. Hochsteckfrisuren" onChange={e=>edit(d=>{d.team[i].specialties![j]=e.target.value;})}/><button type="button" className={button} onClick={()=>edit(d=>d.team[i].specialties!.splice(j,1))}>×</button></div>)}
          </div>
          <Toggle label="Auf Webseite anzeigen" checked={m.published} onChange={v=>edit(d=>{d.team[i].published=v;})}/>
          <div><button type="button" className={`${button} text-red-700`} onClick={()=>{if(confirm("Teammitglied entfernen?"))edit(d=>d.team.splice(i,1));}}>Entfernen</button></div>
        </div>
      </div>
    </details>}</Reorderable>
  </div>;
}
