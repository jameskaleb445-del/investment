import { createClient } from '@/app/lib/supabase/server'
import { investmentSchema } from '@/app/validation/investments'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { REFERRAL_COMMISSION_RATES, REFERRAL_LEVELS, getInvestmentLevelByAmount, getReferralBonusForAmount } from '@/app/constants/projects'
import { notifyInvestment, notifyReferralCommission } from '@/app/lib/notifications'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const body = await request.json()
    const validated = investmentSchema.parse(body)

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

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Validate investment amount
    if (
      validated.amount < Number(project.min_investment) ||
      validated.amount > Number(project.max_investment)
    ) {
      return NextResponse.json(
        {
          error: `Investment amount must be between ${project.min_investment} and ${project.max_investment} XAF`,
        },
        { status: 400 }
      )
    }

    // Check if project is accepting investments
    if (project.status !== 'funding') {
      return NextResponse.json(
        { error: 'Project is not accepting investments' },
        { status: 400 }
      )
    }

    // Check if funding goal will be exceeded
    const newFundedAmount =
      Number(project.funded_amount) + validated.amount
    if (newFundedAmount > Number(project.goal_amount)) {
      return NextResponse.json(
        { error: 'Investment exceeds remaining funding goal' },
        { status: 400 }
      )
    }

    // Get wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance, invested_amount')
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      )
    }

    const availableBalance = Number(wallet.balance) - Number(wallet.invested_amount)

    if (validated.amount > availableBalance) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Find investment level based on amount
    const investmentLevel = getInvestmentLevelByAmount(validated.amount)
    
    if (!investmentLevel) {
      return NextResponse.json(
        { error: 'Invalid investment amount. Please select a valid investment level.' },
        { status: 400 }
      )
    }

    // Calculate earnings cap (2x multiplier)
    const maxEarningsCap = validated.amount * investmentLevel.maxEarningsMultiplier

    // Calculate expected return based on level's daily ROI
    const expectedReturn = (validated.amount * investmentLevel.dailyRoi) / 100

    // Create investment with level information and earnings cap
    // Status is set to 'active' immediately - investments start earning right away
    const { data: investment, error: invError } = await supabase
      .from('investments')
      .insert({
        user_id: user.id,
        project_id: projectId,
        amount: validated.amount,
        expected_return: expectedReturn,
        status: 'active',
        level_name: investmentLevel.levelName,
        daily_roi: investmentLevel.dailyRoi,
        max_earnings_multiplier: investmentLevel.maxEarningsMultiplier,
        max_earnings_cap: maxEarningsCap,
        accumulated_earnings: 0,
        last_earnings_calculation: new Date().toISOString(),
      })
      .select()
      .single()

    if (invError) {
      return NextResponse.json(
        { error: invError.message },
        { status: 500 }
      )
    }

    // Update wallet
    await supabase
      .from('wallets')
      .update({
        balance: Number(wallet.balance) - validated.amount,
        invested_amount: Number(wallet.invested_amount) + validated.amount,
      })
      .eq('user_id', user.id)

    // Update project funded amount
    await supabase
      .from('projects')
      .update({
        funded_amount: newFundedAmount,
      })
      .eq('id', projectId)

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'investment',
        amount: validated.amount,
        status: 'completed',
        project_id: projectId,
      })
      .select()
      .single()

    if (txError) {
      console.error('Transaction creation error:', txError)
    }

    // Calculate and distribute referral commissions
    const { data: referrals } = await supabase
      .from('referrals')
      .select('id, referrer_id, level')
      .eq('referred_id', user.id)

    // Calculate referral commissions based on investment level
    // Level 1 (direct referrer) gets level-based bonus (26%, 30%, 32.5%, or 35% cap)
    // Level 2 and 3 get standard percentages of investment amount
    const referralBonusAmount = getReferralBonusForAmount(validated.amount)

    if (referrals) {
      for (const referral of referrals) {
        let commissionAmount = 0
        
        if (referral.level === REFERRAL_LEVELS.LEVEL_1) {
          // Direct referrer gets the full level-based bonus
          commissionAmount = referralBonusAmount
        } else if (referral.level === REFERRAL_LEVELS.LEVEL_2) {
          // Level 2 gets 5% of investment amount
          const commissionRate = REFERRAL_COMMISSION_RATES[REFERRAL_LEVELS.LEVEL_2]
          commissionAmount = validated.amount * commissionRate
        } else if (referral.level === REFERRAL_LEVELS.LEVEL_3) {
          // Level 3 gets 2% of investment amount
          const commissionRate = REFERRAL_COMMISSION_RATES[REFERRAL_LEVELS.LEVEL_3]
          commissionAmount = validated.amount * commissionRate
        }

        // Skip if commission amount is 0
        if (commissionAmount === 0) continue

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
            referral_id: referral.id, // Use referral relationship ID, not referrer_id
            amount: commissionAmount,
            level: referral.level,
            transaction_id: transaction?.id,
          })

          // Create transaction for referral commission
          await supabase.from('transactions').insert({
            user_id: referral.referrer_id,
            type: 'referral_commission',
            amount: commissionAmount,
            status: 'completed',
          })

          // Create notification for referrer
          await notifyReferralCommission(
            referral.referrer_id,
            commissionAmount,
            referral.level
          )
        }
      }
    }

    // Create notification for investment
    await notifyInvestment(
      user.id,
      validated.amount,
      project.name,
      projectId,
      investment.id
    )

    return NextResponse.json({
      message: 'Investment created successfully',
      investment: {
        id: investment.id,
        amount: validated.amount,
        expected_return: expectedReturn,
        max_earnings_cap: maxEarningsCap,
        accumulated_earnings: 0,
        level_name: investmentLevel.levelName,
        status: 'active',
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

