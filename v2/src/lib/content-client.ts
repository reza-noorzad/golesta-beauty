"use client";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { contentSchema, initialContent, type Content } from "./content";
import { authenticatedRequest } from "./admin-api";
import { ApiError, requestJson } from "./request";

export async function adminRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  if (!auth?.currentUser) throw new ApiError("Bitte erneut anmelden.", 401);
  return authenticatedRequest<T>(auth.currentUser, url, options);
}
export function useContent() {
  const [data, setData] = useState<Content>(initialContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    let controller: AbortController | null = null;
    async function load() {
      controller?.abort();
      const current = new AbortController();
      controller = current;
      try {
        const result = contentSchema.safeParse(await requestJson("/api/content", { signal: current.signal }));
        if (!result.success) throw new ApiError("Die Inhalte konnten nicht geladen werden. Bitte versuche es später erneut.");
        if (alive && !current.signal.aborted) { setData(result.data); setError(""); }
      } catch (error) {
        if (alive && !current.signal.aborted) setError(error instanceof Error ? error.message : "Inhalte konnten nicht geladen werden.");
      } finally { if (alive && !current.signal.aborted) setLoading(false); }
    }
    void load();
    const interval = setInterval(() => void load(), 60_000);
    const focus = () => void load();
    window.addEventListener("focus", focus);
    return () => { alive = false; controller?.abort(); clearInterval(interval); window.removeEventListener("focus", focus); };
  }, []);
  return { data, loading, error };
}
