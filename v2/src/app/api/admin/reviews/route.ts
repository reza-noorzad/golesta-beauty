import { z } from "zod";
import { failure, HttpError, limitedBody, requireAdmin } from "@/lib/server/firebase";
export async function GET(request:Request){try{const {db}=await requireAdmin(request);const snap=await db.collection("golestaV2Reviews").orderBy("createdAt","desc").limit(200).get();return Response.json({reviews:snap.docs.map(x=>({id:x.id,...x.data()}))},{headers:{"Cache-Control":"no-store"}});}catch(e){return failure(e);}}
export async function PATCH(request:Request){try{const {db}=await requireAdmin(request);const body=JSON.parse((await limitedBody(request,2000)).toString());const input=z.object({id:z.string().min(1).max(150),status:z.enum(["approved","rejected","pending"])}).strict().parse(body);
  const ref=db.doc(`golestaV2Reviews/${input.id}`);if(!(await ref.get()).exists)throw new HttpError(404,"Bewertung nicht gefunden.");await ref.update({status:input.status,moderatedAt:new Date().toISOString()});return Response.json({ok:true});
}catch(e){if(e instanceof z.ZodError)return Response.json({error:"Ungültige Daten."},{status:400});return failure(e);}}
