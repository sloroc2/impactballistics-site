import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";
import {onRequestGet} from "../functions/api/local-weather.js";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("Connected services assets and navigation",()=>{const html=read("services/index.html");for(const file of ["services/services.css","services/weather.js"]) {assert.ok(html.includes("/"+file));assert.ok(read(file).length);}assert.ok(read("header.js").includes('href="/services/"'));assert.ok(read("index.html").includes('href="/services/"'));assert.ok(html.includes("https://ai.impactballisticsapp.com/"));new Script(read("header.js"));new Script(read("services/weather.js"));});
test("Weather does not call provider before free-plan confirmation or with missing coordinates",async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;throw Error("Unexpected provider request");};
 try{
 const request=new Request("https://example.com/api/local-weather");
 const configured={OPENWEATHER_API_KEY:"test-secret",OPENWEATHER_FREE_CONFIRMED:"true"};
 for(const env of [{},{OPENWEATHER_API_KEY:"test-secret"},configured]){
 const r=await onRequestGet({request,env});assert.equal(r.status,503);assert.deepEqual(await r.json(),{available:false});
 }
 const located=new Request("https://example.com/api/local-weather?mode=zip&zip=62849");
 const blocked=await onRequestGet({request:located,env:{OPENWEATHER_API_KEY:"test-secret"}});
 assert.equal(blocked.status,503);assert.deepEqual(await blocked.json(),{available:false});
 const gps=await onRequestGet({request:new Request("https://example.com/api/local-weather?mode=gps"),env:configured});
 assert.equal(gps.status,400);assert.deepEqual(await gps.json(),{available:false,error:"Location unavailable."});
 assert.equal(calls,0);
 }finally{globalThis.fetch=original;}
});
test("Weather returns coarse-location conditions without exposing credentials",async()=>{const original=globalThis.fetch;const urls=[];globalThis.fetch=async url=>{urls.push(new URL(url));return Response.json(url.includes("/forecast?")?{list:Array.from({length:8},(_,i)=>({dt:Date.now()/1000+i*10800+60,main:{temp:40+i}}))}:{main:{temp:44,humidity:50},wind:{speed:6},weather:[{description:"clear"}],name:"Example"});};try{const request=new Request("https://example.com/api/local-weather");Object.defineProperty(request,"cf",{value:{latitude:"38.713",longitude:"-88.913",city:"Example",region:"Illinois"}});const r=await onRequestGet({request,env:{OPENWEATHER_API_KEY:"test-secret",OPENWEATHER_FREE_CONFIRMED:"true"},waitUntil(){}});const d=await r.json();assert.equal(r.status,200);assert.equal(d.temp,44);assert.equal(d.high,47);assert.equal(d.low,40);assert.equal(urls.length,2);assert.equal(urls[0].searchParams.get("lat"),"38.7");assert.ok(!JSON.stringify(d).includes("test-secret"));}finally{globalThis.fetch=original;}});

test("ZIP and device modes override network location, reject invalid input, and never expose the key",async()=>{
 const original=globalThis.fetch;const urls=[];globalThis.fetch=async url=>{urls.push(new URL(url));return Response.json(url.includes("/forecast?")?{list:[]}:{main:{temp:44,humidity:50},wind:{speed:6},weather:[{description:"clear"}],name:"Local town",sys:{country:"US"}});};
 const env={OPENWEATHER_API_KEY:"test-secret",OPENWEATHER_FREE_CONFIRMED:"true"};
 const invoke=async q=>{const request=new Request("https://example.com/api/local-weather?"+q);Object.defineProperty(request,"cf",{value:{latitude:"39.1",longitude:"-94.6",city:"Kansas City",region:"Missouri"}});return onRequestGet({request,env,waitUntil(){}});};
 try{
 for(const q of ["mode=zip&zip=abc","mode=gps&lat=&lon=0","mode=gps&lat=91&lon=0","mode=unknown"]){assert.equal((await invoke(q)).status,400);}
 assert.equal(urls.length,0);
 const zip=await (await invoke("mode=zip&zip=62849")).json();assert.equal(zip.location,"Local town, US (62849)");assert.equal(zip.mode,"zip");assert.equal(urls[0].searchParams.get("zip"),"62849,US");assert.equal(urls[0].searchParams.has("lat"),false);
 const gps=await (await invoke("mode=gps&lat=38.72&lon=-88.91")).json();assert.equal(gps.location,"Local town, US");assert.equal(gps.mode,"gps");assert.equal(urls[2].searchParams.get("lat"),"38.7");assert.equal(urls[2].searchParams.get("lon"),"-88.9");assert.ok(!JSON.stringify(gps).includes("test-secret"));
 }finally{globalThis.fetch=original;}
});
test("All three weather location controls and persisted preference are present",()=>{const html=read("services/index.html"),js=read("services/weather.js");for(const id of ["weather-auto","weather-gps","weather-zip","weather-zip-form"])assert.ok(html.includes('id="'+id+'"'));assert.ok(js.includes("localStorage"));assert.ok(js.includes("getCurrentPosition"));new Script(js);});
