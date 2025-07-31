// service-worker.js

const CACHE_NAME = 'my-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  '/images/logo.png'
];

// Install event: Caching essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: Serving assets from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and can only be consumed once. We consume it once to cache it,
            // and once the browser consumes it.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activate event: Cleaning up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Optional: Push notifications (example)
self.addEventListener('push', (event) => {
  const title = 'Push Notification';
  const options = {
    body: event.data.text(),
    icon: '/images/logo.png',
    badge: '/images/badge.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Optional: Sync event (example for background sync)
self.addEventListener('sync', (event) => {
  if (event.tag === 'my-data-sync') {
    console.log('Background sync triggered for my-data-sync');
    // Perform background data synchronization here
    // event.waitUntil(doSomeDataSynchronization());
  }
});
