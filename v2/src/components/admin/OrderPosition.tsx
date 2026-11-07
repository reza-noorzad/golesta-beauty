"use client";
import { useState } from "react";
export default function OrderPosition({position,total,onMove,label}:{position:number;total:number;onMove:(index:number)=>void;label:string}) {
  const [value,setValue]=useState(String(position+1));const number=Number(value);
  return <form className="flex flex-wrap items-end gap-3" onSubmit={event=>{event.preventDefault();if(Number.isInteger(number)&&number>=1&&number<=total)onMove(number-1);}}>
    <label className="admin-field min-w-0 flex-1"><span className="admin-field-label">{label}</span><input type="number" min={1} max={total} step={1} value={value} onChange={event=>setValue(event.target.value)} className="admin-input" required/></label><button type="submit" className="admin-button" disabled={!Number.isInteger(number)||number<1||number>total||number===position+1}>Verschieben</button><p className="w-full text-xs admin-muted">Position 1 bis {total}. Es wird kein Eintrag entfernt.</p>
  </form>;
}
