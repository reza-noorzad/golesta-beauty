import { z } from "zod";
import { failure, HttpError, readJson, readDeadline, json, requireAdmin } from "@/lib/server/firebase";
export const runtime = "nodejs";
export async function GET(request:Request){try{const {db}=await requireAdmin(request);const collection=db.collection("golestaV2Reviews");
  const [recent,pending,...totals]=await readDeadline(Promise.all([collection.orderBy("createdAt","desc").limit(200).get(),collection.where("status","==","pending").limit(200).get(),...["pending","approved","rejected"].map(status=>collection.where("status","==",status).count().get())]));
  const rows=new Map([...recent.docs,...pending.docs].map(document=>[document.id,{...document.data(),id:document.id}]));
  const counts={pending:totals[0].data().count,approved:totals[1].data().count,rejected:totals[2].data().count};
  return json({reviews:[...rows.values()].sort((a,b)=>String((b as {createdAt?:string}).createdAt||"").localeCompare(String((a as {createdAt?:string}).createdAt||""))),counts});}catch(e){return failure(e);}}
export async function PATCH(request:Request){try{const {db}=await requireAdmin(request);const body=await readJson(request,2000);const input=z.object({id:z.string().regex(/^[a-zA-Z0-9_-]{1,150}$/),status:z.enum(["approved","rejected","pending"])}).strict().parse(body);
  const ref=db.doc(`golestaV2Reviews/${input.id}`);if(!(await ref.get()).exists)throw new HttpError(404,"Bewertung nicht gefunden.");await ref.update({status:input.status,moderatedAt:new Date().toISOString()});return json({ok:true});
}catch(e){if(e instanceof z.ZodError)return json({error:"Ungültige Daten."},400);return failure(e);}}
