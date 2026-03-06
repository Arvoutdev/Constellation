const cacheName = "zgames-worm-v1.9";
const contentToCache = [
    "index.html",
    "Build/worm.loader.js",
    "Build/worm.framework.js.unityweb",
    "Build/worm.data.unityweb",
    "Build/worm.wasm.unityweb",
    "TemplateData/style.css"
];

self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log('[Service Worker] Caching app shell');
            return cache.addAll(contentToCache);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== cacheName) {
                    console.log(`[Service Worker] Removing old cache: ${key}`);
                    return caches.delete(key);
                }
            }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request).then((networkResponse) => {
                return caches.open(cacheName).then((cache) => {
                    if (e.request.method === 'GET' && networkResponse.status === 200) {
                        cache.put(e.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        })
    );
});
