const CACHE='gonzalo-fit-ipad-v1';
const ASSETS=['./','./index.html','./ipad.css','./ipad.js','./manifest.json','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('gonzalo-fit-ipad-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).catch(()=>caches.match(new URL('./index.html',self.registration.scope).href)));return;
  }
  if(!ASSETS.some(p=>new URL(p,self.registration.scope).href===url.href))return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
