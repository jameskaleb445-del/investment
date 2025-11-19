'use client'

/**
 * Push Notification Service
 * Handles browser push notification registration and sending
 */

interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/**
 * Request push notification permission
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission === 'denied') {
    return 'denied'
  }

  const permission = await Notification.requestPermission()
  return permission
}

/**
 * Subscribe to push notifications
 * Returns subscription data to be sent to server
 */
export async function subscribeToPushNotifications(): Promise<PushSubscriptionData | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready

    if (!registration.pushManager) {
      console.warn('Push messaging is not supported')
      return null
    }

    // Request permission first
    const permission = await requestPushPermission()
    if (permission !== 'granted') {
      console.warn('Push notification permission denied')
      return null
    }

    // Get VAPID public key from server
    const response = await fetch('/api/push/vapid-public-key')
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Failed to get VAPID public key:', errorData.error || 'Unknown error')
      throw new Error(errorData.error || 'VAPID keys not configured')
    }

    const { publicKey, error } = await response.json()
    if (error || !publicKey) {
      console.error('VAPID public key not found:', error)
      throw new Error(error || 'VAPID keys not configured')
    }

    // Convert VAPID key to Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(publicKey)

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as unknown as BufferSource,
    })

    // Convert subscription to JSON
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
      },
    }

    return subscriptionData
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready

    if (!registration.pushManager) {
      return false
    }

    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
      return true
    }

    return false
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)
    return false
  }
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isSubscribedToPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready

    if (!registration.pushManager) {
      return false
    }

    const subscription = await registration.pushManager.getSubscription()
    return subscription !== null
  } catch (error) {
    console.error('Error checking push subscription:', error)
    return false
  }
}

/**
 * Send push notification (client-side test)
 * In production, notifications should be sent from server
 */
export async function sendPushNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted')
    return
  }

  // Send via service worker if available, otherwise use Notification API
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        ...options,
        icon: options?.icon || '/logos/PORFIT_B.png',
        badge: '/logos/PORFIT_B.png',
      })
      return
    } catch (error) {
      console.error('Error showing notification via service worker:', error)
    }
  }

  // Fallback to Notification API
  new Notification(title, {
    ...options,
    icon: options?.icon || '/logos/PORFIT_B.png',
    badge: '/logos/PORFIT_B.png',
  })
}

/**
 * Helper: Convert URL-safe base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

/**
 * Helper: Convert ArrayBuffer to base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

