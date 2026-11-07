import type { Content } from "@/lib/content";
export type Edit = (mutation: (draft: Content) => void) => void;
export type EditorProps = { data: Content; edit: Edit };
export const input = "admin-input";
export const button = "admin-button";
export const card = "admin-card";
export const makeId = () => `item-${crypto.randomUUID()}`;
export function localTime(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
export function isoTime(local: string): string { return local ? new Date(local).toISOString() : ""; }
export function Input({ label, value, onChange, multiline = false, type = "text", placeholder = "" }: {
  label: string; value: string | number; onChange: (value: string) => void; multiline?: boolean; type?: string; placeholder?: string;
}) {
  return <label className="admin-field"><span className="admin-field-label">{label}</span>{multiline
    ? <textarea rows={4} className={input} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    : <input type={type} step={type === "number" ? "0.01" : undefined} className={input} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />}</label>;
}
export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="admin-toggle"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>;
}
