'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FaRegBell } from 'react-icons/fa'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from '@/i18n/navigation'
import { formatCurrency } from '@/app/utils/format'
import { BottomSheet } from '@/app/components/ui/bottom-sheet'
import { Button } from '@/app/components/ui/button'
import {
  subscribeToPushNotifications,
  requestPushPermission,
  isSubscribedToPushNotifications,
} from '@/app/lib/push-notifications'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data: any
  read: boolean
  created_at: string
}

export interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
}

interface NotificationsBottomSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsBottomSheet({ isOpen, onClose }: NotificationsBottomSheetProps) {
  const [pushEnabled, setPushEnabled] = useState(false)
  const router = useRouter()
  const t = useTranslations('notifications')
  const queryClient = useQueryClient()

  // Fetch notifications - always enabled to auto-fetch
  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications')
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      return response.json()
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: true, // Always fetch
  })

  // Check push notification subscription status
  useEffect(() => {
    if (isOpen) {
      checkPushSubscription()
    }
  }, [isOpen])

  const checkPushSubscription = async () => {
    const subscribed = await isSubscribedToPushNotifications()
    setPushEnabled(subscribed)
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
    } catch (error) {
      console.error('Error marking all as read:', error)
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

    onClose()
  }

  const handleEnablePush = async () => {
    try {
      const permission = await requestPushPermission()
      if (permission !== 'granted') {
        toast.error(t('pushPermissionDenied') || 'Push notifications permission denied')
        return
      }

      const subscription = await subscribeToPushNotifications()
      if (!subscription) {
        // Error message will be shown by subscribeToPushNotifications if it throws
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
      const errorMessage = error?.message || t('pushEnableFailed') || 'Failed to enable push notifications'
      toast.error(errorMessage)
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
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('title')} maxHeight="90vh">
      <div className="flex flex-col h-full">
        {/* Header Actions */}
        <div className="px-5 py-3 border-b theme-border flex items-center justify-between flex-shrink-0">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="ghost"
              className="text-sm text-[#8b5cf6] hover:text-[#7c3aed] hover:bg-[#2d2d35] h-auto px-3 py-1.5"
            >
              {t('markAllAsRead')}
            </Button>
          )}
          <div className="flex-1" />
          {unreadCount > 0 && (
            <span className="text-sm theme-text-secondary">
              {unreadCount} {unreadCount === 1 ? 'unread' : 'unread'}
            </span>
          )}
        </div>

        {/* Push Notifications Toggle */}
        {!pushEnabled && 'Notification' in window && (
          <div className="px-5 py-3 border-b theme-border flex-shrink-0">
            <Button
              onClick={handleEnablePush}
              variant="ghost"
              className="w-full text-sm text-[#8b5cf6] hover:text-[#7c3aed] hover:bg-[#2d2d35] justify-start h-auto px-3 py-2"
            >
              🔔 {t('enablePushNotifications') || 'Enable Push Notifications'}
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {isLoading ? (
            <div className="p-8 text-center theme-text-secondary">
              {t('loading')}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center theme-text-secondary">
              <FaRegBell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t('noNotifications')}</p>
            </div>
          ) : (
            <div className="divide-y theme-border">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full px-5 py-4 text-left hover:bg-[#2d2d35]/50 transition-colors ${
                    !notification.read ? 'bg-[#2d2d35]/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold theme-text-primary">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-[#8b5cf6] rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs theme-text-secondary mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.data?.amount && (
                        <p className="text-xs font-semibold text-[#8b5cf6] mt-1">
                          {formatCurrency(notification.data.amount)}
                        </p>
                      )}
                      <p className="text-xs text-[#6b7280] mt-1">
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

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-5 py-3 border-t theme-border flex-shrink-0">
            <Button
              onClick={() => {
                router.push('/notifications')
                onClose()
              }}
              variant="ghost"
              className="w-full text-sm text-[#8b5cf6] hover:text-[#7c3aed] hover:bg-[#2d2d35] h-auto px-3 py-2"
            >
              {t('viewAll')}
            </Button>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

// Export as NotificationsDropdown for backwards compatibility
export { NotificationsButton as NotificationsDropdown }

// Button component to trigger the bottom sheet
function NotificationsButton() {
  const [isOpen, setIsOpen] = useState(false)

  // Fetch unread count - always enabled to auto-fetch
  const { data } = useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications')
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      return response.json()
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: true, // Always fetch
    select: (data) => ({ unreadCount: data.unreadCount }), // Only get unread count
  })

  const unreadCount = data?.unreadCount || 0

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="theme-text-secondary hover:theme-text-primary transition-colors relative"
      >
        <FaRegBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1.5 bg-red-500 rounded-full flex items-center justify-center text-xs font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <NotificationsBottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

