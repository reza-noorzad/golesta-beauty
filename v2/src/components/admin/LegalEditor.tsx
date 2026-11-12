"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminRequest } from "@/lib/content-client";
import { emptyImprint, emptyPrivacy, imprintFields, type Imprint, type Legal, type LegalDocument, type LegalResponse, type Privacy } from "@/lib/legal";
import LegalDocumentBody from "@/components/public/LegalDocumentBody";
import { useAdminSession } from "./AdminSession";
import { Input, button, card } from "./editor-types";
import { Badge, LoadingState, Notice, PageHeader } from "./ui";
import { useUnsavedChanges } from "./useUnsavedChanges";

const date = (value?: string) => value ? new Date(value).toLocaleString("de-AT", { timeZone: "Europe/Berlin" }) : "Noch nicht gespeichert";
type Action = (action: "save-draft" | "publish", document: LegalDocument, content?: Imprint | Privacy) => Promise<void>;

export default function LegalEditor() {
  const { state } = useAdminSession();
  const [result, setResult] = useState<LegalResponse | null>(null);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [versions, setVersions] = useState({ impressum: 0, privacy: 0 });
  const [dirty, setDirty] = useState({ impressum: false, privacy: false });
  const saving = useRef(false);
  useUnsavedChanges(dirty.impressum || dirty.privacy);
  const changed = useCallback((document: LegalDocument, value: boolean) => setDirty(previous => previous[document] === value ? previous : { ...previous, [document]: value }), []);
  useEffect(() => {
    const controller = new AbortController();
    adminRequest<LegalResponse>("/api/admin/legal", { signal: controller.signal }).then(value => { if (!controller.signal.aborted) { setResult(value); setMessage(""); } })
      .catch(error => { if (!controller.signal.aborted) { setFailed(true); setMessage(error.message); } });
    return () => controller.abort();
  }, [generation]);
  const act: Action = async (action, document, content) => {
    if (!result || saving.current) return;
    saving.current = true; setBusy(true); setMessage(""); setFailed(false);
    try {
      const body = action === "save-draft" ? { action, document, content, revision: result.revision } : { action, document, approved: true, revision: result.revision };
      const next = await adminRequest<LegalResponse>("/api/admin/legal", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setResult(next);
      // Remount only the saved document: preserve unsaved edits in the other one.
      setVersions(previous => ({ ...previous, [document]: previous[document] + 1 }));
      changed(document, false);
      setMessage(action === "save-draft" ? "Entwurf gespeichert. Die öffentliche Fassung bleibt unverändert." : "Freigegebene Fassung veröffentlicht.");
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Speichern fehlgeschlagen. Dein Text bleibt erhalten."); }
    finally { saving.current = false; setBusy(false); }
  };
  function reload() {
    if ((dirty.impressum || dirty.privacy) && !confirm("Ungespeicherte Änderungen verwerfen und den aktuellen Stand neu laden?")) return;
    setResult(null); setDirty({ impressum: false, privacy: false }); setGeneration(value => value + 1);
  }
  return <section>
    <PageHeader title="Rechtliches & Datenschutz" description="Entwürfe bleiben privat. Nur ausdrücklich freigegebene Fassungen werden veröffentlicht." />
    <div className="mb-5"><Notice>Bitte trage nur geprüfte Angaben und freigegebene Texte ein. Ein gespeicherter Entwurf ist keine rechtliche Prüfung und keine Veröffentlichung.</Notice></div>
    <button type="button" className={button + " mb-5"} disabled={busy} onClick={reload}>Aktuellen Stand neu laden</button>
    {message && <div className="mb-5"><Notice tone={failed ? "error" : "success"}>{message}</Notice></div>}
    {!result ? !message && <LoadingState /> : <div className="space-y-7">
      {(["impressum", "privacy"] as const).map(document => <DocumentEditor key={`${generation}-${document}-${versions[document]}`} document={document} legal={result.legal} busy={busy} canPublish={state.status === "allowed" && state.role === "superadmin"} changed={changed} act={act} />)}
    </div>}
  </section>;
}

function DocumentEditor({ document, legal, busy, canPublish, changed, act }: {
  document: LegalDocument; legal: Legal; busy: boolean; canPublish: boolean;
  changed: (document: LegalDocument, value: boolean) => void; act: Action;
}) {
  const title = document === "impressum" ? "Impressum" : "Datenschutzerklärung";
  const saved = legal[document];
  const [imprint, setImprint] = useState<Imprint>(() => structuredClone(legal.impressum?.draft?.content || legal.impressum?.published?.content || emptyImprint));
  const [privacy, setPrivacy] = useState<Privacy>(() => structuredClone(legal.privacy?.draft?.content || legal.privacy?.published?.content || emptyPrivacy));
  const [dirty, setDirty] = useState(false);
  const [approved, setApproved] = useState(false);
  const [preview, setPreview] = useState(false);
  useEffect(() => changed(document, dirty), [changed, document, dirty]);
  function edit() { setDirty(true); setApproved(false); }
  const pending = saved?.published && saved.draft && JSON.stringify(saved.published.content) !== JSON.stringify(saved.draft.content);
  return <section aria-label={title} className={card + " space-y-5"}>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2>{title}</h2><Badge tone={saved?.published ? pending ? "warning" : "success" : "neutral"}>{saved?.published ? pending ? "Veröffentlicht · neuer Entwurf" : "Veröffentlicht" : "Nicht veröffentlicht"}</Badge></div>
    <p className="text-sm admin-muted">Entwurf aktualisiert: {date(saved?.draft?.updatedAt)}{saved?.published && <> · Veröffentlicht: {date(saved.published.publishedAt)}</>}{dirty && " · Ungespeicherte Änderungen"}</p>
    <fieldset disabled={busy} className="min-w-0 space-y-4 disabled:opacity-60">
      <legend className="sr-only">{title} bearbeiten</legend>
      {document === "impressum" ? <>
        <p className="text-sm admin-muted">Inhaber, Rechtsform, offizielle Anschrift, E-Mail und Telefon sind zur Veröffentlichung erforderlich. Prüfe alle weiteren zutreffenden Pflichtangaben; nicht zutreffende Angaben dürfen nach Prüfung leer bleiben.</p>
        <div className="admin-grid-2">{imprintFields.map(field => <Input key={field.key} label={field.label + (field.required ? " *" : " (falls zutreffend)")} multiline={field.multiline} value={imprint[field.key]} onChange={value => { setImprint(previous => ({ ...previous, [field.key]: value })); edit(); }} />)}</div>
      </> : <>
        <p className="text-sm admin-muted">Füge deinen geprüften Datenschutztext abschnittsweise ein. Prüfe insbesondere Verantwortlichkeit, Zwecke, Rechtsgrundlagen, Empfänger, Speicherfristen, Datenübermittlungen und Rechte. Es werden keine Texte automatisch erstellt oder freigegeben.</p>
        {privacy.sections.map((section, index) => <div key={section.id} className="space-y-3 rounded-xl border border-[#e3ddd3] p-4">
          <Input label={`Abschnitt ${index + 1}: Überschrift`} value={section.title} onChange={value => { setPrivacy(previous => ({ sections: previous.sections.map(item => item.id === section.id ? { ...item, title: value } : item) })); edit(); }} />
          <Input label={`Abschnitt ${index + 1}: Text`} multiline value={section.body} onChange={value => { setPrivacy(previous => ({ sections: previous.sections.map(item => item.id === section.id ? { ...item, body: value } : item) })); edit(); }} />
          <button type="button" className={button + " admin-button-danger"} onClick={() => { setPrivacy(previous => ({ sections: previous.sections.filter(item => item.id !== section.id) })); edit(); }}>Abschnitt {index + 1} entfernen</button>
        </div>)}
        <button type="button" className={button} disabled={privacy.sections.length >= 12} onClick={() => { setPrivacy(previous => ({ sections: [...previous.sections, { id: crypto.randomUUID(), title: "", body: "" }] })); edit(); }}>Abschnitt hinzufügen</button>
      </>}
      <div className="flex flex-wrap gap-3">
        <button type="button" className={button + " admin-button-primary"} disabled={!dirty} onClick={() => void act("save-draft", document, document === "impressum" ? imprint : privacy)}>Entwurf speichern</button>
        <button type="button" className={button} aria-expanded={preview} onClick={() => setPreview(value => !value)}>Vorschau</button>
      </div>
      {preview && <div role="region" aria-label={`Vorschau ${title}`} className="space-y-4 break-words rounded-xl border border-[#e3ddd3] bg-white p-5 leading-7">
        <h3>Private Vorschau – {title}</h3><p className="text-sm admin-muted">Diese Vorschau veröffentlicht keine Änderungen.</p>
        {document === "impressum" ? <LegalDocumentBody document="impressum" content={imprint} /> : <LegalDocumentBody document="privacy" content={privacy} />}
      </div>}
      {canPublish ? <>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={approved} disabled={dirty || !saved?.draft} onChange={event => setApproved(event.target.checked)} /><span>Ich bestätige als Salonleitung: Diese gespeicherte Fassung wurde geprüft, alle zutreffenden Pflichtangaben sind vollständig und der Text ist zur Veröffentlichung freigegeben.</span></label>
        <button type="button" className={button + " admin-button-primary"} disabled={dirty || !saved?.draft || !approved} onClick={() => void act("publish", document)}>Veröffentlichen</button>
        {dirty && <p className="text-sm admin-muted">Speichere zuerst diesen Entwurf. Danach kannst du genau diese Fassung freigeben.</p>}
      </> : <Notice>Die Salonleitung mit Superadmin-Zugang muss jede Fassung ausdrücklich freigeben und veröffentlichen.</Notice>}
    </fieldset>
  </section>;
}
