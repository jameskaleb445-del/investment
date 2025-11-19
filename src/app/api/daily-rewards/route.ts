import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { notifyDailyReward } from '@/app/lib/notifications'

const DAILY_REWARD_AMOUNT = 1000 // Default daily reward in FCFA

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

    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format

    // Check if user has claimed today's reward
    const { data: todayClaim } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('user_id', user.id)
      .eq('claim_date', today)
      .single()

    // Get the most recent claim to calculate streak
    const { data: lastClaim } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('user_id', user.id)
      .order('claim_date', { ascending: false })
      .limit(1)
      .single()

    // Calculate current streak
    let currentStreak = 0
    if (lastClaim) {
      const lastClaimDateStr = lastClaim.claim_date // Already in YYYY-MM-DD format
      const todayDateStr = today // Already in YYYY-MM-DD format
      
      // Get yesterday's date string
      const yesterdayDate = new Date()
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)
      yesterdayDate.setHours(0, 0, 0, 0)
      const year = yesterdayDate.getFullYear()
      const month = String(yesterdayDate.getMonth() + 1).padStart(2, '0')
      const day = String(yesterdayDate.getDate()).padStart(2, '0')
      const yesterdayDateStr = `${year}-${month}-${day}`

      // If last claim was yesterday or today, continue streak
      // If last claim was before yesterday, streak is broken
      if (lastClaimDateStr === todayDateStr || lastClaimDateStr === yesterdayDateStr) {
        currentStreak = Number(lastClaim.streak) || 0
      } else {
        currentStreak = 0 // Streak broken
      }
    }

    // Check if can claim (not claimed today)
    const canClaim = !todayClaim

    // Get all claims from this week (Monday to Sunday)
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0) // Normalize to start of day
    
    const dayOfWeek = todayDate.getDay()
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Monday is day 1
    const mondayDate = new Date(todayDate)
    mondayDate.setDate(todayDate.getDate() - diffToMonday)
    mondayDate.setHours(0, 0, 0, 0)
    
    // Get date string in YYYY-MM-DD format (using local date to avoid timezone issues)
    const year = mondayDate.getFullYear()
    const month = String(mondayDate.getMonth() + 1).padStart(2, '0')
    const day = String(mondayDate.getDate()).padStart(2, '0')
    const mondayStr = `${year}-${month}-${day}`

    // Calculate Sunday of current week for upper bound
    const sundayDate = new Date(mondayDate)
    sundayDate.setDate(mondayDate.getDate() + 6)
    sundayDate.setHours(23, 59, 59, 999)
    const sundayYear = sundayDate.getFullYear()
    const sundayMonth = String(sundayDate.getMonth() + 1).padStart(2, '0')
    const sundayDay = String(sundayDate.getDate()).padStart(2, '0')
    const sundayStr = `${sundayYear}-${sundayMonth}-${sundayDay}`

    const { data: weekClaims } = await supabase
      .from('daily_rewards')
      .select('claim_date')
      .eq('user_id', user.id)
      .gte('claim_date', mondayStr)
      .lte('claim_date', sundayStr)
      .order('claim_date', { ascending: true })

    // Create a set of claimed dates for easy lookup
    const claimedDates = new Set(weekClaims?.map((c) => c.claim_date) || [])

    return NextResponse.json({
      dailyReward: DAILY_REWARD_AMOUNT,
      streak: currentStreak,
      canClaim,
      lastClaimDate: lastClaim?.claim_date || null,
      claimedToday: !!todayClaim,
      claimedDates: Array.from(claimedDates),
    })
  } catch (error: any) {
    console.error('Error fetching daily reward status:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST() {
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

    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format

    // Check if user has already claimed today
    const { data: todayClaim } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('user_id', user.id)
      .eq('claim_date', today)
      .single()

    if (todayClaim) {
      return NextResponse.json(
        { error: 'Daily reward already claimed today' },
        { status: 400 }
      )
    }

    // Get the most recent claim to calculate streak
    const { data: lastClaim } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('user_id', user.id)
      .order('claim_date', { ascending: false })
      .limit(1)
      .single()

    // Calculate streak
    let newStreak = 1
    if (lastClaim) {
      const lastClaimDate = new Date(lastClaim.claim_date)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      lastClaimDate.setHours(0, 0, 0, 0)

      // If last claim was yesterday, continue streak
      if (lastClaimDate.getTime() === yesterday.getTime()) {
        newStreak = lastClaim.streak + 1
      } else if (lastClaimDate.getTime() === new Date(today).getTime()) {
        // Should not happen, but handle edge case
        return NextResponse.json(
          { error: 'Daily reward already claimed today' },
          { status: 400 }
        )
      } else {
        // Streak broken, start at 1
        newStreak = 1
      }
    }

    // Create daily reward claim
    const { data: reward, error: rewardError } = await supabase
      .from('daily_rewards')
      .insert({
        user_id: user.id,
        claim_date: today,
        amount: DAILY_REWARD_AMOUNT,
        streak: newStreak,
      })
      .select()
      .single()

    if (rewardError) {
      console.error('Error creating daily reward:', rewardError)
      return NextResponse.json(
        { error: rewardError.message || 'Failed to claim daily reward' },
        { status: 500 }
      )
    }

    // Update wallet balance and total earnings using database function (bypasses RLS)
    const { error: updateWalletError } = await supabase.rpc('add_daily_reward_to_wallet', {
      p_user_id: user.id,
      p_amount: DAILY_REWARD_AMOUNT,
    })

    if (updateWalletError) {
      console.error('Error updating wallet:', updateWalletError)
      return NextResponse.json(
        { error: 'Failed to update wallet balance' },
        { status: 500 }
      )
    }

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'deposit',
      amount: DAILY_REWARD_AMOUNT,
      status: 'completed',
      reference: `daily_reward_${reward.id}`,
    })

    // Create notification
    await notifyDailyReward(user.id, DAILY_REWARD_AMOUNT, newStreak)

    return NextResponse.json({
      success: true,
      reward: {
        id: reward.id,
        amount: DAILY_REWARD_AMOUNT,
        streak: newStreak,
        claimDate: today,
      },
    })
  } catch (error: any) {
    console.error('Error claiming daily reward:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

