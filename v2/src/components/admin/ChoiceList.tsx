"use client";
import {useState} from "react";
import {Pagination} from "./ui";
export default function ChoiceList({label,description,options,selected,onChange}:{label:string;description:string;options:{id:string;name:string}[];selected:string[];onChange:(id:string,checked:boolean)=>void}){
  const [search,setSearch]=useState("");const [onlySelected,setOnlySelected]=useState(false);const [page,setPage]=useState(0);
  const filtered=options.filter(option=>(!onlySelected||selected.includes(option.id))&&option.name.toLocaleLowerCase("de").includes(search.trim().toLocaleLowerCase("de")));
  const current=Math.min(page,Math.max(0,Math.ceil(filtered.length/12)-1));
  const missing=selected.filter(id=>!options.some(option=>option.id===id));
  return <fieldset className="admin-fieldset space-y-3"><legend>{label}</legend><p className="text-sm admin-muted">{description}</p><p className="text-xs admin-muted">{selected.length} ausgewählt</p>
    <label className="admin-field"><span className="admin-field-label">{label} durchsuchen</span><input type="search" className="admin-input" value={search} placeholder="Name suchen" onChange={event=>{setSearch(event.target.value);setPage(0);}}/></label>
    <label className="admin-toggle"><input type="checkbox" checked={onlySelected} onChange={event=>{setOnlySelected(event.target.checked);setPage(0);}}/><span>Nur Auswahl anzeigen</span></label>
    <div className="grid gap-2 sm:grid-cols-2">{filtered.slice(current*12,(current+1)*12).map(option=><label key={option.id} className="admin-toggle rounded-lg border border-[#e3ddd3] p-3"><input type="checkbox" checked={selected.includes(option.id)} onChange={event=>onChange(option.id,event.target.checked)}/><span>{option.name||"Ohne Namen"}</span></label>)}</div>
    {!filtered.length&&<p className="text-sm admin-muted">Keine passenden Einträge.</p>}
    {!!missing.length&&<div className="space-y-2"><p className="text-xs admin-muted">Frühere Auswahl ohne zugehörigen Eintrag:</p>{missing.map((id,index)=><button type="button" key={id} className="admin-button" aria-label={`Frühere Auswahl ${index+1} entfernen`} onClick={()=>onChange(id,false)}>Nicht mehr vorhandenen Eintrag entfernen</button>)}</div>}
    <Pagination page={current} total={filtered.length} size={12} onChange={setPage} label={`${label} Seiten`}/>
  </fieldset>;
}
