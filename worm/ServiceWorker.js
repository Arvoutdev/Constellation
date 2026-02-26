const cacheName = "zgames-worm-1.1"; // Increment this to force an update
const contentToCache = [
    "./", // Cache the root/index file
    "Build/worm.loader.js",
    "Build/worm.framework.js.unityweb",
    "Build/worm.data.unityweb",
    "Build/worm.wasm.unityweb",
    "TemplateData/style.css"
];

// 1. Install Event - Sets up the initial cache
self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    // Forces the waiting service worker to become the active service worker.
    self.skipWaiting(); 
    
    e.waitUntil((async () => {
        const cache = await caches.open(cacheName);
        console.log('[Service Worker] Caching app shell');
        await cache.addAll(contentToCache);
    })());
});

// 2. Activate Event - THE FIX: This deletes old versions
self.addEventListener('activate', (e) => {
    console.log('[Service Worker] Activate');
    e.waitUntil((async () => {
        const keyList = await caches.keys();
        await Promise.all(keyList.map((key) => {
            if (key !== cacheName) {
                console.log(`[Service Worker] Removing old cache: ${key}`);
                return caches.delete(key);
            }
        }));
        // Ensures that updates to the service worker take effect immediately
        return self.clients.claim();
    })());
});

// 3. Fetch Event - Strategy: Cache First, then Network
self.addEventListener('fetch', (e) => {
    e.respondWith((async () => {
        const r = await caches.match(e.request);
        console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
        if (r) return r;

        const response = await fetch(e.request);
        const cache = await caches.open(cacheName);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
    })());
});