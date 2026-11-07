import { initialContent, parseStoredContent } from "@/lib/content";
import { publicSiteContent } from "@/lib/public-content";
import { backend, failure, readDeadline } from "@/lib/server/firebase";
export const runtime = "nodejs";
export async function GET(){
  try{
    if(!process.env.FIREBASE_PROJECT_ID&&!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
      return Response.json(publicSiteContent(initialContent),{headers:{"Cache-Control":"no-store"}});
    const snap=await readDeadline(backend().db.doc("golestaV2/content").get());
    return Response.json(publicSiteContent(snap.exists?parseStoredContent(snap.data()?.data):initialContent),{headers:{"Cache-Control":"no-store"}});
  }catch(e){return failure(e);}
}
