import { randomBytes } from "node:crypto";
import { z } from "zod";
import { failure, HttpError, limitedBody, requireAdmin } from "@/lib/server/firebase";
const roleSchema=z.enum(["superadmin","admin","editor"]);
export async function GET(request:Request){
  try{const {db,auth}=await requireAdmin(request,["superadmin"]);
    const snapshots=await db.collection("admins").limit(100).get();
    const users=await Promise.all(snapshots.docs.map(async snap=>{
      let email="";try{email=(await auth.getUser(snap.id)).email||"";}catch{}
      return {uid:snap.id,email,role:snap.data().role||"admin",active:snap.data().active===true};
    }));return Response.json({users},{headers:{"Cache-Control":"no-store"}});
  }catch(e){return failure(e);}
}
export async function POST(request:Request){
  try{const {db,auth,uid}=await requireAdmin(request,["superadmin"]);
    const body=JSON.parse((await limitedBody(request,3000)).toString());
    const input=z.object({email:z.email().max(200),role:roleSchema}).strict().parse(body);
    let target:string,temporaryPassword:string|undefined;
    try{target=(await auth.getUserByEmail(input.email.toLowerCase())).uid;}
    catch(e){if((e as {code?:string}).code!=="auth/user-not-found")throw e;
      temporaryPassword=randomBytes(24).toString("base64url");
      target=(await auth.createUser({email:input.email.toLowerCase(),password:temporaryPassword,disabled:false})).uid;
    }
    if(target===uid)throw new HttpError(400,"Eigene Berechtigung nicht hier ändern.");
    const existing=await db.doc(`admins/${target}`).get();
    if(existing.data()?.role==="superadmin")throw new HttpError(400,"Bestehenden Superadmin nicht überschreiben.");
    await db.doc(`admins/${target}`).set({active:true,role:input.role,addedBy:uid,updatedAt:new Date().toISOString()},{merge:true});
    return Response.json({uid:target,temporaryPassword:temporaryPassword||null});
  }catch(e){if(e instanceof z.ZodError)return Response.json({error:"E-Mail oder Rolle ungültig."},{status:400});return failure(e);}
}
export async function PATCH(request:Request){
  try{const {db,uid}=await requireAdmin(request,["superadmin"]);
    const body=JSON.parse((await limitedBody(request,3000)).toString());
    const input=z.object({uid:z.string().min(1).max(140),role:roleSchema,active:z.boolean()}).strict().parse(body);
    if(input.uid===uid)throw new HttpError(400,"Eigenen Superadmin nicht deaktivieren oder ändern.");
    const ref=db.doc(`admins/${input.uid}`);const snap=await ref.get();if(!snap.exists)throw new HttpError(404,"Administrator nicht gefunden.");
    await ref.update({role:input.role,active:input.active,updatedAt:new Date().toISOString()});
    return Response.json({ok:true});
  }catch(e){if(e instanceof z.ZodError)return Response.json({error:"Ungültige Daten."},{status:400});return failure(e);}
}
