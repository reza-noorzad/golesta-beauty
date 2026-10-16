"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db, firebaseConfigured } from "@/lib/firebase";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!auth || !db) return;
    const firestore = db;
    let version = 0;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const current = ++version;
      if (!user) return;
      try {
        const snapshot = await getDoc(doc(firestore, "admins", user.uid));
        if (current !== version) return;
        if (snapshot.exists() && snapshot.data().active === true) {
          router.replace("/admin");
        } else {
          setMessage("Dieses Konto hat keine Admin-Berechtigung.");
        }
      } catch {
        if (current === version) setMessage("Admin-Berechtigung konnte nicht geprüft werden.");
      }
    });
    return () => { version++; unsubscribe(); };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth) { setMessage("Firebase ist nicht konfiguriert."); return; }
    setBusy(true);
    setMessage("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // AdminShell checks admins/{uid} and redirects authorized accounts.
    } catch {
      setMessage("Anmeldung fehlgeschlagen. E-Mail oder Passwort prüfen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-5 py-12 text-[#332b26]">
      <section className="w-full max-w-lg rounded-2xl border border-[#e8ddd0] bg-white p-7 sm:p-10">
        <p className="text-xs uppercase tracking-[0.25em] text-[#a98348]">Golesta Beauty · Admin</p>
        <h1 className="mt-3 font-serif text-3xl">Anmeldung</h1>
        <p className="mt-4 text-sm leading-6 text-[#74685d]">Nur für freigeschaltete Administratoren.</p>
        {!firebaseConfigured && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm">Firebase-Konfiguration fehlt in .env.local.</p>}
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <label className="block text-sm">E-Mail
            <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-[#e8ddd0] px-4 py-3 outline-[#a98348]" />
          </label>
          <label className="block text-sm">Passwort
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#e8ddd0] px-4 py-3 outline-[#a98348]" />
          </label>
          {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
          <button type="submit" disabled={busy || !firebaseConfigured} className="w-full rounded-full bg-[#a98348] px-6 py-3 font-medium text-white disabled:opacity-50">
            {busy ? "Bitte warten …" : "Anmelden"}
          </button>
        </form>
        <Link href="/" className="mt-7 inline-block text-sm text-[#8b6a3c] underline">Zur Website</Link>
      </section>
    </main>
  );
}
