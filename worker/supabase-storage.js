export function createStorage(env,app){
 if(!env.SUPABASE_DATA_URL||!env.SUPABASE_SITE_TOKEN||!env.SUPABASE_ANON_JWT)return env.BUCKET;
 const old=env.BUCKET;
 async function call(body){const r=await fetch(env.SUPABASE_DATA_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+env.SUPABASE_ANON_JWT,'x-site-app':app,'x-site-token':env.SUPABASE_SITE_TOKEN},body:JSON.stringify(body)});if(!r.ok)throw Error('Supabase storage unavailable');return await r.json()}
 async function importOld(){const key='migration/r2-v1';if((await call({op:'get',key})).data)return;let cursor;do{const page=await old.list({limit:1000,cursor});for(const o of page.objects){if(!o.key.startsWith(app==='bestmember'?'submissions/':'confirmations/')&&!(app==='bestmember'&&o.key.startsWith('reviewed/')))continue;const v=await old.get(o.key);if(v)await call({op:'put',key:o.key,data:await v.json(),ignore:true})}cursor=page.truncated?page.cursor:undefined}while(cursor);await call({op:'put',key,data:{completedAt:new Date().toISOString()},ignore:true})}
 return {
 async get(key){let data=(await call({op:'get',key})).data;if(data===null){const v=await old.get(key);if(!v)return null;data=await v.json();await call({op:'put',key,data,ignore:true});data=(await call({op:'get',key})).data}return data===null?null:{json:async()=>data}},
 async put(key,value,options={}){return await call({op:'put',key,data:JSON.parse(value),ignore:options.onlyIf?.etagDoesNotMatch==='*'})},
 async list(options={}){await importOld();return await call({op:'list',prefix:options.prefix,limit:options.limit,cursor:options.cursor})}
 };
}
