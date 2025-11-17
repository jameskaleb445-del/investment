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

    // Get referral tree (3 levels deep)
    const levels = []

    // Level 1: Direct referrals
    const { data: level1Referrals } = await supabase
      .from('referrals')
      .select(`
        id,
        referred_id,
        level,
        referred_user:users!referrals_referred_id_fkey(
          id,
          full_name,
          email,
          referral_code,
          created_at
        )
      `)
      .eq('referrer_id', user.id)
      .eq('level', 1)

    if (level1Referrals) {
      const level1Users = await Promise.all(
        level1Referrals.map(async (ref) => {
          const referredUser = ref.referred_user as any
          // Calculate total invested and deposited
          const { data: investments } = await supabase
            .from('investments')
            .select('amount')
            .eq('user_id', referredUser.id)
            .eq('status', 'active')

          const { data: deposits } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', referredUser.id)
            .eq('type', 'deposit')
            .eq('status', 'completed')

          const totalInvested =
            investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0
          const totalDeposited =
            deposits?.reduce((sum, dep) => sum + Number(dep.amount), 0) || 0

          return {
            id: referredUser.id,
            name: referredUser.full_name || referredUser.email || 'Unknown',
            email: referredUser.email || '',
            referralCode: referredUser.referral_code || '',
            totalInvested,
            totalDeposited,
            joinedAt: referredUser.created_at,
          }
        })
      )

      levels.push({
        level: 1,
        users: level1Users,
      })

      // Level 2: Referrals of Level 1 users
      if (level1Referrals.length > 0) {
        const level1UserIds = level1Referrals.map((ref) => ref.referred_id)
        const { data: level2Referrals } = await supabase
          .from('referrals')
          .select(`
            id,
            referred_id,
            level,
            referred_user:users!referrals_referred_id_fkey(
              id,
              full_name,
              email,
              referral_code,
              created_at
            )
          `)
          .in('referrer_id', level1UserIds)
          .eq('level', 2)

        if (level2Referrals) {
          const level2Users = await Promise.all(
            level2Referrals.map(async (ref) => {
              const referredUser = ref.referred_user as any
              const { data: investments } = await supabase
                .from('investments')
                .select('amount')
                .eq('user_id', referredUser.id)
                .eq('status', 'active')

              const { data: deposits } = await supabase
                .from('transactions')
                .select('amount')
                .eq('user_id', referredUser.id)
                .eq('type', 'deposit')
                .eq('status', 'completed')

              const totalInvested =
                investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0
              const totalDeposited =
                deposits?.reduce((sum, dep) => sum + Number(dep.amount), 0) || 0

              return {
                id: referredUser.id,
                name: referredUser.full_name || referredUser.email || 'Unknown',
                email: referredUser.email || '',
                referralCode: referredUser.referral_code || '',
                totalInvested,
                totalDeposited,
                joinedAt: referredUser.created_at,
              }
            })
          )

          levels.push({
            level: 2,
            users: level2Users,
          })

          // Level 3: Referrals of Level 2 users
          if (level2Referrals.length > 0) {
            const level2UserIds = level2Referrals.map((ref) => ref.referred_id)
            const { data: level3Referrals } = await supabase
              .from('referrals')
              .select(`
                id,
                referred_id,
                level,
                referred_user:users!referrals_referred_id_fkey(
                  id,
                  full_name,
                  email,
                  referral_code,
                  created_at
                )
              `)
              .in('referrer_id', level2UserIds)
              .eq('level', 3)

            if (level3Referrals) {
              const level3Users = await Promise.all(
                level3Referrals.map(async (ref) => {
                  const referredUser = ref.referred_user as any
                  const { data: investments } = await supabase
                    .from('investments')
                    .select('amount')
                    .eq('user_id', referredUser.id)
                    .eq('status', 'active')

                  const { data: deposits } = await supabase
                    .from('transactions')
                    .select('amount')
                    .eq('user_id', referredUser.id)
                    .eq('type', 'deposit')
                    .eq('status', 'completed')

                  const totalInvested =
                    investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0
                  const totalDeposited =
                    deposits?.reduce((sum, dep) => sum + Number(dep.amount), 0) || 0

                  return {
                    id: referredUser.id,
                    name: referredUser.full_name || referredUser.email || 'Unknown',
                    email: referredUser.email || '',
                    referralCode: referredUser.referral_code || '',
                    totalInvested,
                    totalDeposited,
                    joinedAt: referredUser.created_at,
                  }
                })
              )

              levels.push({
                level: 3,
                users: level3Users,
              })
            }
          }
        }
      }
    }

    return NextResponse.json({ levels })
  } catch (error: any) {
    console.error('Error in GET /api/referrals/tree:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

