import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { defaultLocale, locales } from '@/i18n/config'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const localeParam = requestUrl.searchParams.get('locale')
  const next = requestUrl.searchParams.get('next')
  const refCode = requestUrl.searchParams.get('ref') // Get referral code from URL
  
  // Validate locale
  const locale = localeParam && locales.includes(localeParam as any) 
    ? localeParam 
    : defaultLocale

  if (code) {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(
        new URL(
          `/${locale}/login?error=${encodeURIComponent(error.message)}`, 
          requestUrl.origin
        )
      )
    }

    // After successful OAuth login, check if user needs to set up PIN
    if (data?.user) {
      // Wait a moment for the trigger to create the user profile
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get referral code from URL param or from user metadata (OAuth)
      const referralCode = refCode || data.user.user_metadata?.referral_code
      let referrerId: string | null = null
      
      // If referral code exists, find the referrer
      if (referralCode) {
        const { data: referrer } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', referralCode.toUpperCase())
          .single()

        if (referrer) {
          referrerId = referrer.id
        }
      }

      let { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('pin_set, registration_complete, referrer_id')
        .eq('id', data.user.id)
        .single()

      // If user profile doesn't exist, create it (trigger might have failed)
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Profile not found for user, creating it...', { userId: data.user.id })
        
        const fullName = data.user.user_metadata?.full_name || 
                         data.user.user_metadata?.name || 
                         data.user.email?.split('@')[0] || 
                         'User'
        
        const emailVerified = data.user.app_metadata?.provider && 
                             data.user.app_metadata.provider !== 'email' ? true : false

        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email || '',
            full_name: fullName,
            email_verified: emailVerified,
            phone_verified: false,
            pin_set: false,
            registration_complete: false,
            referrer_id: referrerId,
          })
          .select('pin_set, registration_complete, referrer_id')
          .single()

        if (!createError && newProfile) {
          // Create wallet if it doesn't exist
          await supabase
            .from('wallets')
            .insert({
              user_id: data.user.id,
              balance: 0,
              invested_amount: 0,
              pending_withdrawal: 0,
              total_earnings: 0,
            })
            .select()
            .single()
          
          userProfile = newProfile

          // Create referral relationships if referrer exists and user is new
          if (referrerId) {
            const { REFERRAL_LEVELS } = await import('@/app/constants/projects')
            
            // Create level 1 referral
            await supabase.from('referrals').insert({
              referrer_id: referrerId,
              referred_id: data.user.id,
              level: REFERRAL_LEVELS.LEVEL_1,
            })

            // Find level 2 referrer (referrer of referrer)
            const { data: level2Referrer } = await supabase
              .from('users')
              .select('referrer_id')
              .eq('id', referrerId)
              .single()

            if (level2Referrer?.referrer_id) {
              await supabase.from('referrals').insert({
                referrer_id: level2Referrer.referrer_id,
                referred_id: data.user.id,
                level: REFERRAL_LEVELS.LEVEL_2,
              })

              // Find level 3 referrer
              const { data: level3Referrer } = await supabase
                .from('users')
                .select('referrer_id')
                .eq('id', level2Referrer.referrer_id)
                .single()

              if (level3Referrer?.referrer_id) {
                await supabase.from('referrals').insert({
                  referrer_id: level3Referrer.referrer_id,
                  referred_id: data.user.id,
                  level: REFERRAL_LEVELS.LEVEL_3,
                })
              }
            }
          }
        }
      } else if (userProfile && referrerId && !userProfile.referrer_id) {
        // If profile exists but doesn't have referrer_id, update it
        await supabase
          .from('users')
          .update({ referrer_id: referrerId })
          .eq('id', data.user.id)
      }

      // If PIN is not set, redirect to PIN setup page (preserve referral code if exists)
      if (!userProfile?.pin_set || !userProfile?.registration_complete) {
        let pinSetupUrl = `/${locale}/setup-pin`
        if (refCode) {
          pinSetupUrl += `?ref=${encodeURIComponent(refCode)}`
        }
        return NextResponse.redirect(
          new URL(pinSetupUrl, requestUrl.origin)
        )
      }
    }
  }

  // Redirect to the next URL or home page with locale
  const redirectUrl = next 
    ? new URL(next, requestUrl.origin)
    : new URL(`/${locale}`, requestUrl.origin)
  
  return NextResponse.redirect(redirectUrl)
}

