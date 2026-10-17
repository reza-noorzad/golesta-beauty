"use client";
import { useRef, useState, type ReactNode } from "react";
import { button } from "./editor-types";
export default function Reorderable<T>({ items, idOf, move, children, className = "space-y-3", itemClassName = "", showArrows = true }: {
  items: T[]; idOf: (item: T) => string; move: (from: number, to: number) => void;
  children: (item: T, index: number) => ReactNode; className?: string; itemClassName?: string; showArrows?: boolean;
}) {
  const dragged = useRef<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  return <div className={className}>
    {items.map((item, index) => <div key={idOf(item)} data-sort-index={index}
      className={`${itemClassName} ${target === index ? "outline-2 outline-[#a98348]" : ""}`}
      onDragOver={e => { e.preventDefault(); setTarget(index); }}
      onDrop={e => { e.preventDefault(); if (dragged.current !== null) move(dragged.current, index); dragged.current = null; setTarget(null); }}>
      <div className="flex items-start gap-2">
        <div className="flex shrink-0 flex-col gap-1">
          <button type="button" draggable aria-label="Zum Sortieren ziehen" title="Ziehen oder Pfeile benutzen"
            className={`${button} touch-none cursor-grab px-2`}
            onDragStart={e => { dragged.current = index; e.dataTransfer.effectAllowed = "move"; }}
            onDragEnd={() => { dragged.current = null; setTarget(null); }}
            onPointerDown={e => { if (e.pointerType !== "mouse") { dragged.current = index; e.currentTarget.setPointerCapture(e.pointerId); } }}
            onPointerUp={e => { if (e.pointerType !== "mouse") { const node = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-sort-index]"); const to = Number(node?.getAttribute("data-sort-index")); if (node && dragged.current !== null && Number.isInteger(to)) move(dragged.current, to); dragged.current = null; setTarget(null); } }}>
            <span aria-hidden>⠿</span>
          </button>
          {showArrows && <button type="button" className={`${button} px-2`} aria-label="Nach oben" disabled={index === 0} onClick={() => move(index, index - 1)}>↑</button>}
          {showArrows && <button type="button" className={`${button} px-2`} aria-label="Nach unten" disabled={index === items.length - 1} onClick={() => move(index, index + 1)}>↓</button>}
        </div>
        <div className="min-w-0 flex-1">{children(item, index)}</div>
      </div>
    </div>)}
  </div>;
}
