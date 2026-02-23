// AstroMap Service Worker v4
const CACHE_NAME = 'astromap-v4';
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

// Install — cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('SW: Some assets failed to cache', err);
                // Cache what we can
                return Promise.allSettled(
                    STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
                );
            });
        })
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch — Network first for API, Cache first for static
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // API requests — network only with timeout fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => response)
                .catch(() => new Response(
                    JSON.stringify({ error: 'Çevrimdışısınız. İnternet bağlantınızı kontrol edin.' }),
                    { status: 503, headers: { 'Content-Type': 'application/json' } }
                ))
        );
        return;
    }
    
    // Static assets — cache first, network fallback
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) {
                // Update cache in background
                fetch(event.request).then(response => {
                    if (response.ok) {
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
                    }
                }).catch(() => {});
                return cached;
            }
            
            return fetch(event.request).then(response => {
                // Cache successful responses
                if (response.ok && event.request.method === 'GET') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => {
                // Offline fallback for navigation
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                return new Response('Offline', { status: 503 });
            });
        })
    );
});

// Background sync for failed API requests
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
