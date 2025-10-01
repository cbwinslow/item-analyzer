const CACHE_NAME = 'item-analyzer-v1';
const urlsToCache = [
  '/',
  '/_next/static/css/styles.css',
  '/_next/static/js/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});