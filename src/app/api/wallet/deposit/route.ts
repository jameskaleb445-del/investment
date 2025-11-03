import { createClient } from '@/app/lib/supabase/server'
import { depositSchema } from '@/app/validation/wallet'
import { NextResponse } from 'next/server'
import { PLATFORM_FEES } from '@/app/constants/projects'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = depositSchema.parse(body)

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

    // Calculate fee
    const fee = validated.amount * PLATFORM_FEES.DEPOSIT
    const netAmount = validated.amount - fee

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'deposit',
        amount: validated.amount,
        status: 'pending',
        payment_method: validated.payment_method,
      })
      .select()
      .single()

    if (txError) {
      return NextResponse.json(
        { error: txError.message },
        { status: 500 }
      )
    }

    // TODO: Integrate with Mobile Money API
    // For now, return pending status
    // In production, initiate payment with Orange Money/MTN API
    // and update transaction status based on webhook callback

    return NextResponse.json({
      message: 'Deposit initiated successfully',
      transaction: {
        id: transaction.id,
        amount: validated.amount,
        fee,
        net_amount: netAmount,
        status: 'pending',
        payment_method: validated.payment_method,
      },
      // In production, return payment instructions/URL
      payment_instructions: `Complete payment via ${validated.payment_method}`,
    })
  } catch (error: any) {
    if (error.issues) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

