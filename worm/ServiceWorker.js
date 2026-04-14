const cacheName = "zgames-worm-V1.9"; // Current version
const contentToCache = [
    "Build/worm.loader.js",
    "Build/worm.framework.js.unityweb",
    "Build/worm.data.unityweb",
    "Build/worm.wasm.unityweb",
    "TemplateData/style.css"
];

// 1. INSTALL: Download the new files
self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    self.skipWaiting(); // Force this version to take over immediately
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      await cache.addAll(contentToCache);
    })());
});

// 2. ACTIVATE: The "Janitor" - Deletes V1.6, V1.7, etc.
self.addEventListener('activate', function (e) {
    console.log('[Service Worker] Activate - Cleaning up old caches');
    e.waitUntil((async function () {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(function (name) {
                // If the cache name isn't V1.9, delete it!
                if (name !== cacheName) {
                    console.log(`[Service Worker] Deleting old cache: ${name}`);
                    return caches.delete(name);
                }
            })
        );
        return self.clients.claim(); // Take control of the page immediately
    })());
});

// 3. FETCH: Serve from cache, otherwise download
self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      cache.put(e.request, response.clone());
      return response;
    })());
});
