'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/app/components/layout/AppLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { formatCurrency } from '@/app/utils/format'
import { Button } from '@/app/components/ui/button'
import { Switch } from '@/app/components/ui/switch'
import { FaRegBell } from 'react-icons/fa'
import { HiArrowLeft } from 'react-icons/hi'
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPushNotifications,
  requestPushPermission,
} from '@/app/lib/push-notifications'
import toast from 'react-hot-toast'
import { useRouter } from '@/i18n/navigation'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data: any
  read: boolean
  created_at: string
}

interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
}

function NotificationsPageContent() {
  const t = useTranslations('notifications')
  const router = useRouter()
  const queryClient = useQueryClient()
  const [pushEnabled, setPushEnabled] = useState(false)
  const [checkingPush, setCheckingPush] = useState(true)

  // Fetch notifications
  const { data, isLoading, refetch } = useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications')
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      return response.json()
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Check push notification status
  useEffect(() => {
    checkPushSubscription()
  }, [])

  const checkPushSubscription = async () => {
    setCheckingPush(true)
    try {
      const subscribed = await isSubscribedToPushNotifications()
      setPushEnabled(subscribed)
    } catch (error) {
      console.error('Error checking push subscription:', error)
      setPushEnabled(false)
    } finally {
      setCheckingPush(false)
    }
  }

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      // Enable push notifications
      try {
        const permission = await requestPushPermission()
        if (permission !== 'granted') {
          toast.error(t('pushPermissionDenied') || 'Push notifications permission denied')
          return
        }

        const subscription = await subscribeToPushNotifications()
        if (!subscription) {
          toast.error(t('pushEnableFailed') || 'Failed to enable push notifications')
          return
        }

        // Send subscription to server
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to save subscription')
        }

        setPushEnabled(true)
        toast.success(t('pushEnabled') || 'Push notifications enabled!')
      } catch (error: any) {
        console.error('Error enabling push notifications:', error)
        toast.error(error?.message || t('pushEnableFailed') || 'Failed to enable push notifications')
      }
    } else {
      // Disable push notifications
      try {
        // Get current subscription endpoint before unsubscribing
        let endpoint: string | null = null
        try {
          const registration = await navigator.serviceWorker.ready
          const subscription = await registration.pushManager.getSubscription()
          endpoint = subscription?.endpoint || null
        } catch (error) {
          console.warn('Error getting subscription:', error)
        }

        // Unsubscribe from push notifications
        const unsubscribed = await unsubscribeFromPushNotifications()
        if (!unsubscribed) {
          toast.error(t('pushDisableFailed') || 'Failed to disable push notifications')
          return
        }

        // Remove subscription from server if we have the endpoint
        if (endpoint) {
          try {
            const response = await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(endpoint)}`, {
              method: 'DELETE',
            })

            if (!response.ok) {
              console.warn('Failed to remove subscription from server')
            }
          } catch (error) {
            console.warn('Error removing subscription from server:', error)
          }
        } else {
          // If we don't have endpoint, delete all subscriptions for this user
          try {
            const response = await fetch('/api/push/subscribe', {
              method: 'DELETE',
            })

            if (!response.ok) {
              console.warn('Failed to remove subscriptions from server')
            }
          } catch (error) {
            console.warn('Error removing subscriptions from server:', error)
          }
        }

        setPushEnabled(false)
        toast.success(t('pushDisabled') || 'Push notifications disabled!')
      } catch (error: any) {
        console.error('Error disabling push notifications:', error)
        toast.error(error?.message || t('pushDisableFailed') || 'Failed to disable push notifications')
      }
    }
  }

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success(t('allMarkedAsRead') || 'All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error(t('markReadFailed') || 'Failed to mark notifications as read')
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    // Navigate based on notification type
    if (notification.data?.transaction_id) {
      router.push(`/wallet`)
    } else if (notification.data?.project_id) {
      router.push(`/marketplace`)
    } else if (notification.data?.investment_id) {
      router.push(`/`)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'transaction_completed':
        return '💰'
      case 'withdrawal':
        return '💸'
      case 'investment':
        return '📈'
      case 'investment_completed':
      case 'roi_payout':
        return '🎉'
      case 'referral_commission':
        return '👥'
      case 'daily_reward':
        return '🎁'
      case 'transaction_failed':
        return '❌'
      case 'project_update':
        return '📢'
      default:
        return '🔔'
    }
  }

  return (
    <AppLayout>
      <div className="min-h-screen theme-bg-primary pt-[10px] pb-28">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => router.back()}
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold theme-text-primary">{t('title')}</h1>
              </div>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="ghost"
                  className="text-sm text-[#8b5cf6] hover:text-[#7c3aed]"
                >
                  {t('markAllAsRead')}
                </Button>
              )}
            </div>

            {/* Push Notifications Toggle */}
            <div className="bg-gradient-to-r from-[#8b5cf6]/20 to-[#7c3aed]/10 border border-[#8b5cf6]/30 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
                  🔔
                </div>
                <div>
                  <p className="text-sm font-semibold theme-text-primary">
                    {t('pushNotifications') || 'Push Notifications'}
                  </p>
                  <p className="text-xs theme-text-secondary">
                    {pushEnabled
                      ? t('pushEnabledDescription') || 'Receive push notifications on this device'
                      : t('pushDisabledDescription') || 'Enable to receive push notifications'}
                  </p>
                </div>
              </div>
              {!checkingPush && (
                <Switch
                  checked={pushEnabled}
                  onCheckedChange={handlePushToggle}
                  disabled={checkingPush || !('Notification' in window)}
                />
              )}
              {checkingPush && (
                <div className="w-11 h-6 rounded-full bg-[#3a3a44] animate-pulse" />
              )}
            </div>
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="theme-bg-secondary theme-border border rounded-lg p-4 animate-pulse"
                >
                  <div className="h-4 bg-[#3a3a44] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#3a3a44] rounded w-full mb-1" />
                  <div className="h-3 bg-[#3a3a44] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 theme-bg-secondary theme-border border rounded-lg">
              <FaRegBell className="w-16 h-16 mx-auto mb-4 opacity-50 theme-text-secondary" />
              <p className="text-lg font-semibold theme-text-primary mb-2">
                {t('noNotifications')}
              </p>
              <p className="text-sm theme-text-secondary">
                {t('noNotificationsDescription') || "You're all caught up! Check back later for new notifications."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full theme-bg-secondary theme-border border rounded-lg p-4 text-left hover:theme-bg-tertiary transition-colors ${
                    !notification.read ? 'border-l-4 border-l-[#8b5cf6]' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-base font-semibold theme-text-primary">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-[#8b5cf6] rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-sm theme-text-secondary mb-2">
                        {notification.message}
                      </p>
                      {notification.data?.amount && (
                        <p className="text-sm font-semibold text-[#8b5cf6] mb-2">
                          {formatCurrency(notification.data.amount)}
                        </p>
                      )}
                      <p className="text-xs theme-text-muted">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default function NotificationsPage() {
  return <NotificationsPageContent />
}

