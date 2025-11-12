// service-worker.js for /JandMBailey/
// Cache-first for app shell; network fallback for everything else
const CACHE_NAME = 'jandmbailey-pwa-v1';
const ASSETS = [
  "/JandMBailey/",
  "/JandMBailey/index.html",
  "/JandMBailey/assets/style.css",
  "/JandMBailey/assets/icons/icon-192.png",
  "/JandMBailey/assets/icons/icon-512.png",
  "/JandMBailey/assets/icons/icon-192-maskable.png",
  "/JandMBailey/assets/icons/icon-512-maskable.png"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k === CACHE_NAME ? null : caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // Only handle GET
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        // Optionally cache same-origin navigations/assets
        try {
          const url = new URL(req.url);
          const sameOrigin = self.location.origin === url.origin;
          if (sameOrigin && (req.mode === 'navigate' || req.destination === 'style' || req.destination === 'script' || req.destination === 'image')) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
          }
        } catch (e) {}
        return res;
      }).catch(() => caches.match("/JandMBailey/index.html"));
    })
  );
});
