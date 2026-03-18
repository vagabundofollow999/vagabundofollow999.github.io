const CACHE_NAME = "tisports-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "https://cdn.jsdelivr.net/npm/shaka-player@4.14.10/dist/controls.min.css",
  "https://fonts.googleapis.com/css?family=Material+Icons+Sharp",
  "https://cdn.jsdelivr.net/gh/ZheHacK/fypnews.id@main/css/youtube-theme.css",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js",
  "https://cdn.jsdelivr.net/npm/shaka-player@4.14.10/dist/shaka-player.ui.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
    .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const url = event.request.url;

  if(url.endsWith(".mpd")) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      if(event.request.destination === "document") return caches.match("./index.html");
    })
  );
});