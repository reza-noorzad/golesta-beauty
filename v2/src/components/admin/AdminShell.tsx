"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { adminDestination, type AdminRole } from "@/lib/admin-session";
import { useAdminSession } from "./AdminSession";
import { Icon, LoadingState, Notice, type IconName } from "./ui";

const links: { href: string; label: string; icon: IconName; roles?: AdminRole[] }[] = [
  { href: "/admin", label: "Übersicht", icon: "overview" },
  { href: "/admin/leistungen", label: "Leistungen & Preise", icon: "services" },
  { href: "/admin/produkte", label: "Produkte & Kategorien", icon: "products" },
  { href: "/admin/galerie", label: "Galerie", icon: "gallery" },
  { href: "/admin/team", label: "Team", icon: "team" },
  { href: "/admin/bewertungen", label: "Bewertungen", icon: "reviews" },
  { href: "/admin/gutschein", label: "Gutschein", icon: "voucher", roles: ["admin","superadmin"] },
  { href: "/admin/aktionen", label: "Meldungen & Aktionen", icon: "promotions", roles: ["admin","superadmin"] },
  { href: "/admin/einstellungen", label: "Einstellungen", icon: "settings", roles: ["admin","superadmin"] },
  { href: "/admin/benutzer", label: "Administratoren", icon: "users", roles: ["superadmin"] },
];
const roleNames: Record<AdminRole,string> = {superadmin:"Salonverwaltung",admin:"Administration",editor:"Redaktion"};
export function Brand() {
  return <Link href="/" className="admin-brand"><span className="admin-brand-mark" aria-hidden="true">g</span><span><span className="admin-brand-name">GOLESTA BEAUTY</span><span className="admin-brand-sub">Dein Salon im Blick</span></span></Link>;
}
export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const login = pathname === "/admin/login";
  const { state, retry, logout } = useAdminSession();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuOpen = menuFor === pathname;
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (login && state.status === "allowed") router.replace(adminDestination(new URLSearchParams(window.location.search).get("next")));
    else if (!login && state.status === "anonymous") router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [login,pathname,router,state.status]);
  useEffect(() => {
    if (!menuOpen) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") {setMenuFor(null);menuButton.current?.focus();} };
    window.addEventListener("keydown",escape);
    return () => window.removeEventListener("keydown",escape);
  },[menuOpen]);
  if (login) return <>{children}</>;
  if (state.status !== "allowed") return <main className="admin-gate"><div className="admin-card space-y-5">
    <Brand /><h1>Golesta Beauty Admin</h1>
    {state.status === "checking" ? <LoadingState>Zugriff wird geprüft …</LoadingState> : <><Notice tone="error">{"message" in state ? state.message : "Bitte anmelden."}</Notice><div className="flex flex-wrap gap-2">
      <button type="button" onClick={retry} className="admin-button admin-button-primary">Erneut versuchen</button>
      <Link href={`/admin/login?next=${encodeURIComponent(pathname)}`} className="admin-button">Zur Anmeldung</Link>
      <button type="button" onClick={() => void logout()} className="admin-button admin-button-quiet">Abmelden</button>
    </div></>}
  </div></main>;
  const {email,role} = state;
  const restricted = links.find((link) => link.href === pathname)?.roles;
  const navigation = <nav aria-label="Admin Navigation" className="admin-nav">{links.filter((link) => !link.roles || link.roles.includes(role)).map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuFor(null)} aria-current={pathname === link.href ? "page" : undefined} className="admin-nav-link"><Icon name={link.icon} /><span>{link.label}</span></Link>)}</nav>;
  const account = <><div className="admin-user"><span className="admin-avatar" aria-hidden="true">{email.slice(0,2).toLocaleUpperCase("de") || "GB"}</span><div className="min-w-0"><p className="admin-user-email">{email}</p><p className="text-xs admin-muted">{roleNames[role]}</p></div></div><div className="flex flex-wrap gap-2">
    <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-button admin-button-quiet"><Icon name="external" />Zur Website</Link>
    <button type="button" data-admin-leave onClick={() => void logout()} className="admin-button admin-button-quiet"><Icon name="logout" />Abmelden</button>
  </div></>;
  return <div className="admin-frame">
    <a href="#admin-inhalt" className="admin-skip">Zum Inhalt springen</a>
    <aside className="admin-sidebar"><Brand /><p className="admin-eyebrow px-3 mb-3">Salonverwaltung</p>{navigation}<div className="admin-sidebar-footer">{account}</div></aside>
    <div className="min-w-0">
      <header className="admin-mobile-header"><Brand /><button ref={menuButton} type="button" aria-label={menuOpen ? "Navigation schließen" : "Navigation öffnen"} aria-expanded={menuOpen} aria-controls="admin-mobile-navigation" className="admin-button admin-button-icon" onClick={() => setMenuFor(menuOpen ? null : pathname)}><Icon name={menuOpen ? "close" : "menu"} /></button></header>
      <div id="admin-mobile-navigation" className="admin-mobile-nav" hidden={!menuOpen}>{navigation}{account}</div>
      <main id="admin-inhalt" tabIndex={-1} className="admin-main"><div className="admin-main-inner">
        {restricted && !restricted.includes(role) ? <Notice tone="error">Für diesen Bereich fehlen Berechtigungen.</Notice> : children}
      </div></main>
    </div>
  </div>;
}
