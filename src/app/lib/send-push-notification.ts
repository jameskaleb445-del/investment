'use server'

import { createClient } from '@/app/lib/supabase/server'
import * as webpush from 'web-push'

/**
 * Server-side function to send push notifications
 * This should be called when notifications are created in the database
 */

// Initialize web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:your-email@example.com'

function initializeWebPush() {
  if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)
  }
}

// Initialize on module load
initializeWebPush()

interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
  tag?: string
  requireInteraction?: boolean
}

/**
 * Send push notification to a specific user
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<void> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured. Push notifications disabled.')
    return
  }

  try {
    const supabase = await createClient()

    // Get all push subscriptions for the user
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching push subscriptions:', error)
      return
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for user:', userId)
      return
    }

    // Send notification to all subscriptions for this user
    const notificationPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        }

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/logos/PORFIT_B.png',
            badge: payload.badge || '/logos/PORFIT_B.png',
            data: payload.data || {},
            tag: payload.tag,
            requireInteraction: payload.requireInteraction || false,
          })
        )
      } catch (error: any) {
        // If subscription is invalid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log('Removing invalid push subscription:', subscription.endpoint)
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', subscription.endpoint)
        } else {
          console.error('Error sending push notification:', error)
        }
      }
    })

    await Promise.allSettled(notificationPromises)
  } catch (error) {
    console.error('Error in sendPushNotificationToUser:', error)
  }
}

/**
 * Send push notification when a database notification is created
 * This can be called from notification helper functions
 */
export async function sendPushForNotification(
  userId: string,
  notificationType: string,
  title: string,
  message: string,
  data?: any
): Promise<void> {
  const payload: PushNotificationPayload = {
    title,
    body: message,
    icon: '/logos/PORFIT_B.png',
    badge: '/logos/PORFIT_B.png',
    data: {
      ...data,
      type: notificationType,
    },
    tag: data?.transaction_id || data?.project_id || notificationType,
  }

  await sendPushNotificationToUser(userId, payload)
}

