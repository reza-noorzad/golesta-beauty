import { contentSchema, initialContent, parseStoredContent } from "@/lib/content";
import { failure, HttpError, limitedBody, requireAdmin } from "@/lib/server/firebase";
export async function GET(request: Request) {
  try { const { db } = await requireAdmin(request); const snap=await db.doc("golestaV2/content").get();
    return Response.json({data:snap.exists?parseStoredContent(snap.data()?.data):initialContent,revision:snap.data()?.revision||0},{headers:{"Cache-Control":"no-store"}});
  }catch(e){return failure(e);}
}
export async function PUT(request: Request) {
  try { const {db,uid,role}=await requireAdmin(request);let body:unknown;
    try{body=JSON.parse((await limitedBody(request,1_000_000)).toString());}catch(e){if(e instanceof HttpError)throw e;throw new HttpError(400,"Ungültiges JSON.");}
    if(!body||typeof body!=="object"||Array.isArray(body))throw new HttpError(400,"Ungültige Daten.");
    const payload=body as Record<string,unknown>;
    const parsed=contentSchema.safeParse(payload.data);
    if(!parsed.success)throw new HttpError(400,parsed.error.issues.slice(0,5).map(i=>`${i.path.join(".")}: ${i.message}`).join("\n"));
    if(!Number.isInteger(payload.revision))throw new HttpError(400,"Version fehlt.");
    const ref=db.doc("golestaV2/content");
    const revision=await db.runTransaction(async tx=>{
      const snap=await tx.get(ref);const previous=parseStoredContent(snap.data()?.data);
      const current=snap.data()?.revision||0;
      if(payload.revision!==current)throw new HttpError(409,"Zwischenzeitlich geändert. Bitte neu laden.");
      if(role==="editor"){
        for(const key of ["settings","voucher","announcements","promotions"] as const){
          if(JSON.stringify(previous[key]??[])!==JSON.stringify(parsed.data[key]??[]))
            throw new HttpError(403,"Diese Einstellungen dürfen nur Administratoren ändern.");
        }
      }
      tx.set(ref,{data:parsed.data,revision:current+1,updatedBy:uid,updatedAt:new Date().toISOString()});return current+1;
    });return Response.json({revision});
  }catch(e){return failure(e);}
}
