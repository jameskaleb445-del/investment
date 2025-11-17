// Service Worker for PWA offline support
// Update version to force cache refresh
const CACHE_NAME = 'investment-app-v2'
const STATIC_CACHE = 'investment-static-v2'

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
          // Delete ALL old caches to force fresh fetch
          if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
          // Also delete current cache if version changed
          if (cacheName === 'investment-app-v1' || cacheName === 'investment-static-v1') {
            console.log('Service Worker: Deleting old version cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      // Force claim all clients
      return self.clients.claim()
    })
  )
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

  // API requests - Network only (require online connection, NEVER cache)
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/auth/') ||
      event.request.url.includes('/callback')) {
    // Always fetch fresh, never cache API or auth routes
    return fetch(event.request, { cache: 'no-store' }).catch(() => {
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

  // Static assets and pages - Network first, cache fallback (for fresh updates)
  event.respondWith(
    fetch(event.request, { cache: 'no-store' }).then((response) => {
      // If network succeeds, update cache
      if (response && response.status === 200) {
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })
      }
      return response
    }).catch(() => {
      // Network failed, try cache
      return caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        // If no cache, return offline message
        if (event.request.destination === 'document') {
          return new Response('Offline - Please check your connection', {
            status: 503,
            headers: { 'Content-Type': 'text/html' },
          })
        }
        throw new Error('No cache available')
      })
    })
  )
})
