// Pages Function. Uses approximate Cloudflare network location, not GPS.
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});}
export async function onRequestGet({request,env,waitUntil}){
 if(env.OPENWEATHER_FREE_CONFIRMED!=="true"||!env.OPENWEATHER_API_KEY)return json({available:false},503);
 const cf=request.cf||{};
 if(cf.latitude==null||cf.longitude==null)return json({available:false},503);
 const lat=Number(cf.latitude),lon=Number(cf.longitude);
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return json({available:false},503);
 // Coarse area cache; no IP address or API key stored in the cache key.
 const y=lat.toFixed(1),x=lon.toFixed(1);
 const key=new Request(new URL("/api/weather-cache/"+y+"/"+x,request.url));
 const cache=globalThis.caches?.default;
 try{
  const hit=await cache?.match(key);if(hit)return json(await hit.json());
 }catch{}
 try{
  const query=new URLSearchParams({lat:y,lon:x,units:"imperial",appid:env.OPENWEATHER_API_KEY});
  const get=async path=>{const r=await fetch("https://api.openweathermap.org/data/2.5/"+path+"?"+query,{signal:AbortSignal.timeout(7000)});return r.ok?await r.json():null;};
  const current=await get("weather");
  if(!current||!Number.isFinite(current.main?.temp)||!Number.isFinite(current.main?.humidity)||!Number.isFinite(current.wind?.speed))return json({available:false},503);
  let forecast=null;try{forecast=await get("forecast");}catch{}
  const now=Date.now()/1000;
  const temps=(Array.isArray(forecast?.list)?forecast.list:[]).filter(v=>v.dt>=now&&v.dt<=now+86400&&Number.isFinite(v.main?.temp)).map(v=>v.main.temp);
  const data={available:true,location:[cf.city||current.name,cf.region||cf.country].filter(Boolean).join(", "),temp:current.main.temp,humidity:current.main.humidity,wind:current.wind.speed,description:String(current.weather?.[0]?.description||"Current conditions"),high:temps.length>=6?Math.max(...temps):null,low:temps.length>=6?Math.min(...temps):null};
  if(cache){const entry=new Response(JSON.stringify(data),{headers:{"Content-Type":"application/json","Cache-Control":"public,max-age=600"}});waitUntil(cache.put(key,entry).catch(()=>{}));}
  return json(data);
 }catch{return json({available:false},503);}
}
