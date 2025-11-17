import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/payment-methods
 * Get user's payment methods
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

    const { data: paymentMethods, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payment methods:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch payment methods' },
        { status: 500 }
      )
    }

    return NextResponse.json({ paymentMethods: paymentMethods || [] })
  } catch (error: any) {
    console.error('Error in GET /api/payment-methods:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/payment-methods
 * Create a new payment method
 */
export async function POST(request: Request) {
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
    const { type, account_number, account_name, is_default } = body

    if (!type || !account_number) {
      return NextResponse.json(
        { error: 'Type and account number are required' },
        { status: 400 }
      )
    }

    // If this is set as default, unset all other defaults
    if (is_default) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    // Check if payment method already exists
    const { data: existing } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', type)
      .eq('account_number', account_number)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'This payment method already exists' },
        { status: 400 }
      )
    }

    // If this is the first payment method, set it as default
    const { count } = await supabase
      .from('payment_methods')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const shouldBeDefault = (count === 0) || is_default

    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: user.id,
        type,
        account_number,
        account_name: account_name || null,
        is_default: shouldBeDefault,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating payment method:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create payment method' },
        { status: 500 }
      )
    }

    return NextResponse.json({ paymentMethod })
  } catch (error: any) {
    console.error('Error in POST /api/payment-methods:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

