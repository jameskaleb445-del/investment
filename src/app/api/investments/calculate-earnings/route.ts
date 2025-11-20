import { createClient, createAdminClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { notifyROIPayout, createNotification } from '@/app/lib/notifications'
import { formatCurrency } from '@/app/utils/format'

/**
 * Daily Earnings Calculation Service
 * This should be called daily (via cron job or scheduled task) to:
 * 1. Calculate daily earnings for all active investments
 * 2. Add to accumulated_earnings
 * 3. Check if accumulated_earnings >= max_earnings_cap (2x multiplier)
 * 4. Auto-complete investment if cap is reached, return principal + profit to wallet
 * 5. Update last_earnings_calculation timestamp
 */
export async function POST(request: Request) {
  try {
    // Optional: Add authentication check if this is a protected endpoint
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN || 'your-secret-token'
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()
    const supabase = await createClient()

    // Get all active investments that haven't reached cap
    const { data: activeInvestments, error: investmentsError } = await adminClient
      .from('investments')
      .select('*')
      .eq('status', 'active')

    if (investmentsError) {
      console.error('Error fetching active investments:', investmentsError)
      return NextResponse.json(
        { error: 'Failed to fetch investments' },
        { status: 500 }
      )
    }

    if (!activeInvestments || activeInvestments.length === 0) {
      return NextResponse.json({
        message: 'No active investments found',
        processed: 0,
        completed: 0,
      })
    }

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    let processedCount = 0
    let completedCount = 0

    for (const investment of activeInvestments) {
      try {
        const amount = Number(investment.amount)
        const maxEarningsCap = Number(investment.max_earnings_cap) || amount * 2.0
        const accumulatedEarnings = Number(investment.accumulated_earnings) || 0
        const dailyRoi = Number(investment.daily_roi) || Number(investment.expected_return) / amount * 100

        // Check if we already calculated earnings for today
        const lastCalculation = investment.last_earnings_calculation
          ? new Date(investment.last_earnings_calculation).toISOString().split('T')[0]
          : null

        // Skip if already calculated today
        if (lastCalculation === today) {
          continue
        }

        // Calculate daily profit based on daily ROI
        const dailyProfit = (amount * dailyRoi) / 100
        
        // Check if adding daily profit would exceed cap
        const newAccumulatedEarnings = accumulatedEarnings + dailyProfit
        
        if (newAccumulatedEarnings >= maxEarningsCap) {
          // Cap reached - auto-complete investment
          const finalProfit = maxEarningsCap - accumulatedEarnings
          const totalReturn = amount + maxEarningsCap // Principal + max earnings
          
          // Update investment to completed
          await adminClient
            .from('investments')
            .update({
              status: 'completed',
              actual_return: maxEarningsCap,
              accumulated_earnings: maxEarningsCap,
              payout_date: new Date().toISOString(),
              last_earnings_calculation: new Date().toISOString(),
            })
            .eq('id', investment.id)

          // Get user wallet
          const { data: wallet } = await adminClient
            .from('wallets')
            .select('balance, invested_amount, total_earnings')
            .eq('user_id', investment.user_id)
            .single()

          if (wallet) {
            // Return principal + earnings to wallet
            await adminClient
              .from('wallets')
              .update({
                balance: Number(wallet.balance) + totalReturn,
                invested_amount: Number(wallet.invested_amount) - amount,
                total_earnings: Number(wallet.total_earnings) + maxEarningsCap,
              })
              .eq('user_id', investment.user_id)

            // Create transaction for ROI payout
            await adminClient
              .from('transactions')
              .insert({
                user_id: investment.user_id,
                type: 'roi_payout',
                amount: totalReturn,
                status: 'completed',
                project_id: investment.project_id,
                reference: `investment_${investment.id}_completed`,
              })

            // Get project info for notification
            const { data: project } = await adminClient
              .from('projects')
              .select('name')
              .eq('id', investment.project_id)
              .single()

            // Notify user
            await notifyROIPayout(
              investment.user_id,
              totalReturn,
              project?.name || 'Investment',
              investment.project_id
            )

            // Create investment completed notification
            await createNotification({
              userId: investment.user_id,
              type: 'investment_completed',
              title: 'Investment Completed',
              message: `Your investment of ${formatCurrency(amount)} in ${project?.name || 'Investment'} has reached its earnings cap and has been completed. You received ${formatCurrency(totalReturn)} (${formatCurrency(amount)} principal + ${formatCurrency(maxEarningsCap)} earnings).`,
              data: {
                investment_id: investment.id,
                project_id: investment.project_id,
                project_name: project?.name,
                amount: totalReturn,
                earnings: maxEarningsCap,
                status: 'completed',
              },
            })
          }

          completedCount++
        } else {
          // Cap not reached - add daily profit to accumulated earnings
          await adminClient
            .from('investments')
            .update({
              accumulated_earnings: newAccumulatedEarnings,
              last_earnings_calculation: new Date().toISOString(),
            })
            .eq('id', investment.id)
        }

        processedCount++
      } catch (error: any) {
        console.error(`Error processing investment ${investment.id}:`, error)
        // Continue with next investment
      }
    }

    return NextResponse.json({
      message: 'Earnings calculation completed',
      processed: processedCount,
      completed: completedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error in daily earnings calculation:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for manual trigger (development/testing)
export async function GET() {
  // For development, you might want to allow GET requests
  // In production, this should be POST only with authentication
  return NextResponse.json({
    message: 'Use POST method with Bearer token to trigger earnings calculation',
  })
}

