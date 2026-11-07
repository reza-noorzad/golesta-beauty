import type { ReactNode } from "react";
import type { Viewport } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { AdminSessionProvider } from "@/components/admin/AdminSession";
import "./admin.css";
// Preserve the admin viewport while public pages use safe-area aware full width.
export const viewport: Viewport = { viewportFit: "auto" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-app"><AdminSessionProvider><AdminShell>{children}</AdminShell></AdminSessionProvider></div>;
}
