// Service Worker for PWA offline support
const CACHE_NAME = 'investment-app-v1'
const STATIC_CACHE = 'investment-static-v1'

// Static assets to cache immediately
const staticAssets = [
  '/',
  '/manifest.json',
]

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(staticAssets).catch((err) => {
          console.log('Service Worker: Some files failed to cache', err)
        })
      }),
      // Check if this is the first install (no active clients)
      // If there are active clients, don't skip waiting (wait for user confirmation)
      self.clients.matchAll().then((clients) => {
        // Only skip waiting if this is the first install
        if (clients.length === 0) {
          return self.skipWaiting()
        }
        // Otherwise, the service worker will wait until SKIP_WAITING message is received
      })
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// Listen for skip waiting message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Fetch event - Network first, fallback to cache for offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return
  }

  // API requests - Network only (require online connection)
  if (event.request.url.includes('/api/')) {
    return fetch(event.request).catch(() => {
      // Return a simple JSON error response for offline API calls
      return new Response(
        JSON.stringify({ error: 'Offline: This action requires internet connection' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    })
  }

  // Static assets and pages - Cache first, network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      // Not in cache, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Cache successful responses
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // If offline and it's a page request, return cached homepage
          if (event.request.destination === 'document') {
            return caches.match('/').then((homepage) => {
              return homepage || new Response('Offline - Please check your connection', {
                status: 503,
                headers: { 'Content-Type': 'text/html' },
              })
            })
          }
        })
    })
  )
})
