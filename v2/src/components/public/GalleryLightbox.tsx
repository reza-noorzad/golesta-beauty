"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
export default function GalleryLightbox({image,position,total,onClose,onPrevious,onNext}:{image:{image:string;alt:string};position:number;total:number;onClose:() => void;onPrevious:() => void;onNext:() => void}) {
  const dialog=useRef<HTMLDialogElement>(null);const close=useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const node=dialog.current;const previous=document.body.style.overflow;const previousFocus=document.activeElement;
    node?.showModal();close.current?.focus();document.body.style.overflow="hidden";
    return () => {node?.close();document.body.style.overflow=previous;if(previousFocus instanceof HTMLElement&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});};
  },[]);
  return <dialog ref={dialog} className="public-gallery-dialog" aria-label="Galeriebild anzeigen" onCancel={(event) => {event.preventDefault();onClose();}} onClick={(event) => {if(event.target===event.currentTarget)onClose();}} onKeyDown={(event) => {if(event.key==="ArrowRight"){event.preventDefault();onNext();}if(event.key==="ArrowLeft"){event.preventDefault();onPrevious();}}}>
    <button ref={close} type="button" className="public-gallery-control public-gallery-close" aria-label="Galerie schließen" onClick={onClose}>×</button>
    <button type="button" className="public-gallery-control public-gallery-previous" aria-label="Vorheriges Bild" onClick={onPrevious}>‹</button>
    <figure><Image src={image.image} alt={image.alt} fill sizes="90vw" priority className="object-contain"/><figcaption>{position+1} / {total}</figcaption></figure>
    <button type="button" className="public-gallery-control public-gallery-next" aria-label="Nächstes Bild" onClick={onNext}>›</button>
  </dialog>;
}
