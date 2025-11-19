import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/notifications
 * Get user's notifications
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch notifications' },
        { status: 500 }
      )
    }

    // Count unread notifications
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
    })
  } catch (error: any) {
    console.error('Error in GET /api/notifications:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationIds, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to update notifications' },
          { status: 500 }
        )
      }

      return NextResponse.json({ message: 'All notifications marked as read' })
    }

    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Mark specific notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error marking notifications as read:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to update notifications' },
          { status: 500 }
        )
      }

      return NextResponse.json({ message: 'Notifications marked as read' })
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide notificationIds array or markAllAsRead flag.' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error in PATCH /api/notifications:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

