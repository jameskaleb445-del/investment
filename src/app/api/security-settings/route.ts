import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/security-settings
 * Get user's security settings
 */
export async function GET() {
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

    const { data: settings, error } = await supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching security settings:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch security settings' },
        { status: 500 }
      )
    }

    // If settings don't exist, create default ones
    if (!settings) {
      const { data: newSettings, error: createError } = await supabase
        .from('user_security_settings')
        .insert({
          user_id: user.id,
          two_factor_enabled: false,
          transaction_pin_required: true,
          security_notifications_enabled: true,
          email_verification_required: true,
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json(
          { error: createError.message || 'Failed to create security settings' },
          { status: 500 }
        )
      }

      return NextResponse.json({ settings: newSettings })
    }

    return NextResponse.json({ settings })
  } catch (error: any) {
    console.error('Error in GET /api/security-settings:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/security-settings
 * Update user's security settings
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
    const {
      two_factor_enabled,
      transaction_pin_required,
      security_notifications_enabled,
      email_verification_required,
    } = body

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (two_factor_enabled !== undefined) updates.two_factor_enabled = two_factor_enabled
    if (transaction_pin_required !== undefined) updates.transaction_pin_required = transaction_pin_required
    if (security_notifications_enabled !== undefined) updates.security_notifications_enabled = security_notifications_enabled
    if (email_verification_required !== undefined) updates.email_verification_required = email_verification_required

    const { data: settings, error } = await supabase
      .from('user_security_settings')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating security settings:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update security settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ settings })
  } catch (error: any) {
    console.error('Error in PATCH /api/security-settings:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

