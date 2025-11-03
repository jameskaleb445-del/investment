import { createClient } from '@/app/lib/supabase/server'
import { withdrawalSchema } from '@/app/validation/wallet'
import { NextResponse } from 'next/server'
import { PLATFORM_FEES } from '@/app/constants/projects'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = withdrawalSchema.parse(body)

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

    // Verify PIN
    const storedPinHash = user.user_metadata?.pin_hash
    if (!storedPinHash) {
      return NextResponse.json(
        { error: 'PIN not set' },
        { status: 400 }
      )
    }

    const hashedPin = crypto
      .createHash('sha256')
      .update(validated.pin)
      .digest('hex')

    if (hashedPin !== storedPinHash) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      )
    }

    // Get wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance, pending_withdrawal')
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      )
    }

    const availableBalance =
      Number(wallet.balance) - Number(wallet.pending_withdrawal)

    if (validated.amount > availableBalance) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Calculate fee
    const fee = validated.amount * PLATFORM_FEES.WITHDRAWAL
    const netAmount = validated.amount - fee

    // Create withdrawal request
    const { data: withdrawalRequest, error: wrError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        amount: validated.amount,
        status: 'pending',
        pin_verified: true,
      })
      .select()
      .single()

    if (wrError) {
      return NextResponse.json(
        { error: wrError.message },
        { status: 500 }
      )
    }

    // Update wallet pending withdrawal
    await supabase
      .from('wallets')
      .update({
        pending_withdrawal: Number(wallet.pending_withdrawal) + validated.amount,
      })
      .eq('user_id', user.id)

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'withdrawal',
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

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawalRequest.id,
        amount: validated.amount,
        fee,
        net_amount: netAmount,
        status: 'pending',
      },
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

