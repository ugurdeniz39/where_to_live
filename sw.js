// AstroMap Service Worker v5 — Network-first for fresh deploys
const CACHE_NAME = 'astromap-v5';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/cities-database.js',
    '/astro-engine.js',
    '/manifest.json'
];

const EXTERNAL_ASSETS = [
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://html2canvas.hertzen.com/dist/html2canvas.min.js'
];

// Install — cache static assets & activate immediately
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('SW: Some assets failed to cache', err);
                return Promise.allSettled(
                    STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
                );
            });
        })
    );
    self.skipWaiting();
});

// Activate — clean ALL old caches, claim clients immediately
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch — Network-first for everything (fresh content on every load)
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // API requests — network only
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(r => r)
                .catch(() => new Response(
                    JSON.stringify({ error: 'Çevrimdışısınız. İnternet bağlantınızı kontrol edin.' }),
                    { status: 503, headers: { 'Content-Type': 'application/json' } }
                ))
        );
        return;
    }

    // Everything else — network first, cache fallback
    event.respondWith(
        fetch(event.request).then(response => {
            if (response.ok && event.request.method === 'GET') {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
        }).catch(() => {
            return caches.match(event.request).then(cached => {
                if (cached) return cached;
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                return new Response('Offline', { status: 503 });
            });
        })
    );
});

// Accept skip-waiting messages from client
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
