const CACHE_NAME = 'cafe-cache-first-v1';
const APP_SHELL = [
    '/',
    '/manifest.json',
    '/cafeteria.css',
    '/cafeteria.js',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                for (const resource of APP_SHELL) {
                    const response = await fetch(resource, { cache: 'reload' });
                    if (!response.ok) {
                        throw new Error(`No se pudo precargar ${resource}: ${response.status}`);
                    }
                    await cache.put(resource, response);
                }
            })
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((names) => Promise.all(
                names
                    .filter((name) => name.startsWith('cafe-cache-first-') && name !== CACHE_NAME)
                    .map((name) => caches.delete(name)),
            ))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname === '/csrf-token') {
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => cachedResponse || fetch(request)),
    );
});
