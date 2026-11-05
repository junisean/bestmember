const EXPECTED={"bestmember":"f2743422c91c07501b44d5b5168fecec1d367f19a5b7322f602282ed0ea3da0d","bestfirstday":"d831a55356cd43780f51fa6df13761264b713b9eaf25845efb176f4fc79de7dd"};
const response=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
Deno.serve(async req=>{try{
 if(req.method!=="POST")return response({error:"Method not allowed"},405);
 const app=req.headers.get("x-site-app")||"";const secret=req.headers.get("x-site-token")||"";
 if(!EXPECTED[app]||!secret)return response({error:"Unauthorized"},401);
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(secret)))).map(b=>b.toString(16).padStart(2,"0")).join("");
 if(digest!==EXPECTED[app])return response({error:"Unauthorized"},401);
 const raw=await req.text();if(raw.length>3000000)return response({error:"Too large"},413);
 const d=JSON.parse(raw);const allowed=app==="bestmember"?["submissions/","reviewed/","migration/"]:["confirmations/","migration/"];
 const table=app==="bestmember"?"bestmember_records":"bestfirstday_records";
 let key="";if(d.op!=="list"){key=d.key;if(typeof key!=="string"||key.length>256||!allowed.some(p=>key.startsWith(p)))return response({error:"Invalid key"},400)}
 let secretKeys={};try{secretKeys=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}")}catch{}
 const apiKey=secretKeys.default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");if(!apiKey)throw Error("Database credentials unavailable");
 const base=Deno.env.get("SUPABASE_URL")+"/rest/v1/"+table;
 const headers={"apikey":apiKey,"Content-Type":"application/json"};if(!apiKey.startsWith("sb_secret_"))headers.Authorization="Bearer "+apiKey;
 const call=async(url,options={})=>{const r=await fetch(url,{...options,headers:{...headers,...options.headers}});if(!r.ok)throw Error("Database operation failed");const text=await r.text();return text?JSON.parse(text):null};
 if(d.op==="get"){const rows=await call(base+"?select=data&object_key=eq."+encodeURIComponent(key)+"&limit=1");return response({data:rows[0]?.data??null})}
 if(d.op==="put"){if(!d.data||typeof d.data!=="object"||Array.isArray(d.data))return response({error:"Invalid record"},400);await call(base+"?on_conflict=object_key",{method:"POST",headers:{Prefer:"resolution="+(d.ignore?"ignore-duplicates":"merge-duplicates")+",return=minimal"},body:JSON.stringify({object_key:key,data:d.data})});return response({ok:true})}
 if(d.op==="list"){if(!allowed.includes(d.prefix)||typeof(d.cursor||"")!=="string")return response({error:"Invalid prefix"},400);const limit=Math.min(Math.max(Number(d.limit)||20,1),1000);let url=base+"?select=object_key&order=object_key.asc&object_key=like."+encodeURIComponent(d.prefix+"*")+"&limit="+(limit+1);if(d.cursor)url+="&object_key=gt."+encodeURIComponent(d.cursor);const rows=await call(url),truncated=rows.length>limit,keys=rows.slice(0,limit).map(r=>r.object_key);return response({objects:keys.map(key=>({key})),truncated,cursor:truncated?keys[keys.length-1]:null})}
 return response({error:"Invalid operation"},400);
}catch{return response({error:"Database unavailable"},503)}});