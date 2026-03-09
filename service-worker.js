const CACHE_NAME = "tigosports-cache";

/* ARCHIVOS QUE SE GUARDAN EN CACHE */

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json"
];

/* INSTALACION */

self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );

});

/* ACTIVACION */

self.addEventListener("activate", event => {

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );

  self.clients.claim();

});

/* FETCH */

self.addEventListener("fetch", event => {

  event.respondWith(

    fetch(event.request)
      .then(response => {

        const responseClone = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;

      })
      .catch(() => {
        return caches.match(event.request);
      })

  );

});