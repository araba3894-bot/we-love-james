/* Neo Velvet City — service worker (network-first HTML, bustable cache) */
const CACHE_VERSION = 'nvc-v62-no-kennel-label';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './pwa.js',
  './sw.js',
  './icons/favicon-32.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './assets/yifan-signature-frame.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      Promise.all(
        APP_SHELL.map((url) =>
          cache.add(url).catch(() => {
            /* Optional assets should not block install. */
          }),
        ),
      ),
    ).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isNavigationRequest(request) {
  return request.mode === 'navigate'
    || (request.method === 'GET'
      && request.headers.get('accept')
      && request.headers.get('accept').includes('text/html'));
}

function isAppHtmlRequest(url) {
  const path = url.pathname;
  return path.endsWith('/')
    || path.endsWith('/index.html')
    || path.endsWith('index.html');
}

function isCriticalScript(url) {
  const path = url.pathname;
  return path.endsWith('/pwa.js')
    || path.endsWith('/sw.js')
    || path.endsWith('pwa.js')
    || path.endsWith('sw.js');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML + bootstrap scripts: network-first so local/PWA picks up new builds.
  if (isNavigationRequest(request) || isAppHtmlRequest(url) || isCriticalScript(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            const cacheKey = isAppHtmlRequest(url) || isNavigationRequest(request)
              ? './index.html'
              : request;
            caches.open(CACHE_VERSION).then((cache) => cache.put(cacheKey, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) =>
            cached
              || caches.match('./index.html').then((html) => html || caches.match('./')),
          ),
        ),
    );
    return;
  }

  // Other same-origin assets: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    }),
  );
});
