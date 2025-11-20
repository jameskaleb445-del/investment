import { createClient } from '@/app/lib/supabase/server'
import { withdrawalSchema } from '@/app/validation/wallet'
import { NextResponse } from 'next/server'
import { PLATFORM_FEES, WITHDRAWAL_LADDER, WITHDRAWAL_COOLDOWN_HOURS } from '@/app/constants/projects'
import crypto from 'crypto'
import { notifyWithdrawal } from '@/app/lib/notifications'

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

    // Get wallet with withdrawal tracking
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance, pending_withdrawal, withdrawal_count, last_withdrawal_at')
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      )
    }

    // Check 48-hour cooldown
    if (wallet.last_withdrawal_at) {
      const lastWithdrawalDate = new Date(wallet.last_withdrawal_at)
      const now = new Date()
      const hoursSinceLastWithdrawal = 
        (now.getTime() - lastWithdrawalDate.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceLastWithdrawal < WITHDRAWAL_COOLDOWN_HOURS) {
        const remainingHours = Math.ceil(WITHDRAWAL_COOLDOWN_HOURS - hoursSinceLastWithdrawal)
        return NextResponse.json(
          { 
            error: `You must wait ${remainingHours} more hour(s) before making another withdrawal. 48-hour cooldown period.`,
            cooldown_remaining_hours: remainingHours,
          },
          { status: 429 }
        )
      }
    }

    // Get withdrawal limits based on withdrawal count
    const withdrawalCount = wallet.withdrawal_count || 0
    const withdrawalNumber = withdrawalCount + 1 // Next withdrawal number
    
    let minAmount = 0
    let maxAmount = 0
    
    if (withdrawalNumber <= 5) {
      // Use ladder limits for withdrawals 1-5
      const ladderLimit = WITHDRAWAL_LADDER[withdrawalNumber - 1]
      minAmount = ladderLimit.minAmount
      maxAmount = ladderLimit.maxAmount
    } else {
      // Withdrawal 6+: min 40k, max = 40% of balance OR highest active stake
      minAmount = 40000
      
      // Get highest active stake
      const { data: activeInvestments } = await supabase
        .from('investments')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('amount', { ascending: false })
        .limit(1)
      
      const highestStake = activeInvestments && activeInvestments.length > 0
        ? Number(activeInvestments[0].amount)
        : 0
      
      const balanceMax = Number(wallet.balance) * 0.4 // 40% of balance
      maxAmount = Math.max(balanceMax, highestStake)
    }

    // Validate withdrawal amount against limits
    if (validated.amount < minAmount) {
      return NextResponse.json(
        { 
          error: `Minimum withdrawal amount is ${minAmount.toLocaleString()} XAF for withdrawal #${withdrawalNumber}`,
          min_amount: minAmount,
          withdrawal_number: withdrawalNumber,
        },
        { status: 400 }
      )
    }

    if (validated.amount > maxAmount) {
      return NextResponse.json(
        { 
          error: `Maximum withdrawal amount is ${maxAmount.toLocaleString()} XAF for withdrawal #${withdrawalNumber}`,
          max_amount: maxAmount,
          withdrawal_number: withdrawalNumber,
        },
        { status: 400 }
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

    // Calculate 5% fee
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
        payment_method: validated.payment_method,
        phone: validated.phone,
      })
      .select()
      .single()

    if (wrError) {
      return NextResponse.json(
        { error: wrError.message },
        { status: 500 }
      )
    }

    // Update wallet: pending withdrawal, withdrawal count, and last withdrawal time
    await supabase
      .from('wallets')
      .update({
        pending_withdrawal: Number(wallet.pending_withdrawal) + validated.amount,
        withdrawal_count: withdrawalCount + 1,
        last_withdrawal_at: new Date().toISOString(),
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

    // Create notification for withdrawal
    if (transaction) {
      await notifyWithdrawal(user.id, validated.amount, 'pending', transaction.id)
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

