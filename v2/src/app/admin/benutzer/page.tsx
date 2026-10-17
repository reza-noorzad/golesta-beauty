"use client";
import { useEffect, useState } from "react";
import { adminRequest } from "@/lib/content-client";
import { Input, button, card, input } from "@/components/admin/editor-types";
type User={uid:string;email:string;role:"superadmin"|"admin"|"editor";active:boolean};
export default function UsersPage(){
  const [users,setUsers]=useState<User[]>([]);const [email,setEmail]=useState("");const [role,setRole]=useState<User["role"]>("editor");
  const [message,setMessage]=useState("");const [credential,setCredential]=useState("");const [busy,setBusy]=useState(false);
  async function refresh(){try{const r=await adminRequest("/api/admin/users");setUsers(r.users);}catch(e){setMessage((e as Error).message);}}
  useEffect(()=>{void refresh();},[]);
  async function add(){setBusy(true);setMessage("");setCredential("");try{
    const r=await adminRequest("/api/admin/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,role})});
    if(r.temporaryPassword)setCredential(`E-Mail: ${email}\nEinmaliges Startpasswort: ${r.temporaryPassword}\nSicher an die neue Person übermitteln und sofort ändern lassen.`);
    setEmail("");setMessage("Administrator freigeschaltet.");await refresh();
  }catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
  async function update(user:User){setBusy(true);try{await adminRequest("/api/admin/users",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({uid:user.uid,role:user.role,active:user.active})});setMessage("Berechtigung aktualisiert.");await refresh();}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
  return <section className="space-y-6"><h1 className="font-serif text-4xl">Administratoren & Rollen</h1>
    <p className="text-sm text-[#74685d]">Nur Superadmins können Konten einladen oder Rollen ändern. Der vorhandene Hauptadmin muss einmal in Firestore die Rolle <code>superadmin</code> erhalten.</p>
    {message&&<p role="status" className="rounded-xl border p-3 text-sm">{message}</p>}
    {credential&&<div role="alert" className="rounded-xl border border-amber-400 bg-amber-50 p-4 text-sm"><strong>Einmalige Zugangsdaten – jetzt sicher kopieren!</strong><pre className="mt-3 whitespace-pre-wrap break-all">{credential}</pre><button type="button" className={button} onClick={()=>{void navigator.clipboard.writeText(credential);}}>Kopieren</button></div>}
    <div className={card+" space-y-4"}><h2 className="font-serif text-2xl">Neuer Administrator</h2><Input label="E-Mail" type="email" value={email} onChange={setEmail}/><label className="block text-sm">Rolle<select className={`${input} mt-1`} value={role} onChange={e=>setRole(e.target.value as User["role"])}><option value="editor">Editor – Produkte, Galerie, Team</option><option value="admin">Admin – alle Inhalte</option><option value="superadmin">Superadmin – inklusive Benutzerverwaltung</option></select></label>
      <button type="button" disabled={!email||busy} onClick={()=>void add()} className={button}>+ Administrator hinzufügen</button></div>
    <div className={card+" space-y-3"}><h2 className="font-serif text-2xl">Vorhandene Konten</h2>
      {users.map(user=><div key={user.uid} className="flex flex-wrap items-center gap-3 rounded-xl border p-3"><div className="min-w-[180px] flex-1 break-all"><p className="font-medium">{user.email||user.uid}</p><p className="text-xs text-[#74685d]">{user.uid}</p></div>
        <select aria-label="Rolle" className={input+" max-w-44"} value={user.role} onChange={e=>setUsers(rows=>rows.map(x=>x.uid===user.uid?{...x,role:e.target.value as User["role"]}:x))}><option value="editor">Editor</option><option value="admin">Admin</option><option value="superadmin">Superadmin</option></select>
        <label className="text-sm"><input type="checkbox" checked={user.active} onChange={e=>setUsers(rows=>rows.map(x=>x.uid===user.uid?{...x,active:e.target.checked}:x))}/> Aktiv</label>
        <button type="button" disabled={busy} className={button} onClick={()=>void update(user)}>Speichern</button></div>)}</div>
  </section>;
}
