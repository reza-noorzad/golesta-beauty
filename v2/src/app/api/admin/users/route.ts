import { randomBytes } from "node:crypto";
import { z } from "zod";
import { failure, HttpError, readJson, readDeadline, json, requireAdmin } from "@/lib/server/firebase";
export const runtime = "nodejs";
const roleSchema=z.enum(["superadmin","admin","editor"]);
export async function GET(request:Request){
  try{const {db,auth}=await requireAdmin(request,["superadmin"]);
    const snapshots=await readDeadline(db.collection("admins").limit(100).get());
    const users=await readDeadline(Promise.all(snapshots.docs.map(async snap=>{
      let email="";try{email=(await auth.getUser(snap.id)).email||"";}catch{}
      return {uid:snap.id,email,role:snap.data().role||"admin",active:snap.data().active===true};
    })));return json({users});
  }catch(e){return failure(e);}
}
export async function POST(request:Request){
  try{const {db,auth,uid}=await requireAdmin(request,["superadmin"]);
    const body=await readJson(request,3000);
    const input=z.object({email:z.email().max(200),role:roleSchema}).strict().parse(body);
    let target:string,temporaryPassword:string|undefined;
    try{const account=await auth.getUserByEmail(input.email.toLowerCase());if(account.disabled)throw new HttpError(409,"Dieses Konto ist gesperrt und kann hier nicht freigeschaltet werden.");target=account.uid;}
    catch(e){if((e as {code?:string}).code!=="auth/user-not-found")throw e;
      temporaryPassword=randomBytes(24).toString("base64url");
      target=(await auth.createUser({email:input.email.toLowerCase(),password:temporaryPassword,disabled:false})).uid;
    }
    if(target===uid)throw new HttpError(400,"Eigene Berechtigung nicht hier ändern.");
    await db.runTransaction(async tx=>{
      const actor=await tx.get(db.doc(`admins/${uid}`));
      const ref=db.doc(`admins/${target}`);const existing=await tx.get(ref);
      if(actor.data()?.active!==true||actor.data()?.role!=="superadmin")throw new HttpError(403,"Deine Berechtigung hat sich geändert. Bitte erneut anmelden.");
      if(existing.exists)throw new HttpError(409,"Dieses Konto ist bereits erfasst. Bitte ändere seinen Zugang in der Kontenliste.");
      tx.set(ref,{active:true,role:input.role,addedBy:uid,updatedAt:new Date().toISOString()});
    });
    return json({uid:target,temporaryPassword:temporaryPassword||null});
  }catch(e){if(e instanceof z.ZodError)return json({error:"E-Mail oder Rolle ungültig."},400);return failure(e);}
}
export async function PATCH(request:Request){
  try{const {db,uid}=await requireAdmin(request,["superadmin"]);
    const body=await readJson(request,3000);
    const input=z.object({uid:z.string().min(1).max(128).refine(value=>!/[\\/]/.test(value)&&value!=="."&&value!==".."),role:roleSchema,active:z.boolean()}).strict().parse(body);
    if(input.uid===uid)throw new HttpError(400,"Eigenen Superadmin nicht deaktivieren oder ändern.");
    await db.runTransaction(async tx=>{
      const actor=await tx.get(db.doc(`admins/${uid}`));const ref=db.doc(`admins/${input.uid}`);const snap=await tx.get(ref);
      if(actor.data()?.active!==true||actor.data()?.role!=="superadmin")throw new HttpError(403,"Deine Berechtigung hat sich geändert. Bitte erneut anmelden.");
      if(!snap.exists)throw new HttpError(404,"Administrator nicht gefunden.");
      tx.set(ref,{...snap.data(),role:input.role,active:input.active,updatedAt:new Date().toISOString()});
    });
    return json({ok:true});
  }catch(e){if(e instanceof z.ZodError)return json({error:"Ungültige Daten."},400);return failure(e);}
}
