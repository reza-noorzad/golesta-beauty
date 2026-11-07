"use client";
import { useEffect } from "react";

export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (dirty) {event.preventDefault();event.returnValue="";} };
    const leave = (event: MouseEvent) => {
      if (!dirty || !(event.target instanceof Element)) return;
      const target = event.target.closest("a,[data-admin-leave]");
      if (!target || target.getAttribute("target") === "_blank" || target.getAttribute("href")?.startsWith("#")) return;
      if (!confirm("Du hast ungespeicherte Änderungen. Möchtest du diese Seite wirklich verlassen?")) {event.preventDefault();event.stopPropagation();}
    };
    window.addEventListener("beforeunload",unload);
    document.addEventListener("click",leave,true);
    return () => {window.removeEventListener("beforeunload",unload);document.removeEventListener("click",leave,true);};
  },[dirty]);
}
