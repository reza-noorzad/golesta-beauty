"use client";
import { useRef, useState, type ReactNode } from "react";
import { Icon } from "./ui";
export default function Reorderable<T>({ items, idOf, move, children, className = "space-y-3", itemClassName = "", showArrows = true, compact = false }: {
  items: T[]; idOf: (item: T) => string; move: (from: number, to: number) => void;
  children: (item: T, index: number) => ReactNode; className?: string; itemClassName?: string; showArrows?: boolean; compact?: boolean;
}) {
  const dragged = useRef<number | null>(null);
  const [ordering,setOrdering]=useState(false);
  const list = useRef<HTMLDivElement>(null);
  const [target,setTarget] = useState<number | null>(null);
  return <div className="space-y-3">{compact&&items.length>1&&<div className="flex justify-end"><button type="button" className="admin-button admin-button-quiet" aria-pressed={ordering} onClick={() => setOrdering((previous) => !previous)}>{ordering?"Sortierung beenden":"Reihenfolge bearbeiten"}</button></div>}<div ref={list} className={className}>{items.map((item,index) => <div key={idOf(item)} data-sort-index={index} className={`admin-sort-item ${itemClassName} ${target === index ? "outline-2 outline-[#785b35]" : ""}`}
    onDragOver={(event) => {event.preventDefault();setTarget(index);}}
    onDrop={(event) => {event.preventDefault();if(dragged.current!==null)move(dragged.current,index);dragged.current=null;setTarget(null);}}>
    <div className="admin-sort-content">{children(item,index)}</div>
    <div className="admin-sort-tools" role="group" aria-label={`Reihenfolge von Eintrag ${index+1}`}>
      <button type="button" draggable aria-label="Zum Sortieren ziehen" title="Reihenfolge ändern" className="admin-button admin-sort-drag"
        onDragStart={(event) => {dragged.current=index;event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/plain",idOf(item));}}
        onDragEnd={() => {dragged.current=null;setTarget(null);}}
        onPointerDown={(event) => {if(event.pointerType!=="mouse"){dragged.current=index;event.currentTarget.setPointerCapture(event.pointerId);}}}
        onPointerUp={(event) => {if(event.pointerType!=="mouse"){const node=document.elementFromPoint(event.clientX,event.clientY)?.closest("[data-sort-index]");const to=Number(node?.getAttribute("data-sort-index"));if(node&&list.current?.contains(node)&&dragged.current!==null&&Number.isInteger(to))move(dragged.current,to);dragged.current=null;setTarget(null);}}}><Icon name="grip" /></button>
      {showArrows && (!compact||ordering) && <><button type="button" className="admin-button" aria-label="Nach oben" disabled={index===0} onClick={() => move(index,index-1)}><Icon name="up" /></button><button type="button" className="admin-button" aria-label="Nach unten" disabled={index===items.length-1} onClick={() => move(index,index+1)}><Icon name="down" /></button></>}
    </div>
  </div>)}</div></div>;
}
