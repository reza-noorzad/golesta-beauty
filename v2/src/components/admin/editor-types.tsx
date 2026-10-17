import type { Content } from "@/lib/content";
export type Edit = (mutation: (draft: Content) => void) => void;
export type EditorProps = { data: Content; edit: Edit };
export const input = "w-full min-w-0 rounded-xl border border-[#e8ddd0] bg-white px-3 py-2.5 text-sm outline-[#a98348]";
export const button = "inline-flex items-center justify-center rounded-xl border border-[#d8c4a8] bg-white px-3 py-2 text-sm text-[#5c4530] hover:bg-[#f6efe5] disabled:opacity-40";
export const card = "rounded-2xl border border-[#e8ddd0] bg-white p-4 sm:p-6";
export const makeId = () => `item-${crypto.randomUUID()}`;
export function localTime(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
export function isoTime(local: string): string {
  return local ? new Date(local).toISOString() : "";
}
export function Input({ label, value, onChange, multiline = false, type = "text", placeholder = "" }: {
  label: string; value: string | number; onChange: (v: string) => void; multiline?: boolean; type?: string; placeholder?: string;
}) {
  return <label className="block min-w-0 text-sm text-[#584f46]"><span className="mb-1 block font-medium">{label}</span>{multiline
    ? <textarea rows={5} className={`${input} whitespace-pre-wrap leading-relaxed`} value={value} placeholder={placeholder} onFocus={e => { if (e.currentTarget.dataset.example === "true") e.currentTarget.select(); }} onChange={e => onChange(e.target.value)} />
    : <input type={type} step={type === "number" ? "0.01" : undefined} className={input} value={value} placeholder={placeholder} onFocus={e => { if (e.currentTarget.dataset.example === "true") e.currentTarget.select(); }} onChange={e => onChange(e.target.value)} />}</label>;
}
export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />{label}</label>;
}
