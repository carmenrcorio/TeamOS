/* TeamOS Service Worker — v2.4.0
 * Network-first with cache fallback. Cache is updated on every successful
 * GET so it always reflects the last known good state. If the network is
 * slow (>3s) or fails, the cache is served instead — the CSM always sees
 * their last session rather than a blank screen.
 */

const CACHE_NAME = 'teamos-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(networkFirst(event.request));
});

function networkFirst(req) {
  return new Promise((resolve) => {
    let settled = false;
    const fallback = () => {
      if (settled) return;
      settled = true;
      caches.match(req).then((cached) => {
        resolve(cached || new Response('Offline', {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'text/plain' }
        }));
      });
    };
    const timer = setTimeout(fallback, 3000);

    fetch(req).then((res) => {
      if (settled) return;
      clearTimeout(timer);
      settled = true;
      // Update cache with a clone of successful or opaque responses.
      if (res && (res.ok || res.type === 'opaque')) {
        try {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
        } catch (_) { /* clone failed — ignore, response still resolves */ }
      }
      resolve(res);
    }).catch(() => {
      clearTimeout(timer);
      fallback();
    });
  });
}
