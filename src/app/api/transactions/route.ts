import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

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
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Build query
    let query = supabase
      .from('transactions')
      .select(`
        *,
        project:projects(
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Apply filters
    if (type) {
      // Map UI types to database types
      const typeMap: Record<string, string> = {
        'return': 'roi_payout',
        'commission': 'referral_commission',
      }
      const dbType = typeMap[type] || type
      query = query.eq('type', dbType)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Map database transaction types to UI types and format
    const formattedTransactions = (transactions || []).map((tx: any) => {
      // Map transaction types for UI
      let uiType: string = tx.type
      if (tx.type === 'roi_payout') {
        uiType = 'return'
      } else if (tx.type === 'referral_commission') {
        uiType = 'commission'
      }

      // Handle project data (can be array or single object or null)
      const project = Array.isArray(tx.project) 
        ? tx.project[0] 
        : tx.project

      // Generate description based on type
      let description = ''
      switch (tx.type) {
        case 'deposit':
          // Check if it's a daily reward based on reference pattern
          if (tx.reference && tx.reference.startsWith('daily_reward_')) {
            description = 'Daily Bonus'
          } else {
            description = `Deposit via ${tx.payment_method === 'orange_money' ? 'Orange Money' : tx.payment_method === 'mtn_mobile_money' ? 'MTN Mobile Money' : 'Bank'}`
          }
          break
        case 'withdrawal':
          description = `Withdrawal to ${tx.payment_method === 'orange_money' ? 'Orange Money' : tx.payment_method === 'mtn_mobile_money' ? 'MTN Mobile Money' : 'Bank'}`
          break
        case 'investment':
          description = project?.name ? `Investment in ${project.name}` : 'Investment'
          break
        case 'roi_payout':
          description = project?.name ? `ROI from ${project.name}` : 'Return on investment'
          break
        case 'referral_commission':
          description = 'Referral commission'
          break
        default:
          description = uiType
      }

      // Check if it's a daily reward
      const isDailyReward = tx.reference && tx.reference.startsWith('daily_reward_')

      return {
        id: tx.id,
        type: uiType,
        amount: Number(tx.amount),
        status: tx.status,
        description,
        created_at: tx.created_at,
        metadata: {
          payment_method: tx.payment_method,
          reference: tx.reference,
          project_id: tx.project_id,
          isDailyReward,
          ...(project?.name && { project_name: project.name }),
        },
      }
    })

    return NextResponse.json({ transactions: formattedTransactions })
  } catch (error: any) {
    console.error('Error in GET /api/transactions:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

