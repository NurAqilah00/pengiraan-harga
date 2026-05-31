const CACHE = 'pengiraan-v1';
const FILES = [
    './Testing.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', function(e) {
    e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(FILES); }));
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE; })
                    .map(function(k) { return caches.delete(k); })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    // Network first for HTML — always gets latest version
    if (e.request.url.endsWith('.html') || e.request.url.endsWith('/')) {
        e.respondWith(
            fetch(e.request).then(function(response) {
                var copy = response.clone();
                caches.open(CACHE).then(function(c) { c.put(e.request, copy); });
                return response;
            }).catch(function() {
                return caches.match(e.request);
            })
        );
    } else {
        // Cache first for icons/manifest
        e.respondWith(
            caches.match(e.request).then(function(cached) {
                return cached || fetch(e.request);
            })
        );
    }
});
