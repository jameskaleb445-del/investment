import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * PATCH /api/payment-methods/[id]
 * Update a payment method (set as default, etc.)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { is_default } = body

    // If setting as default, unset all other defaults
    if (is_default) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .neq('id', id)
    }

    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .update({
        is_default: is_default !== undefined ? is_default : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating payment method:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update payment method' },
        { status: 500 }
      )
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ paymentMethod })
  } catch (error: any) {
    console.error('Error in PATCH /api/payment-methods/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/payment-methods/[id]
 * Delete a payment method
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Check if this is the default payment method
    const { data: paymentMethod } = await supabase
      .from('payment_methods')
      .select('is_default')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    // Delete the payment method
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting payment method:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete payment method' },
        { status: 500 }
      )
    }

    // If deleted payment method was default, set first remaining as default
    if (paymentMethod.is_default) {
      const { data: remainingMethods } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)

      if (remainingMethods && remainingMethods.length > 0) {
        await supabase
          .from('payment_methods')
          .update({ is_default: true })
          .eq('id', remainingMethods[0].id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/payment-methods/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

