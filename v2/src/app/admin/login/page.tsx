"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminSession } from "@/components/admin/AdminSession";
import { Brand } from "@/components/admin/AdminShell";
import { Icon, LoadingState, Notice } from "@/components/admin/ui";
import { ApiError, withTimeout } from "@/lib/request";

export default function AdminLogin() {
  const { state, retry, logout } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth || busy || state.status === "checking") return;
    setBusy(true);
    setMessage("");
    try {
      await withTimeout(signInWithEmailAndPassword(auth, email.trim(), password), 15_000,
        "Die Anmeldung dauert zu lange. Bitte prüfe deine Verbindung und versuche es erneut.");
      setPassword("");
      if (state.status === "error") retry();
      // The shared session provider verifies server-side authorization.
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : "";
      setMessage(error instanceof ApiError ? error.message :
        code === "auth/network-request-failed" ? "Keine Verbindung. Bitte prüfe deine Internetverbindung." :
        code === "auth/too-many-requests" ? "Zu viele Anmeldeversuche. Bitte später erneut versuchen." :
        "Anmeldung fehlgeschlagen. Bitte prüfe E-Mail und Passwort.");
    } finally { setBusy(false); }
  }

  return <main className="admin-login">
    <aside className="admin-login-aside"><Brand /><p className="admin-eyebrow mt-16">Mit Liebe zum Detail</p><h2>Mehr Zeit für das,<br />was du liebst.</h2><p className="admin-muted max-w-sm">Dein Salonauftritt, an einem Ort. Pflege dein Angebot und schenke deinen Kundinnen und Kunden einen schönen ersten Eindruck.</p><p className="admin-eyebrow mt-16">Golesta Beauty · Villach</p></aside>
    <section className="admin-card admin-login-panel">
      <div className="mb-7 lg:hidden"><Brand /></div>
      <p className="admin-eyebrow">Willkommen zurück</p><h1 className="mt-2 mb-3">Anmeldung</h1>
      <p className="text-sm admin-muted">Dein persönlicher Zugang zur Salonverwaltung.</p>
      {state.status==="checking"&&<LoadingState>Zugriff wird geprüft …</LoadingState>}
      {"message" in state&&<div className="mt-5 space-y-3"><Notice tone="error">{state.message}</Notice><div className="flex flex-wrap gap-2"><button type="button" onClick={retry} className="admin-button">Erneut versuchen</button>{auth?.currentUser&&<button type="button" onClick={() => void logout()} className="admin-button admin-button-quiet">Anderes Konto verwenden</button>}</div></div>}
      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <label className="admin-field"><span className="admin-field-label">E-Mail</span><input type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={email} placeholder="Deine E-Mail-Adresse" onChange={(event) => setEmail(event.target.value)} className="admin-input" /></label>
        <label className="admin-field"><span className="admin-field-label">Passwort</span><input type="password" autoComplete="current-password" required value={password} placeholder="Dein Passwort" onChange={(event) => setPassword(event.target.value)} className="admin-input" /></label>
        {message&&<Notice tone="error">{message}</Notice>}
        <button type="submit" disabled={busy||!auth||state.status==="checking"} className="admin-button admin-button-primary w-full">{busy?"Bitte warten …":"Anmelden"}<Icon name="arrow" /></button>
      </form>
      <p className="mt-5 text-xs admin-muted">Der Zugang ist freigeschalteten Mitarbeitenden vorbehalten.</p>
      <Link href="/" className="admin-button admin-button-quiet mt-6"><Icon name="external" />Zur Website</Link>
    </section>
  </main>;
}
