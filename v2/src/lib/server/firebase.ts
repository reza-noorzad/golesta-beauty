import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
export type AdminRole="superadmin"|"admin"|"editor";
export class HttpError extends Error { constructor(public status:number,message:string){super(message);} }
export function backend(){
  const projectId=process.env.FIREBASE_PROJECT_ID;
  if(!projectId||!process.env.FIREBASE_CLIENT_EMAIL||!process.env.FIREBASE_PRIVATE_KEY)
    throw new HttpError(503,"Firebase-Server noch nicht konfiguriert.");
  if(projectId!==process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    throw new HttpError(503,"Firebase-Projekte stimmen nicht überein.");
  const app=getApps().find(a=>a.name==="golesta-server")||initializeApp({credential:cert({projectId,clientEmail:process.env.FIREBASE_CLIENT_EMAIL,privateKey:process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,"\n")}),storageBucket:process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET},"golesta-server");
  return {auth:getAuth(app),db:getFirestore(app),storage:getStorage(app)};
}
export async function requireAdmin(request:Request,roles:AdminRole[]=["superadmin","admin","editor"]){
  const token=request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if(!token)throw new HttpError(401,"Bitte anmelden.");
  const b=backend();let uid:string;
  try{uid=(await b.auth.verifyIdToken(token,true)).uid;}catch{throw new HttpError(401,"Sitzung abgelaufen. Bitte erneut anmelden.");}
  const admin=await b.db.doc(`admins/${uid}`).get();
  if(admin.data()?.active!==true)throw new HttpError(403,"Keine Admin-Berechtigung.");
  const r=admin.data()?.role;
  const role:AdminRole=r==="superadmin"||r==="editor"||r==="admin"?r:"admin"; // legacy active admins remain usable
  if(!roles.includes(role))throw new HttpError(403,"Keine Berechtigung für diesen Bereich.");
  return {...b,uid,role};
}
export function failure(e:unknown){
  if(e instanceof HttpError)return Response.json({error:e.message},{status:e.status});
  console.error("Golesta API error",e instanceof Error?e.name:"unknown");
  return Response.json({error:"Serverfehler. Bitte erneut versuchen."},{status:500});
}
export async function limitedBody(request:Request,limit:number){
  if(Number(request.headers.get("content-length"))>limit)throw new HttpError(413,"Datei oder Daten zu groß.");
  const reader=request.body?.getReader();if(!reader)throw new HttpError(400,"Leere Anfrage.");
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new HttpError(413,"Datei oder Daten zu groß.");}chunks.push(value);}
  return Buffer.concat(chunks);
}
