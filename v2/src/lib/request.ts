export class ApiError extends Error {
  constructor(message: string, public status = 0) { super(message); this.name = "ApiError"; }
}

export function withTimeout<T>(operation: Promise<T>, milliseconds: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new ApiError(message)), milliseconds);
    operation.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

/** One deadline covers connection AND body reading. Mutations are never retried. */
export async function requestJson(url: string, options: RequestInit = {}, timeoutMs = 20_000): Promise<unknown> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  if (options.signal?.aborted) abort();
  const timer = setTimeout(abort, timeoutMs);
  try {
    const response = await fetch(url, { ...options, cache: "no-store", signal: controller.signal });
    const text = await response.text();
    let body: unknown;
    try { body = JSON.parse(text); } catch { /* Proxies may return HTML or empty bodies. */ }
    if (!response.ok) {
      const messages: Record<number, string> = {
        401: "Deine Sitzung ist abgelaufen. Bitte erneut anmelden.",
        403: "Für diese Aktion fehlen die Berechtigungen.",
        409: "Die Daten wurden zwischenzeitlich geändert. Bitte neu laden.",
        413: "Datei oder Daten zu groß.",
        429: "Zu viele Anfragen. Bitte später erneut versuchen.",
        502: "Der Dienst ist vorübergehend nicht erreichbar. Bitte erneut versuchen.",
        503: "Der Dienst ist vorübergehend nicht verfügbar. Bitte später erneut versuchen.",
        504: "Die Anfrage dauert zu lange. Bitte erneut versuchen.",
      };
      const detail = body && typeof body === "object" && "error" in body ? body.error : null;
      const safeDetail = [400, 404, 409, 413, 429].includes(response.status) &&
        typeof detail === "string" && detail.length <= 1000 && !/[<>]/.test(detail);
      throw new ApiError(safeDetail ? detail : messages[response.status] || "Die Anfrage ist fehlgeschlagen. Bitte erneut versuchen.", response.status);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new ApiError("Die Antwort konnte nicht gelesen werden. Bitte erneut versuchen.");
    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) throw new ApiError(options.signal?.aborted ? "Die Anfrage wurde abgebrochen." :
      !options.method || options.method.toUpperCase() === "GET" ? "Die Anfrage dauert zu lange. Bitte prüfe deine Verbindung und versuche es erneut." :
      "Die Anfrage dauert zu lange. Bitte lade die Daten vor einem erneuten Speichern neu; die Änderung könnte bereits übernommen worden sein.");
    throw new ApiError("Keine Verbindung zum Server. Bitte prüfe deine Internetverbindung und versuche es erneut.");
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
  }
}
