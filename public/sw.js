/*
 * A deliberately small service worker.
 *
 * The goal is not offline-first cleverness: it is that somebody who loaded this
 * site once, in a place where the network keeps dropping, can still open it and
 * still reach the SOS form. Anything it cannot serve, it simply lets through.
 */
const VERSION = 'v1';
const SHELL = `flood-relief-shell-${VERSION}`;
const PAGES = `flood-relief-pages-${VERSION}`;

self.addEventListener('install', (event) => {
  // Take over as soon as the new build lands; a stale relief site helps nobody.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.endsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never touch form submissions or the Google Sheets reads: those must be live,
  // and a cached "success" for an SOS would be dangerous.
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, PAGES));
    return;
  }

  const dest = request.destination;
  if (dest === 'script' || dest === 'style' || dest === 'font' || dest === 'image') {
    event.respondWith(cacheFirst(request, SHELL));
  }
});

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}
