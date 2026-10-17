import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { optimizeImage } from "@/lib/server/image";
import { failure, HttpError, limitedBody, requireAdmin } from "@/lib/server/firebase";
function configure(){
  const cloud_name=process.env.CLOUDINARY_CLOUD_NAME,api_key=process.env.CLOUDINARY_API_KEY,api_secret=process.env.CLOUDINARY_API_SECRET;
  if(!cloud_name||!api_key||!api_secret)throw new HttpError(503,"Cloudinary noch nicht konfiguriert.");
  cloudinary.config({cloud_name,api_key,api_secret,secure:true});
}
async function upload(bytes:Buffer):Promise<string>{return new Promise((resolve,reject)=>{
  const stream=cloudinary.uploader.upload_stream({folder:"golesta-v2",public_id:randomUUID(),resource_type:"image",format:"webp",overwrite:false},(error,result)=>{
    if(error||!result?.secure_url)return reject(error||new Error("Upload failed"));resolve(result.secure_url);
  });stream.on("error",reject);stream.end(bytes);
});}
export async function POST(request:Request){
  try{const {db,uid}=await requireAdmin(request);configure();const bytes=await limitedBody(request,4*1024*1024);
    let optimized:Buffer;try{optimized=await optimizeImage(bytes);}catch{throw new HttpError(400,"Nur gültige JPG, PNG oder WebP (max. 25 Megapixel). ");}
    const quota=db.doc(`golestaV2UploadLimits/${uid}`);
    await db.runTransaction(async tx=>{const snap=await tx.get(quota);const prev=snap.data();const now=Date.now();const recent=typeof prev?.start==="number"&&now-prev.start<3600000;const count=recent?Number(prev?.count||0):0;
      if(count>=60)throw new HttpError(429,"Upload-Limit erreicht. Bitte später erneut versuchen.");tx.set(quota,{start:recent?prev!.start:now,count:count+1});});
    let url:string;try{url=await upload(optimized);}catch(e){console.error("Cloudinary upload failed",e instanceof Error?e.name:"unknown");throw new HttpError(502,"Cloudinary-Upload fehlgeschlagen.");}
    return Response.json({url},{headers:{"Cache-Control":"no-store"}});
  }catch(e){return failure(e);}
}
