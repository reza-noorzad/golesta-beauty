"use client";
import Image from "next/image";
import type { EditorProps } from "./editor-types";
import { Input, Toggle, button, input, makeId } from "./editor-types";
import Reorderable from "./Reorderable";
import ImageUpload from "./ImageUpload";
import { Badge, EmptyState, Icon } from "./ui";
export default function TeamEditor({data,edit}:EditorProps) {
  function move(from:number,to:number) {if(to<0||to>=data.team.length||from===to)return;edit((draft) => {const [member]=draft.team.splice(from,1);draft.team.splice(to,0,member);draft.team.forEach((member,index) => member.sortOrder=index);});}
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2>Dein Team <span className="admin-muted">({data.team.length})</span></h2><button type="button" className={button} onClick={() => edit((draft) => draft.team.push({id:makeId(),name:"",role:"",image:"",bio:"",experience:"",specialties:[],published:false,sortOrder:draft.team.length}))}>+ Teammitglied</button></div>
    {!data.team.length&&<EmptyState title="Die Menschen hinter deinem Salon" icon="team">Ergänze ein Teammitglied und stelle es persönlich vor.</EmptyState>}
    <Reorderable compact items={data.team} idOf={(member) => member.id} move={move}>{(member,index) => <details className="admin-disclosure">
      <summary><span className="admin-summary-content"><span className="admin-thumb">{member.image?<Image src={member.image} alt="" fill sizes="42px" className="object-cover" />:<span className="flex h-full items-center justify-center"><Icon name="team" /></span>}</span><span className="min-w-0"><span className="admin-summary-name">{member.name||"Neues Teammitglied"}</span><span className="admin-summary-meta">{member.role||"Persönliches Profil"}</span></span></span><Badge tone={member.published?"success":"neutral"}>{member.published?"Sichtbar":"Entwurf"}</Badge></summary>
      <div className="admin-disclosure-body grid gap-6 xl:grid-cols-[160px_minmax(0,1fr)]">
        <div className="space-y-3"><div className="relative aspect-[4/5] w-full max-w-40 overflow-hidden rounded-xl bg-[#eee5d9]">{member.image&&<Image src={member.image} alt={member.name||"Teamfoto"} fill sizes="160px" className="object-cover" />}</div><ImageUpload label="Foto ändern" onUploaded={(urls) => edit((draft) => {const found=draft.team.find((entry) => entry.id===member.id);if(found)found.image=urls[0];})} /></div>
        <div className="space-y-5"><div className="admin-grid-2"><Input label="Name" placeholder="Vor- und Nachname" value={member.name} onChange={(value) => edit((draft) => {draft.team[index].name=value;})} /><Input label="Position" placeholder="Aufgabe im Salon" value={member.role} onChange={(value) => edit((draft) => {draft.team[index].role=value;})} /></div>
          <Input label="Berufserfahrung (optional)" placeholder="Erfahrung und Qualifikationen" value={member.experience??""} onChange={(value) => edit((draft) => {draft.team[index].experience=value;})} />
          <Input label="Persönliche Vorstellung" multiline placeholder="Ein paar Worte zur Person und ihrer Leidenschaft" value={member.bio??""} onChange={(value) => edit((draft) => {draft.team[index].bio=value;})} />
          <section className="admin-fieldset space-y-3"><div className="admin-card-title"><h3>Spezialisierungen</h3><button type="button" className={button} onClick={() => edit((draft) => {(draft.team[index].specialties||=[]).push("");})}>+ Spezialgebiet</button></div>
            {(member.specialties||[]).map((specialty,specialtyIndex) => <div key={specialtyIndex} className="flex gap-2"><input aria-label={`Spezialisierung ${specialtyIndex+1}`} className={input+" flex-1"} value={specialty} placeholder="z. B. Hochsteckfrisuren" onChange={(event) => edit((draft) => {draft.team[index].specialties![specialtyIndex]=event.target.value;})} /><button type="button" className={button+" admin-button-danger admin-button-icon"} aria-label={`Spezialisierung ${specialtyIndex+1} entfernen`} onClick={() => edit((draft) => draft.team[index].specialties!.splice(specialtyIndex,1))}><Icon name="close" /></button></div>)}
          </section>
          <div className="flex flex-wrap items-center justify-between gap-3"><Toggle label="Auf der Website anzeigen" checked={member.published} onChange={(value) => edit((draft) => {draft.team[index].published=value;})} /><button type="button" className={button+" admin-button-danger"} onClick={() => {if(confirm("Dieses Teammitglied entfernen?"))edit((draft) => draft.team.splice(index,1));}}>Teammitglied entfernen</button></div>
        </div>
      </div>
    </details>}</Reorderable>
  </div>;
}
