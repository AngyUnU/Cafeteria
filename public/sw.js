const CACHE_NAME = 'cafe-de-barrio-v8';
const APP_SHELL = [
    '/',
    '/offline.html',
    '/manifest.json',
    '/cafeteria.css',
    '/cafeteria.js',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => Promise.all(APP_SHELL.map(async (resource) => {
                const url = new URL(resource, self.location.origin);
                url.searchParams.set('__precache', CACHE_NAME);
                const response = await fetch(url, { cache: 'reload' });

                if (!response.ok) {
                    throw new Error(`No se pudo precargar ${resource}: ${response.status}`);
                }

                await cache.put(new URL(resource, self.location.origin), response);
            })))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName.startsWith('cafe-de-barrio-') && cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName)),
            ))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const requestUrl = new URL(request.url);

    if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

    if (requestUrl.pathname === '/csrf-token') {
        event.respondWith(fetch(request));
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;

                return fetch(request).catch((error) => {
                    if (request.mode === 'navigate') {
                        return caches.match('/offline.html').then((offlinePage) => {
                            if (offlinePage) return offlinePage;
                            throw error;
                        });
                    }

                    throw error;
                });
            }),
    );
});
