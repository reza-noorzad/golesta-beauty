// Retain printed review QR links without forwarding incoming query data.
export const dynamic = "force-static";
export function GET() {
  return Response.redirect("https://g.page/r/CQEXAMPLE/review", 302);
}
