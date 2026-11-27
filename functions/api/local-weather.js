// Pages Function. Automatic network region, voluntary rounded device location, or US ZIP.
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});}
export async function onRequestGet({request,env,waitUntil}){
 if(env.OPENWEATHER_FREE_CONFIRMED!=="true"||!env.OPENWEATHER_API_KEY)return json({available:false},503);
 const cf=request.cf||{};
 const params=new URL(request.url).searchParams;
 const mode=params.get("mode")||"auto";
 let locationQuery,label,keyPart;
 if(mode==="zip"){
  const zip=params.get("zip")||"";
  if(!/^[0-9]{5}$/.test(zip))return json({available:false,error:"Enter a valid five-digit US ZIP code."},400);
  locationQuery={zip:zip+",US"};label=zip;keyPart="zip/"+zip;
 }else if(mode==="auto"||mode==="gps"){
  const rawLat=mode==="gps"?params.get("lat"):cf.latitude;
  const rawLon=mode==="gps"?params.get("lon"):cf.longitude;
  if(rawLat==null||rawLon==null||String(rawLat).trim()===""||String(rawLon).trim()==="")return json({available:false,error:"Location unavailable."},mode==="gps"?400:503);
  const lat=Number(rawLat),lon=Number(rawLon);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return json({available:false,error:"Invalid location."},400);
  const y=lat.toFixed(1),x=lon.toFixed(1);
  locationQuery={lat:y,lon:x};keyPart=mode+"/"+y+"/"+x;
  label=mode==="auto"?[cf.city,cf.region||cf.country].filter(Boolean).join(", "):"";
 }else return json({available:false,error:"Invalid location mode."},400);
 const key=new Request(new URL("/api/weather-cache/"+keyPart,request.url));
 const cache=globalThis.caches?.default;
 try{
  const hit=await cache?.match(key);if(hit){const data=await hit.json();return json({...data,location:mode==="auto"&&label?label:data.location});}
 }catch{}
 try{
  const query=new URLSearchParams({...locationQuery,units:"imperial",appid:env.OPENWEATHER_API_KEY});
  const get=async path=>{const r=await fetch("https://api.openweathermap.org/data/2.5/"+path+"?"+query,{signal:AbortSignal.timeout(7000)});return r.ok?await r.json():null;};
  const current=await get("weather");
  if(!current||!Number.isFinite(current.main?.temp)||!Number.isFinite(current.main?.humidity)||!Number.isFinite(current.wind?.speed))return json({available:false},503);
  let forecast=null;try{forecast=await get("forecast");}catch{}
  const now=Date.now()/1000;
  const temps=(Array.isArray(forecast?.list)?forecast.list:[]).filter(v=>v.dt>=now&&v.dt<=now+86400&&Number.isFinite(v.main?.temp)).map(v=>v.main.temp);
  const data={available:true,location:mode==="auto"&&label?label:[current.name||label,current.sys?.country].filter(Boolean).join(", ")+(mode==="zip"?" ("+label+")":""),mode,temp:current.main.temp,humidity:current.main.humidity,wind:current.wind.speed,description:String(current.weather?.[0]?.description||"Current conditions"),high:temps.length>=6?Math.max(...temps):null,low:temps.length>=6?Math.min(...temps):null};
  if(cache){const entry=new Response(JSON.stringify(data),{headers:{"Content-Type":"application/json","Cache-Control":"public,max-age=600"}});waitUntil(cache.put(key,entry).catch(()=>{}));}
  return json(data);
 }catch{return json({available:false},503);}
}
