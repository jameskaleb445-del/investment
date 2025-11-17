import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { REFERRAL_COMMISSION_RATES } from '@/app/constants/projects'

/**
 * Webhook/API endpoint to mark a deposit transaction as completed
 * and calculate referral commissions
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transactionId } = await params
    const supabase = await createClient()

    // Get transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single()

    if (txError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Only process deposits
    if (transaction.type !== 'deposit') {
      return NextResponse.json(
        { error: 'Only deposits can be completed via this endpoint' },
        { status: 400 }
      )
    }

    // Already completed
    if (transaction.status === 'completed') {
      return NextResponse.json({
        message: 'Transaction already completed',
        transaction,
      })
    }

    // Update transaction status to completed
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('id', transactionId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Calculate net amount (after fee)
    // Platform fee is 1% (0.01)
    const fee = Number(transaction.amount) * 0.01
    const netAmount = Number(transaction.amount) - fee

    // Get user wallet and update balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', transaction.user_id)
      .single()

    if (wallet) {
      await supabase
        .from('wallets')
        .update({
          balance: Number(wallet.balance) + netAmount,
        })
        .eq('user_id', transaction.user_id)
    }

    // Calculate and distribute referral commissions
    const { data: referrals } = await supabase
      .from('referrals')
      .select('id, referrer_id, level')
      .eq('referred_id', transaction.user_id)

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
            transaction_id: transactionId,
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

    return NextResponse.json({
      message: 'Transaction completed and commissions distributed',
      transaction: updatedTransaction,
    })
  } catch (error: any) {
    console.error('Error completing transaction:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

