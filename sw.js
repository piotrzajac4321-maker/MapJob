// MapJob Service Worker
// Strategie:
//   - navigate  (HTML): network-first z fallbackiem do cache i '/'
//   - same-origin static / fonty / leaflet CSS: stale-while-revalidate
//   - Supabase / Stripe / OSM tiles / Nominatim: zawsze network (bez cache)
//   - push + notificationclick: standardowe

const VERSION = 'v2026-05-30-reset-all-filters';
const CACHE_STATIC = 'mapjob-static-' + VERSION;
const CACHE_RUNTIME = 'mapjob-runtime-' + VERSION;

const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

const NEVER_CACHE_HOSTS = [
  'supabase.co',
  'stripe.com',
  'api.stripe.com',
  'hooks.stripe.com',
  'nominatim.openstreetmap.org',
  'tile.openstreetmap.org',
  'basemaps.cartocdn.com',
  'api.resend.com',
  'api.smsapi.pl',
];

const ALLOW_RUNTIME_CACHE_HOSTS = [
  self.location.hostname,
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'esm.sh',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => cache.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_STATIC && k !== CACHE_RUNTIME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  if (NEVER_CACHE_HOSTS.some((h) => url.hostname.endsWith(h))) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_STATIC).then((c) => c.put('/', clone)).catch(() => {});
        return res;
      }).catch(() => caches.match('/').then((c) => c || caches.match('/index.html')))
    );
    return;
  }

  const canCache = ALLOW_RUNTIME_CACHE_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith('.' + h));
  if (!canCache) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((res) => {
        if (res && res.ok && (res.type === 'basic' || res.type === 'cors')) {
          const clone = res.clone();
          caches.open(CACHE_RUNTIME).then((c) => c.put(req, clone)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (_) {
    try { payload = { title: 'MapJob', body: event.data.text() }; } catch (__) {}
  }
  const title = payload.title || 'MapJob';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/icon-192.png',
    tag: payload.tag || 'mapjob',
    renotify: !!payload.renotify,
    data: payload.data || { url: payload.url || '/' },
    actions: payload.actions || [],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        try {
          const u = new URL(client.url);
          if (u.origin === self.location.origin) {
            client.focus();
            if ('navigate' in client) client.navigate(target);
            return;
          }
        } catch (_) {}
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
