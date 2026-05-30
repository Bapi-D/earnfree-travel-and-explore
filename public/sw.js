const CACHE_NAME = 'earnfree-static-v1';
const ASSETS = ['/', '/index.html', '/styles.css'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {}),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        // If this is a Firebase Storage request, rewrite to the local admin storage proxy to avoid CORS in development
        try {
          const url = new URL(event.request.url);
          if (url.hostname && url.hostname.includes('firebasestorage.googleapis.com')) {
            // prefer ?name= param
            const name = url.searchParams.get('name') || (url.pathname.match(/\/o\/(.+)$/) ? decodeURIComponent(url.pathname.match(/\/o\/(.+)$/)[1]) : null);
            if (name) {
              const proxyUrl = `/__admin/storage?name=${encodeURIComponent(name)}`;
              return fetch(proxyUrl);
            }
          }
        } catch (err) {
          // fallthrough to normal handling
        }

        const cached = await caches.match(event.request);
        if (cached) return cached;
        // clone because Request objects with a body can only be used once
        const req = event.request.clone();
        return await fetch(req);
      } catch (err) {
        try {
          // final attempt without cloning
          return await fetch(event.request);
        } catch (e) {
          return new Response(null, { status: 502 });
        }
      }
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))),
  );
});
