import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      )
    }

    const availableBalance =
      Number(wallet.balance) -
      Number(wallet.invested_amount) -
      Number(wallet.pending_withdrawal)

    return NextResponse.json({
      balance: Number(wallet.balance),
      invested_amount: Number(wallet.invested_amount),
      pending_withdrawal: Number(wallet.pending_withdrawal),
      total_earnings: Number(wallet.total_earnings),
      available_balance: availableBalance,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

