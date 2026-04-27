const CACHE_NAME = 'bandit-crossword-v2';

// Install event: Caches the basic application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png',
        // Note: The service worker will dynamically cache Vite's JS/CSS files as they load
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event: Cleans up old caches when updating the app
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-first, falling back to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached asset if found immediately (great for offline)
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch from the network
      return fetch(event.request).then((networkResponse) => {
        // Check if we received a valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Dynamically cache new files (like Vite's compiled JS/CSS) for the next offline session
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Only cache our own assets and the Three.js library
          if (event.request.url.startsWith(self.location.origin) || event.request.url.includes('three.min.js')) {
            cache.put(event.request, responseToCache);
          }
        });

        return networkResponse;
      });
    }).catch(() => {
      // If both cache and network fail (offline and not cached), we gracefully fail
      console.log('Offline: Asset not found in cache.');
    })
  );
});
