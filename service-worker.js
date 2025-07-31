const CACHE_NAME = 'arbo-editor-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/codicon/0.0.8/codicon.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js',
  'https://unpkg.com/monaco-editor@0.52.0/min/vs/editor/editor.main.js',
  'https://unpkg.com/monaco-editor@0.52.0/min/vs/base/worker/workerMain.js',
  // Add other Monaco Editor worker scripts as needed, e.g., for specific languages
  // For example, if you want full JS/TS language support offline:
  'https://unpkg.com/monaco-editor@0.52.0/min/vs/language/typescript/ts.worker.js',
  'https://unpkg.com/monaco-editor@0.52.0/min/vs/language/json/json.worker.js',
  'https://unpkg.com/monaco-editor@0.52.0/min/vs/language/html/html.worker.js',
  'https://unpkg.com/monaco-editor@0.52.0/min/vs/language/css/css.worker.js',
  'https://unpkg.com/monaco-editor@0.52.0/min/vs/editor/editor.worker.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and can only be consumed once. We must clone it so that
            // we can send one to the browser and one to the cache.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
