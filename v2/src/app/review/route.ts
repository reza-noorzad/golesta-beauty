import site from "@/data/site-data.json";

// The owner verified and approved this existing destination on 2026-11-12.
// Use the fixed site setting, never incoming query data or a caller's next URL.
export const dynamic = "force-static";
export function GET() {
  return new Response(null, {
    status: 302,
    headers: { Location: site.reviewUrl, "Cache-Control": "no-store" },
  });
}
