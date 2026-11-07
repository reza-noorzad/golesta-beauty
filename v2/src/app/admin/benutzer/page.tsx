"use client";
import { useEffect, useState, type FormEvent } from "react";
import { adminRequest } from "@/lib/content-client";
import type { AdminUser } from "@/lib/admin-api";
import { useAdminSession } from "@/components/admin/AdminSession";
import { Input, Toggle, button, card, input } from "@/components/admin/editor-types";
import { Badge, EmptyState, LoadingState, Notice, PageHeader } from "@/components/admin/ui";
import { useUnsavedChanges } from "@/components/admin/useUnsavedChanges";
const roles={editor:"Redaktion",admin:"Administration",superadmin:"Salonleitung"};
export default function UsersPage() {
  const {state}=useAdminSession();
  const [users,setUsers]=useState<AdminUser[]>([]);
  const [saved,setSaved]=useState<AdminUser[]>([]);
  const [email,setEmail]=useState("");
  const [role,setRole]=useState<AdminUser["role"]>("editor");
  const [message,setMessage]=useState("");
  const [tone,setTone]=useState<"success"|"error">("success");
  const [credential,setCredential]=useState("");
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const accountDrafts=JSON.stringify(users)!==JSON.stringify(saved);
  useUnsavedChanges(accountDrafts||Boolean(email.trim())||Boolean(credential));
  useEffect(() => {
    const controller=new AbortController();
    adminRequest<{users:AdminUser[]}>("/api/admin/users",{signal:controller.signal}).then((result) => {if(!controller.signal.aborted){setUsers(result.users);setSaved(result.users);}})
      .catch((error) => {if(!controller.signal.aborted){setTone("error");setMessage(error.message);}})
      .finally(() => {if(!controller.signal.aborted)setLoading(false);});
    return () => controller.abort();
  },[]);
  async function refresh() {const result=await adminRequest<{users:AdminUser[]}>("/api/admin/users");setUsers(result.users);setSaved(result.users);}
  async function add(event:FormEvent) {
    event.preventDefault();if(busy||!email.trim())return;
    if(accountDrafts){setTone("error");setMessage("Bitte speichere zuerst deine Änderungen an vorhandenen Konten.");return;}
    setBusy(true);setMessage("");setCredential("");
    try{
      const result=await adminRequest<{uid:string;temporaryPassword:string|null}>("/api/admin/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:email.trim(),role})});
      if(result.temporaryPassword)setCredential(`E-Mail: ${email.trim()}\nStartpasswort: ${result.temporaryPassword}`);
      setEmail("");setTone("success");setMessage("Das Konto wurde freigeschaltet. Eine E-Mail wird nicht automatisch versendet.");
      try{await refresh();}catch{setTone("error");setMessage("Das Konto wurde freigeschaltet, aber die Liste konnte nicht aktualisiert werden. Bitte lade sie vor einem weiteren Versuch neu. Zugangsdaten bleiben hier erhalten.");}
    }catch(error){setTone("error");setMessage(error instanceof Error?error.message:"Das Konto konnte nicht hinzugefügt werden.");}
    finally{setBusy(false);}
  }
  async function update(user:AdminUser) {
    if(busy)return;
    const original=saved.find(entry=>entry.uid===user.uid);
    if((original?.active&&!user.active||original?.role==="superadmin"&&user.role!=="superadmin")&&!confirm("Diesen Zugang einschränken? Bitte prüfe die gewählte Berechtigung."))return;
    setBusy(true);setMessage("");
    try{await adminRequest<{ok:true}>("/api/admin/users",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({uid:user.uid,role:user.role,active:user.active})});setTone("success");setMessage("Die Berechtigung wurde gespeichert.");setSaved(rows=>rows.map(entry=>entry.uid===user.uid?{...user}:entry));}
    catch(error){setTone("error");setMessage(error instanceof Error?error.message:"Die Berechtigung konnte nicht gespeichert werden.");}
    finally{setBusy(false);}
  }
  return <section className="space-y-5">
    <PageHeader title="Administratoren & Rollen" description="Entscheide, wer deinen Salonauftritt pflegen darf. Änderungen an Konten sind der Salonleitung vorbehalten." />
    {message&&<Notice tone={tone}>{message}</Notice>}
    {credential&&<div className={card+" space-y-3"}><h2>Zugangsdaten sicher weitergeben</h2><p className="text-sm admin-muted">Bitte einmal sicher kopieren und persönlich weitergeben. Das Startpasswort sollte anschließend geändert werden.</p><pre className="whitespace-pre-wrap break-all rounded-xl bg-[#f2ede4] p-4 text-sm">{credential}</pre><div className="flex flex-wrap gap-2"><button type="button" className={button} onClick={async () => {try{await navigator.clipboard.writeText(credential);setTone("success");setMessage("Die Zugangsdaten wurden kopiert.");}catch{setTone("error");setMessage("Kopieren ist hier nicht möglich. Bitte markiere und kopiere die Zugangsdaten selbst.");}}}>Kopieren</button><button type="button" className={button+" admin-button-quiet"} onClick={() => setCredential("")}>Zugangsdaten ausblenden</button></div></div>}
    <details className="admin-disclosure"><summary>Neues Konto freischalten</summary><div className="admin-disclosure-body">
      <form onSubmit={(event) => void add(event)} className="space-y-4"><fieldset disabled={busy} className="admin-grid-2">
        <Input label="E-Mail" type="email" value={email} placeholder="name@beispiel.at" onChange={setEmail} />
        <label className="admin-field"><span className="admin-field-label">Berechtigung</span><select className={input} value={role} onChange={(event) => setRole(event.target.value as AdminUser["role"])}>{Object.entries(roles).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      </fieldset><p className="text-xs admin-muted">Redaktion pflegt Leistungen, Produkte, Galerie, Team und Bewertungen. Administration verwaltet alle Inhalte. Die Salonleitung darf zusätzlich Konten freischalten.</p><button type="submit" disabled={!email.trim()||busy} className="admin-button admin-button-primary">{busy?"Wird hinzugefügt …":"+ Administrator hinzufügen"}</button></form>
    </div></details>
    <section className="space-y-4"><div className="admin-card-title"><h2>Vorhandene Konten</h2><Badge>{users.length} Konten</Badge></div>
      {loading?<LoadingState>Konten werden geladen …</LoadingState>:!users.length?(tone==="error"?<button type="button" className={button} onClick={() => window.location.reload()}>Erneut versuchen</button>:<EmptyState title="Noch keine weiteren Konten" icon="users">Neue Konten kannst du oben freischalten.</EmptyState>):users.map((user,index) => {
        const self=state.status==="allowed"&&state.uid===user.uid;
        const changed=JSON.stringify(user)!==JSON.stringify(saved.find((entry) => entry.uid===user.uid));
        return <article className={card+" space-y-4"} key={user.uid}><div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><p className="font-medium">{user.email||"Administratorkonto"}</p><p className="text-xs admin-muted">{self?"Dein eigenes Konto":roles[user.role]}</p></div><Badge tone={user.active?"success":"neutral"}>{user.active?"Freigeschaltet":"Deaktiviert"}</Badge></div>
          <fieldset disabled={busy||self} className="grid items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <label className="admin-field"><span className="admin-field-label">Berechtigung</span><select aria-label={`Berechtigung für ${user.email||"Konto "+(index+1)}`} className={input} value={user.role} onChange={(event) => setUsers((rows) => rows.map((entry) => entry.uid===user.uid?{...entry,role:event.target.value as AdminUser["role"]}:entry))}>{Object.entries(roles).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <Toggle label="Zugang aktiv" checked={user.active} onChange={(value) => setUsers((rows) => rows.map((entry) => entry.uid===user.uid?{...entry,active:value}:entry))} />
            <button type="button" className={button+(changed?" admin-button-primary":"")} disabled={!changed||busy||self} onClick={() => void update(user)}>{busy?"Speichert …":"Speichern"}</button>
          </fieldset>
          {self&&<p className="text-xs admin-muted">Dein eigener Zugang bleibt hier geschützt.</p>}
        </article>;
      })}
    </section>
  </section>;
}
