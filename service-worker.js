const CACHE_NAME = 'f1-column-maker-v2';
const APP_ROOT = new URL('./', self.location.href);
const APP_URL = APP_ROOT.href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll([APP_URL, new URL('index.html', APP_ROOT).href, new URL('manifest.webmanifest', APP_ROOT).href, new URL('icon.svg', APP_ROOT).href])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('f1-column-maker-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_ROOT.pathname)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(APP_URL, copy)); }
      return response;
    }).catch(() => caches.match(APP_URL)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
