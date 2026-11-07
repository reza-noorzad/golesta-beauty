import { failure, json, requireAdmin } from "@/lib/server/firebase";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try { const { uid, role } = await requireAdmin(request); return json({ uid, role }); }
  catch (error) { return failure(error); }
}
