/* crisis-aid service worker — デプロイのたびに CACHE 版数を上げること（新SW認識のため） */
const CACHE='crisis-aid-v1.0.0';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      // cache:'reload' でHTTPキャッシュをバイパスし最新を取得
      return Promise.all(ASSETS.map(function(u){
        return fetch(new Request(u,{cache:'reload'})).then(function(r){ if(r && r.ok) return c.put(u,r); }).catch(function(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});
self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(ks){ return Promise.all(ks.map(function(k){ return k===CACHE?null:caches.delete(k); })); })
      .then(function(){ return self.clients.claim(); })
  );
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r || fetch(e.request).then(function(resp){
        try{ var copy=resp.clone(); caches.open(CACHE).then(function(c){ c.put(e.request,copy); }); }catch(x){}
        return resp;
      }).catch(function(){ return caches.match('./index.html'); });
    })
  );
});
