"use client";
import { useState, type ChangeEvent } from "react";
import { adminRequest } from "@/lib/content-client";
import { button } from "./editor-types";

/** Reduces large phone photos client-side before validating again with Sharp on the server. */
async function prepare(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Nur JPG, PNG oder WebP verwenden.");
  if (file.size <= 4 * 1024 * 1024) return file;
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 60_000_000) throw new Error("Bild ist zu groß.");
    const scale = Math.min(1, 1800 / bitmap.width, 1800 / bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Browser konnte Bild nicht verarbeiten.");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const result = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", 0.78));
    if (!result || result.size > 4 * 1024 * 1024) throw new Error("Bild nach Optimierung noch zu groß.");
    return result;
  } finally { bitmap.close(); }
}
export default function ImageUpload({ onUploaded, multiple = false, label = "Bild(er) hochladen", disabled = false }: {
  onUploaded: (urls: string[]) => void; multiple?: boolean; label?: string; disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setBusy(true); setError("");
    const uploaded: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`${i + 1} / ${files.length}`);
        const blob = await prepare(files[i]);
        const response = await adminRequest("/api/admin/upload", { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: blob });
        if (typeof response.url !== "string") throw new Error("Upload-Antwort ungültig.");
        uploaded.push(response.url);
        onUploaded([response.url]); // Keep successful uploads even if a subsequent file fails.
      }
      setProgress(`${uploaded.length} Bild(er) hochgeladen – Änderungen speichern.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Upload fehlgeschlagen."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-2">
    <label className={`${button} cursor-pointer ${disabled || busy ? "pointer-events-none opacity-40" : ""}`}>
      {busy ? `Lädt hoch ${progress}` : label}
      <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} disabled={disabled || busy} onChange={e => void upload(e)}/>
    </label>
    {(error || progress) && <p role="status" className={`text-xs ${error ? "text-red-700" : "text-[#74685d]"}`}>{error || progress}</p>}
  </div>;
}
