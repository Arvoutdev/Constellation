const cacheName = "agent0-Fusion Zero-z0.36";
const contentToCache = [
    "Build/nodetest.loader.js",
    "Build/nodetest.framework.js.unityweb",
    "Build/nodetest.data.unityweb",
    "Build/nodetest.wasm.unityweb",
    "TemplateData/style.css"
];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    self.skipWaiting();
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== cacheName) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      const response = await caches.match(e.request);
      if (response) { return response; }

      const networkResponse = await fetch(e.request);
      const cache = await caches.open(cacheName);
      cache.put(e.request, networkResponse.clone());
      return networkResponse;
    })());
});