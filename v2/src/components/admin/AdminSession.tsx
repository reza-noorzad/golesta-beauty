"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { onIdTokenChanged, signOut, type User } from "firebase/auth";
import { auth, firebaseConfigured, firebaseInitializationError } from "@/lib/firebase";
import { monitorAdminSession, type SessionState } from "@/lib/admin-session";
import { ADMIN_ACCESS_EVENT, authenticatedRequest, type AdminSessionResponse } from "@/lib/admin-api";
import { withTimeout } from "@/lib/request";

type SessionContext = { state: SessionState; retry: () => void; logout: () => Promise<void> };
const Context = createContext<SessionContext | null>(null);
export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [observedState, setState] = useState<SessionState>({ status: "checking" });
  const state: SessionState = !firebaseConfigured || !auth
    ? { status: "error", message: firebaseInitializationError || "Die Anmeldung ist momentan nicht verfügbar. Bitte kontaktiere den Salon." }
    : observedState;
  const [attempt, setAttempt] = useState(0);
  const stopSession = useRef<() => void>(() => {});
  const retry = () => setAttempt((value) => value + 1);
  useEffect(() => {
    if (!firebaseConfigured || !auth) return;
    const controller = new AbortController();
    const stop = monitorAdminSession<User>({
      subscribe: (next, fail) => onIdTokenChanged(auth!, next, fail),
      authorize: (user) => authenticatedRequest<AdminSessionResponse>(user, "/api/admin/session", { signal: controller.signal }),
      changed: setState,
    });
    stopSession.current = () => { stop(); controller.abort(); };
    let refreshing = false;
    const refresh = () => {
      if (refreshing || document.visibilityState !== "visible" || !auth?.currentUser) return;
      refreshing = true;
      void withTimeout(auth.currentUser.getIdToken(true), 10_000, "Die Sitzung kann gerade nicht bestätigt werden.")
        .catch(() => { if (!controller.signal.aborted) setState({ status: "error", message: "Die Sitzung kann gerade nicht bestätigt werden. Bitte prüfe deine Verbindung und versuche es erneut." }); })
        .finally(() => { refreshing = false; });
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener(ADMIN_ACCESS_EVENT, retry);
    return () => {
      stop(); controller.abort();
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener(ADMIN_ACCESS_EVENT, retry);
    };
  }, [attempt]);
  async function logout() {
    stopSession.current();
    setState({ status: "checking" });
    try {
      if (auth) await withTimeout(signOut(auth), 10_000, "Die Abmeldung dauert zu lange. Bitte lade die Seite neu und versuche es erneut.");
      setState({ status: "anonymous" });
      setAttempt((value) => value + 1);
    } catch {
      setState({ status: "error", message: "Die Abmeldung konnte nicht abgeschlossen werden. Bitte versuche es erneut." });
    }
  }
  return <Context.Provider value={{ state, retry, logout }}>{children}</Context.Provider>;
}
export function useAdminSession() {
  const context = useContext(Context);
  if (!context) throw new Error("AdminSessionProvider fehlt.");
  return context;
}
