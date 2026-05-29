const CACHE = 'mj-stats-v3'
const SHELL = ['/stats-widget.html', '/stats-widget.webmanifest', '/apple-touch-icon.png']

self.addEventListener('install', function(e) {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return Promise.all(SHELL.map(function(u) {
        return fetch(u, {cache:'reload'}).then(function(r) { return c.put(u, r) }).catch(function(){})
      }))
    })
  )
})

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k!==CACHE }).map(function(k){ return caches.delete(k) }))
    }).then(function(){ return self.clients.claim() })
  )
})

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('supabase.co')) return
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      // Serve from cache immediately, refresh in background
      if (cached) {
        fetch(e.request).then(function(r) {
          if (r && r.ok) caches.open(CACHE).then(function(c){ c.put(e.request, r) })
        }).catch(function(){})
        return cached
      }
      return fetch(e.request).then(function(r) {
        if (r && r.ok) {
          var clone = r.clone()
          caches.open(CACHE).then(function(c){ c.put(e.request, clone) })
        }
        return r
      })
    })
  )
})
