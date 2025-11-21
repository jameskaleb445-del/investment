// Service Worker for PWA offline support
// This file version changes on each deploy to trigger updates
const CACHE_VERSION = 'v2.5.1'
const CACHE_NAME = `investment-app-${CACHE_VERSION}`
const STATIC_CACHE = `investment-static-${CACHE_VERSION}`

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
        console.log('Service Worker: Installing and caching static files')
        return cache.addAll(staticAssets).catch((err) => {
          console.log('Service Worker: Some files failed to cache', err)
        })
      }),
      // Check if this is the first install (no active clients)
      // If there are active clients, don't skip waiting (wait for user confirmation)
      self.clients.matchAll().then((clients) => {
        // Only skip waiting if this is the first install
        if (clients.length === 0) {
          console.log('Service Worker: First install, skipping waiting')
          return self.skipWaiting()
        }
        console.log('Service Worker: Waiting for user confirmation to update')
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
          // Delete ALL old caches that don't match current version
          if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      // Don't auto-claim clients - wait for user to click "Update"
      // This prevents automatic updates without user interaction
      console.log('Service Worker: Activated, waiting for user confirmation to take control')
      // clients.claim() will be called after skipWaiting() is triggered by user action
    })
  )
})

// Listen for skip waiting message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Received SKIP_WAITING message - user clicked update')
    // Skip waiting and claim clients only when user explicitly requests update
    self.skipWaiting().then(() => {
      // Claim clients after skipWaiting completes
      return self.clients.claim()
    }).then(() => {
      console.log('Service Worker: Took control after user confirmation')
    })
  }
})

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received', event)

  let notificationData = {
    title: 'Notification',
    body: 'You have a new notification',
    icon: '/logos/PORFIT_B.png',
    badge: '/logos/PORFIT_B.png',
    data: {},
  }

  // Try to parse push data
  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || {},
        tag: data.tag || data.id,
        requireInteraction: data.requireInteraction || false,
      }
    } catch (e) {
      // If not JSON, try as text
      const text = event.data.text()
      if (text) {
        notificationData.body = text
      }
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      vibrate: [200, 100, 200],
    })
  )
})

// Notification click event - Handle user clicking on notification
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event)

  event.notification.close()

  const notificationData = event.notification.data || {}
  let url = '/'

  // Determine URL based on notification data
  if (notificationData.transaction_id) {
    url = '/wallet'
  } else if (notificationData.project_id) {
    url = '/marketplace'
  } else if (notificationData.investment_id) {
    url = '/'
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }

      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
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
