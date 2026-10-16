"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState, type ReactNode } from "react";
import { auth, db, firebaseConfigured } from "@/lib/firebase";

const links = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/leistungen", label: "Leistungen & Preise" },
  { href: "/admin/produkte", label: "Produkte" },
  { href: "/admin/galerie", label: "Galerie" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/gutschein", label: "Gutschein" },
  { href: "/admin/einstellungen", label: "Einstellungen" },
];

type Access = "checking" | "allowed" | "denied" | "error";

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [access, setAccess] = useState<Access>("checking");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseConfigured || !auth || !db) {
      setAccess("error");
      setError("Firebase ist noch nicht konfiguriert. Bitte .env.local prüfen.");
      return;
    }
    const firebaseAuth = auth;
    const firestore = db;
    let version = 0;
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user: User | null) => {
      const current = ++version;
      setAccess("checking");
      setError("");
      if (!user) {
        setEmail("");
        setAccess("denied");
        if (!isLogin) router.replace("/admin/login");
        return;
      }
      setEmail(user.email || "");
      try {
        const snapshot = await getDoc(doc(firestore, "admins", user.uid));
        if (current !== version) return;
        if (snapshot.exists() && snapshot.data().active === true) {
          setAccess("allowed");
          if (isLogin) router.replace("/admin");
        } else {
          setAccess("denied");
          setError("Dieses Konto hat keine Admin-Berechtigung.");
          if (!isLogin) router.replace("/admin/login");
        }
      } catch {
        if (current !== version) return;
        setAccess("error");
        setError("Admin-Berechtigung konnte nicht geprüft werden. Firestore-Regeln prüfen.");
        if (!isLogin) router.replace("/admin/login");
      }
    });
    return () => { version++; unsubscribe(); };
  }, [isLogin, router]);

  if (isLogin) return <>{children}</>;

  if (access !== "allowed") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] p-6">
        <div className="w-full max-w-md rounded-2xl border border-[#e8ddd0] bg-white p-8 text-center">
          <h1 className="font-serif text-2xl">Golesta Beauty Admin</h1>
          <p className="mt-4 text-sm text-[#74685d]">
            {access === "checking" ? "Zugriff wird geprüft …" : error || "Bitte anmelden."}
          </p>
          {access !== "checking" && <Link href="/admin/login" className="mt-6 inline-block rounded-full bg-[#a98348] px-6 py-3 text-sm text-white">Zur Anmeldung</Link>}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#332b26] lg:flex">
      <aside className="border-b border-[#e9e0d3] bg-white p-5 lg:min-h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-7">
        <Link href="/" className="text-lg font-semibold tracking-widest">GOLESTA BEAUTY</Link>
        <p className="mt-1 text-xs uppercase tracking-widest text-[#9c783f]">Admin</p>
        <nav aria-label="Admin Navigation" className="mt-7 flex gap-2 overflow-x-auto pb-2 lg:flex-col">
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}
              className={`shrink-0 rounded-xl px-4 py-3 text-sm transition ${pathname === link.href ? "bg-[#eae0d3] font-semibold text-[#684b28]" : "hover:bg-[#faf7f2]"}`}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-7 break-all text-xs text-[#74685d]">{email}</div>
        <button type="button" onClick={async () => { if (auth) await signOut(auth); router.replace("/admin/login"); }}
          className="mt-4 block text-sm text-[#8b6a3c] underline underline-offset-4">Abmelden</button>
        <Link href="/" className="mt-5 inline-block text-sm text-[#8b6a3c] underline underline-offset-4">Zur Website</Link>
      </aside>
      <div className="min-w-0 flex-1 p-5 sm:p-8 lg:p-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            TESTPHASE: Anmeldung und Admin-Prüfung sind aktiviert. Die Bearbeitungsseiten speichern noch keine Änderungen. Nicht veröffentlichen, bevor serverseitige Zugriffskontrolle und alle Datenregeln geprüft wurden.
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
