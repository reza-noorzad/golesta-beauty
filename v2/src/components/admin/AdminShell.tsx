"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState, type ReactNode } from "react";
import { auth, db, firebaseConfigured } from "@/lib/firebase";

type Role = "superadmin" | "admin" | "editor";
const links: { href: string; label: string; roles?: Role[] }[] = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/leistungen", label: "Leistungen & Preise" },
  { href: "/admin/produkte", label: "Produkte & Kategorien" },
  { href: "/admin/galerie", label: "Galerie" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/bewertungen", label: "Bewertungen" },
  { href: "/admin/gutschein", label: "Gutschein", roles: ["admin","superadmin"] },
  { href: "/admin/aktionen", label: "Meldungen & Aktionen", roles: ["admin","superadmin"] },
  { href: "/admin/einstellungen", label: "Einstellungen", roles: ["admin","superadmin"] },
  { href: "/admin/benutzer", label: "Administratoren", roles: ["superadmin"] },
];
export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname=usePathname();const router=useRouter();const login=pathname==="/admin/login";
  const [status,setStatus]=useState<"checking"|"allowed"|"denied"|"error">("checking");
  const [email,setEmail]=useState("");const [role,setRole]=useState<Role>("editor");const [error,setError]=useState("");
  useEffect(()=>{
    if(!firebaseConfigured||!auth||!db){setStatus("error");setError("Firebase ist nicht konfiguriert.");return;}
    const firestore=db;let generation=0;
    const stop=onAuthStateChanged(auth,async(user:User|null)=>{
      const current=++generation;setStatus("checking");setError("");
      if(!user){setEmail("");setStatus("denied");if(!login)router.replace("/admin/login");return;}
      setEmail(user.email||"");
      try{const snap=await getDoc(doc(firestore,"admins",user.uid));if(current!==generation)return;
        if(snap.exists()&&snap.data().active===true){const r=snap.data().role;
          setRole(r==="superadmin"||r==="admin"||r==="editor"?r:"admin");setStatus("allowed");if(login)router.replace("/admin");
        }else{setStatus("denied");setError("Keine Admin-Berechtigung.");if(!login)router.replace("/admin/login");}
      }catch{if(current!==generation)return;setStatus("error");setError("Berechtigung kann nicht überprüft werden.");if(!login)router.replace("/admin/login");}
    });return()=>{generation++;stop();};
  },[login,router]);
  if(login)return <>{children}</>;
  if(status!=="allowed")return <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] p-6"><div className="rounded-2xl border bg-white p-8"><h1 className="font-serif text-2xl">Golesta Beauty Admin</h1><p className="mt-3 text-sm">{status==="checking"?"Zugriff wird geprüft …":error||"Bitte anmelden."}</p>{status!=="checking"&&<Link href="/admin/login" className="mt-5 inline-block underline">Anmelden</Link>}</div></main>;
  const restricted=links.find(x=>x.href===pathname)?.roles;
  return <div className="min-h-screen bg-[#faf7f2] text-[#332b26] lg:flex">
    <aside className="border-b border-[#e9e0d3] bg-white p-5 lg:min-h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-7">
      <Link href="/" className="text-lg font-semibold tracking-widest">GOLESTA BEAUTY</Link><p className="mt-1 text-xs uppercase tracking-widest text-[#9c783f]">Admin · {role}</p>
      <nav aria-label="Admin Navigation" className="mt-7 flex gap-2 overflow-x-auto pb-2 lg:flex-col">
        {links.filter(link=>!link.roles||link.roles.includes(role)).map(link=><Link key={link.href} href={link.href} aria-current={pathname===link.href?"page":undefined} className={`shrink-0 rounded-xl px-4 py-3 text-sm transition ${pathname===link.href?"bg-[#eae0d3] font-semibold text-[#684b28]":"hover:bg-[#faf7f2]"}`}>{link.label}</Link>)}
      </nav>
      <p className="mt-7 break-all text-xs text-[#74685d]">{email}</p>
      <button type="button" onClick={async()=>{if(auth)await signOut(auth);router.replace("/admin/login");}} className="mt-4 block text-sm text-[#8b6a3c] underline">Abmelden</button>
      <Link href="/" className="mt-5 inline-block text-sm text-[#8b6a3c] underline">Zur Website</Link>
    </aside><main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-12"><div className="mx-auto max-w-6xl">
      {restricted&&!restricted.includes(role)?<p role="alert">Für diesen Bereich fehlen Berechtigungen.</p>:children}
    </div></main>
  </div>;
}
