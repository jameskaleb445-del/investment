import { createClient } from '@/app/lib/supabase/server'
import { depositSchema } from '@/app/validation/wallet'
import { NextResponse } from 'next/server'
import { PLATFORM_FEES, REFERRAL_COMMISSION_RATES } from '@/app/constants/projects'
import { notifyDeposit } from '@/app/lib/notifications'

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

    // Create notification for deposit
    await notifyDeposit(user.id, validated.amount, transaction.id)

    // Calculate and distribute referral commissions (only when deposit is completed)
    // For now, commissions will be calculated when deposit status changes to 'completed'
    // This will be handled by a webhook or when updating transaction status
    // For immediate calculation on pending deposits, uncomment below:
    /*
    const { data: referrals } = await supabase
      .from('referrals')
      .select('id, referrer_id, level')
      .eq('referred_id', user.id)

    if (referrals && referrals.length > 0) {
      for (const referral of referrals) {
        const commissionRate =
          REFERRAL_COMMISSION_RATES[
            referral.level as keyof typeof REFERRAL_COMMISSION_RATES
          ]
        // Calculate commission on net amount (after fee)
        const commissionAmount = netAmount * commissionRate

        // Get referrer wallet
        const { data: referrerWallet } = await supabase
          .from('wallets')
          .select('balance, total_earnings')
          .eq('user_id', referral.referrer_id)
          .single()

        if (referrerWallet) {
          // Update referrer wallet
          await supabase
            .from('wallets')
            .update({
              balance: Number(referrerWallet.balance) + commissionAmount,
              total_earnings:
                Number(referrerWallet.total_earnings) + commissionAmount,
            })
            .eq('user_id', referral.referrer_id)

          // Create referral earnings record
          await supabase.from('referral_earnings').insert({
            user_id: referral.referrer_id,
            referral_id: referral.id,
            amount: commissionAmount,
            level: referral.level,
            transaction_id: transaction.id,
          })

          // Create transaction for referral commission
          await supabase.from('transactions').insert({
            user_id: referral.referrer_id,
            type: 'referral_commission',
            amount: commissionAmount,
            status: 'completed',
          })
        }
      }
    }
    */

    // TODO: Integrate with Mobile Money API
    // For now, return pending status
    // In production, initiate payment with Orange Money/MTN API
    // and update transaction status based on webhook callback
    // When deposit status changes to 'completed', calculate referral commissions

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

