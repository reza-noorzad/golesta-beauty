import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
// Run against a separately built copy with no Firebase environment variables.
const proc=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3101'],{stdio:['ignore','pipe','pipe']});
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Startup timeout')),15000);proc.stdout.on('data',b=>{if(b.toString().includes('Ready')){clearTimeout(timer);resolve();}});proc.on('exit',code=>{clearTimeout(timer);reject(Error('Server exit '+code));});});
 const base='http://127.0.0.1:3101';
 for(const [path,method] of [['content','GET'],['content','PUT'],['upload','POST'],['services','PUT']]){const r=await fetch(`${base}/api/admin/${path}`,{method});assert.equal(r.status,401);console.log(`${method} /api/admin/${path}: 401 PASS`);}
 const r=await fetch(base+'/api/content');assert.equal(r.status,200);const data=await r.json();assert.equal(data.products.length,0);assert.equal(data.team.length,2);assert.equal(data.gallery.length,18);console.log('Public original content, no sample products: PASS');
 for(const path of ['/','/produkte','/admin/produkte']){assert.equal((await fetch(base+path)).status,200);console.log(path+': HTTP 200 PASS');}
}finally{proc.kill();}
