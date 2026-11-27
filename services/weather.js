(()=>{
 const el=document.getElementById("local-weather");if(!el)return;
 const auto=document.getElementById("weather-auto"),gps=document.getElementById("weather-gps"),zip=document.getElementById("weather-zip"),form=document.getElementById("weather-zip-form");
 const storageKey="impact-weather-location-v2";let sequence=0,controller;
 function save(pref){try{localStorage.setItem(storageKey,JSON.stringify(pref));}catch{}}
 function restore(){try{const p=JSON.parse(localStorage.getItem(storageKey));if(p?.mode==="zip"&&/^[0-9]{5}$/.test(p.zip))return p;if(p?.mode==="gps")return {mode:"gps"};}catch{}return {mode:"auto"};}
 function select(mode){auto.setAttribute("aria-pressed",String(mode==="auto"));gps.setAttribute("aria-pressed",String(mode==="gps"));}
 function begin(mode){controller?.abort();controller=null;select(mode);el.textContent="Loading local conditions…";return ++sequence;}
 const line=(tag,text,cls)=>{const x=document.createElement(tag);x.textContent=text;if(cls)x.className=cls;return x;};
 async function load(pref,id){
  if(id!==sequence)return;
  controller=new AbortController();const params=new URLSearchParams(pref);
  try{
   const r=await fetch("/api/local-weather?"+params,{cache:"no-store",signal:controller.signal});const d=await r.json();
   if(id!==sequence)return;
   if(!r.ok||!d.available)throw Error(d.error||(pref.mode==="zip"?"Weather unavailable for this ZIP code. Check the ZIP or try again.":"Local weather is temporarily unavailable."));
   const details=line("div","","weather-details");details.append(line("span","Humidity "+d.humidity+"%"),line("span","Wind "+Math.round(d.wind)+" mph"));
   if(d.high!=null&&d.low!=null)details.append(line("span","Next 24h forecast: "+Math.round(d.high)+"° / "+Math.round(d.low)+"°F"));
   el.replaceChildren(line("div",d.location+" · "+({auto:"Automatic",gps:"Device location",zip:"ZIP code"}[pref.mode])),line("div",Math.round(d.temp)+"°F · "+d.description,"weather-current"),details);
   save(pref.mode==="gps"?{mode:"gps"}:pref);
  }catch(e){if(id===sequence&&e.name!=="AbortError")el.textContent=e.message||"Local weather is temporarily unavailable.";}
 }
 function automatic(){zip.value="";save({mode:"auto"});load({mode:"auto"},begin("auto"));}
 function device(){const id=begin("gps");el.textContent="Requesting device location…";if(!navigator.geolocation){el.textContent="Device location is unsupported. Enter a ZIP code or select Automatic.";return;}
 navigator.geolocation.getCurrentPosition(p=>{if(id!==sequence)return;load({mode:"gps",lat:p.coords.latitude.toFixed(1),lon:p.coords.longitude.toFixed(1)},id);},()=>{if(id===sequence)el.textContent="Device location unavailable or denied. Enter a ZIP code or select Automatic.";},{enableHighAccuracy:false,timeout:12000,maximumAge:300000});}
 auto.addEventListener("click",automatic);gps.addEventListener("click",device);
 form.addEventListener("submit",e=>{e.preventDefault();const value=zip.value.trim();if(!/^[0-9]{5}$/.test(value)){el.textContent="Enter a five-digit US ZIP code.";return;}load({mode:"zip",zip:value},begin("zip"));});
 const pref=restore();if(pref.mode==="zip"){zip.value=pref.zip;load(pref,begin("zip"));}else if(pref.mode==="gps"){device();}else{automatic();}
})();
