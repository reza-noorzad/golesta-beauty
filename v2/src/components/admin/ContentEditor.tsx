"use client";
import { useEffect, useState } from "react";
import type { AdminContentResponse } from "@/lib/admin-api";
import { contentSchema, type Content } from "@/lib/content";
import { adminRequest } from "@/lib/content-client";
import ProductsEditor from "./ProductsEditor";
import GalleryEditor from "./GalleryEditor";
import TeamEditor from "./TeamEditor";
import SettingsEditor from "./SettingsEditor";
import MarketingEditor from "./MarketingEditor";
import { Input, Toggle, button, card, type Edit } from "./editor-types";
import { PageHeader, Notice, LoadingState, SaveBar, EmptyState } from "./ui";
import { useUnsavedChanges } from "./useUnsavedChanges";
import { UploadActivity } from "./UploadActivity";
import { validateAdministrationChanges } from "@/lib/administration";
import { validateProductChanges } from "@/lib/product-management";

type Section = "products"|"gallery"|"team"|"voucher"|"settings"|"marketing";
const titles: Record<Section,string> = {products:"Produkte & Kategorien",gallery:"Galerie",team:"Team",voucher:"Gutschein",settings:"Einstellungen",marketing:"Meldungen & Aktionen"};
const descriptions: Record<Section,string> = {
  products:"Deine Auswahl, übersichtlich gepflegt. Entwürfe bleiben nur für dich sichtbar.",
  gallery:"Zeige, was deinen Salon besonders macht. Wähle die schönsten Einblicke aus.",
  team:"Die Menschen hinter Golesta Beauty. Persönlich vorgestellt und einfach verwaltet.",
  voucher:"Ein schönes Geschenk. Gestalte die Informationen zu deinen Salongutscheinen.",
  settings:"Alle wichtigen Angaben zu deinem Salon an einem Ort.",
  marketing:"Halte deine Kundinnen und Kunden über Neuigkeiten und Angebote auf dem Laufenden.",
};
export default function ContentEditor({section}: {section: Section}) {
  const [data,setData] = useState<Content|null>(null);
  const [revision,setRevision] = useState(0);
  const [savedData,setSavedData] = useState<Content|null>(null);
  const [pendingUploads,setPendingUploads] = useState(0);
  const [dirty,setDirty] = useState(false);
  const [busy,setBusy] = useState(false);
  const [status,setStatus] = useState("");
  const [tone,setTone] = useState<"error"|"success">("success");
  const [loadError,setLoadError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    adminRequest<AdminContentResponse>("/api/admin/content",{signal:controller.signal}).then((result) => {
      if(!controller.signal.aborted){setData(result.data);setSavedData(result.data);setRevision(result.revision);}
    }).catch((error) => {if(!controller.signal.aborted){setStatus(error.message);setLoadError(true);}});
    return () => controller.abort();
  },[]);
  useUnsavedChanges(dirty||pendingUploads>0);
  const edit: Edit = (mutate) => {
    setData((previous) => {if(!previous)return null;const copy=structuredClone(previous);mutate(copy);return copy;});
    setDirty(true);setStatus("");
  };
  async function save() {
    if(!data||!dirty||busy||pendingUploads>0)return;
    try{if(savedData){validateProductChanges(savedData,data);validateAdministrationChanges(savedData,data);}}catch(error){setTone("error");setStatus(error instanceof Error?error.message:"Produkte prüfen.");return;}
    const validated=contentSchema.safeParse(data);
    if(!validated.success){
      const issue=validated.error.issues[0];
      const labels:Record<string,string>={name:"Name",title:"Überschrift",email:"E-Mail",phone:"Telefonnummer",whatsapp:"WhatsApp-Nummer",address:"Adresse",alt:"Bildbeschreibung",price:"Preis",value:"Wert",slug:"Produktlink",endsAt:"Enddatum",url:"Linkadresse",image:"Bild",categoryId:"Produktkategorie"};
      const field=labels[String(issue.path.at(-1))];
      if(issue.path[0]==="voucher"&&issue.path.includes("values")){setTone("error");setStatus("Gutscheinwerte müssen größer als 0 und höchstens 100.000 EUR sein. Du kannst die Werteliste auch leer lassen.");return;}
      if(issue.message.includes("Prozent")){setTone("error");setStatus("Ein prozentualer Rabatt darf höchstens 100 % betragen.");return;}
      if(issue.path.includes("specialties")){setTone("error");setStatus("Bitte fülle jedes Spezialgebiet aus oder entferne die leere Zeile.");return;}
      if(issue.path.at(-1)==="price"){setTone("error");setStatus("Bitte gib einen Preis zwischen 0 und 100.000 EUR ein oder lasse das Feld für eine Preisanfrage leer.");return;}
      setTone("error");setStatus(field ? `Bitte prüfe die Angabe „${field}“. Erforderliche Felder dürfen nicht leer sein.` : "Bitte prüfe deine Eingaben. Namen, Preise, Links und Zeiträume müssen vollständig und gültig sein.");
      return;
    }
    setBusy(true);setStatus("");
    try {
      const result=await adminRequest<{revision:number}>("/api/admin/content",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({data,revision})});
      setRevision(result.revision);setSavedData(structuredClone(data));setDirty(false);setTone("success");setStatus("Deine Änderungen wurden gespeichert. Entwürfe bleiben verborgen.");
    } catch(error){setTone("error");setStatus(error instanceof Error?error.message:"Speichern fehlgeschlagen. Bitte erneut versuchen.");}
    finally{setBusy(false);}
  }
  if(!data) return <section><PageHeader title={titles[section]} />{loadError ? <div className="space-y-4"><Notice tone="error">{status}</Notice><button className={button} type="button" onClick={() => window.location.reload()}>Erneut versuchen</button></div> : <LoadingState />}</section>;
  return <section>
    <PageHeader title={titles[section]} description={descriptions[section]} />
    <SaveBar dirty={dirty} busy={busy} blocked={pendingUploads>0} onSave={() => void save()} />
    {status && <div className="mb-5"><Notice tone={tone}>{status}</Notice></div>}
    {pendingUploads>0&&<div className="mb-5"><Notice>Bitte warte, bis alle Bilder übernommen sind. Danach kannst du speichern.</Notice></div>}
    <UploadActivity.Provider value={{begin:() => setPendingUploads((count) => count+1),end:() => setPendingUploads((count) => Math.max(0,count-1))}}>
    <fieldset disabled={busy||pendingUploads>0} className="min-w-0 space-y-5 disabled:opacity-60" aria-busy={busy}>
      {section==="products" && <ProductsEditor data={data} edit={edit} />}
      {section==="gallery" && <GalleryEditor data={data} edit={edit} />}
      {section==="team" && <TeamEditor data={data} edit={edit} />}
      {section==="settings" && <SettingsEditor data={data} edit={edit} />}
      {section==="marketing" && <MarketingEditor data={data} edit={edit} />}
      {section==="voucher" && <div className="admin-grid-2 items-start">
        <div className={card+" space-y-5"}><div className="admin-card-title"><h2>Dein Salongutschein</h2><Toggle label="Auf der Website anzeigen" checked={data.voucher.published} onChange={(value) => edit((draft) => {draft.voucher.published=value;})} /></div>
          <Input label="Beschreibung" multiline placeholder="Informationen zum Kauf und Einlösen" value={data.voucher.description} onChange={(value) => edit((draft) => {draft.voucher.description=value;})} />
          <p className="text-sm admin-muted">Die Gutscheine sind direkt im Salon erhältlich.</p>
        </div>
        <div className={card+" space-y-4"}><h2>Gutscheinwerte</h2><p className="text-sm admin-muted">Diese Beträge werden auf der Website angezeigt.</p>
          {!data.voucher.values.length && <EmptyState title="Freie Wahl beim Schenken" icon="voucher">Ergänze bei Bedarf feste Gutscheinwerte.</EmptyState>}
          {data.voucher.values.map((value,index) => <div key={index} className="flex items-end gap-3"><div className="min-w-0 flex-1"><Input label={`Gutscheinwert ${index+1} (€)`} type="number" value={value} onChange={(next) => edit((draft) => {draft.voucher.values[index]=Number(next);})} /></div><button className={button+" admin-button-danger"} type="button" onClick={() => edit((draft) => draft.voucher.values.splice(index,1))}>Entfernen</button></div>)}
          <button className={button} type="button" onClick={() => edit((draft) => draft.voucher.values.push(50))}>+ Gutscheinwert</button>
        </div>
      </div>}
    </fieldset>
    </UploadActivity.Provider>
  </section>;
}
