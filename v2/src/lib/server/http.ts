export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
export function failure(error: unknown) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  console.error("Golesta API error", error instanceof Error ? error.name : "unknown");
  return json({ error: "Serverfehler. Bitte erneut versuchen." }, 500);
}
/** Reads can time out safely. Do not wrap mutations: they may still commit. */
export function readDeadline<T>(operation: Promise<T>, milliseconds = 10_000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new HttpError(503, "Die Daten können gerade nicht geladen werden. Bitte später erneut versuchen.")), milliseconds);
    operation.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}
export async function limitedBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) throw new HttpError(413, "Datei oder Daten zu groß.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Leere Anfrage.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) { await reader.cancel(); throw new HttpError(413, "Datei oder Daten zu groß."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
export async function readJson(request: Request, limit: number): Promise<unknown> {
  try { return JSON.parse((await limitedBody(request, limit)).toString()); }
  catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, "Ungültiges JSON."); }
}
