// 家底 Service Worker —— 更新产品时把版本号 +1 即可强制刷新缓存
const CACHE='jiadi-v7';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  // HTML 走 network-first，保证用户拿到最新版本；离线时回退缓存
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(res){var cp=res.clone();caches.open(CACHE).then(function(c){c.put('./index.html',cp)});return res}).catch(function(){return caches.match('./index.html')||caches.match('./')}));
    return;
  }
  // 静态资源走 cache-first
  e.respondWith(caches.match(req).then(function(hit){return hit||fetch(req).then(function(res){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(req,cp)});return res})}));
});
