import { initialContent, parseStoredContent, publicContent } from "@/lib/content";
import { backend, failure } from "@/lib/server/firebase";
export async function GET(){
  try{
    if(!process.env.FIREBASE_PROJECT_ID&&!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
      return Response.json(publicContent(initialContent),{headers:{"Cache-Control":"no-store"}});
    const snap=await backend().db.doc("golestaV2/content").get();
    return Response.json(publicContent(snap.exists?parseStoredContent(snap.data()?.data):initialContent),{headers:{"Cache-Control":"no-store"}});
  }catch(e){return failure(e);}
}
