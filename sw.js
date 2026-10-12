// ドリームピクセルスタジオ Service Worker
// index.html / message.html は「ネット優先」（更新したらすぐ反映・オフラインでは保存分を使用）。
// 顔画像（jpg）は「保存分を先に表示→裏で更新」。
const VER='dps-v1';
const CORE=['./','index.html','message.html','event.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VER).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(/\.(jpe?g|png|webp)$/i.test(u.pathname)&&!/icon|apple-touch/.test(u.pathname)){
    e.respondWith(caches.open(VER).then(async c=>{
      const hit=await c.match(r);
      const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>hit);
      return hit||net;
    }));
    return;
  }
  e.respondWith(fetch(r).then(res=>{
    if(res&&res.ok){const cp=res.clone();caches.open(VER).then(c=>c.put(r,cp))}
    return res;
  }).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||(r.mode==='navigate'?caches.match('index.html'):Response.error()))));
});
