import { createClient } from '@/app/lib/supabase/server'
import { pinSchema } from '@/app/validation/auth'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Step 3: PIN Setup (Completes Registration)
 * - Verifies user is authenticated
 * - Hashes and stores PIN in user metadata
 * - Marks PIN as set in users table
 * - Marks registration as complete
 * - Creates wallet for user if it doesn't exist
 * - Returns success with user data
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = pinSchema.parse(body)

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please complete registration first.' },
        { status: 401 }
      )
    }

    // Check if user exists in users table, if not create it
    let { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist, create it (trigger might have failed)
    if (profileError || !userProfile) {
      console.log('User profile not found, creating it...', { userId: user.id, error: profileError })
      
      // Get user metadata from auth
      const fullName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email?.split('@')[0] || 
                       'User'
      
      // Determine if email is verified (OAuth users)
      const emailVerified = user.app_metadata?.provider && 
                           user.app_metadata.provider !== 'email' ? true : false

      // Create user profile manually
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: fullName,
          email_verified: emailVerified,
          phone_verified: false,
          pin_set: false,
          registration_complete: false,
        })
        .select()
        .single()

      if (createError || !newProfile) {
        console.error('Failed to create user profile:', createError)
        return NextResponse.json(
          { error: createError?.message || 'Failed to create user profile. Please try again.' },
          { status: 500 }
        )
      }

      // Create wallet if it doesn't exist
      await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          balance: 0,
          invested_amount: 0,
          pending_withdrawal: 0,
          total_earnings: 0,
        })
        .select()
        .single()

      userProfile = newProfile
    }

    // Check if PIN is already set
    if (userProfile.pin_set) {
      return NextResponse.json(
        { error: 'PIN is already set. Use reset PIN if you want to change it.' },
        { status: 400 }
      )
    }

    // Hash PIN (in production, use bcrypt or similar)
    const hashedPin = crypto
      .createHash('sha256')
      .update(validated.pin)
      .digest('hex')

    // Store PIN hash in user metadata
    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: { pin_hash: hashedPin },
    })

    if (updateAuthError) {
      return NextResponse.json(
        { error: updateAuthError.message },
        { status: 500 }
      )
    }

    // Update user profile: mark PIN as set and registration as complete
    const { error: updateProfileError } = await supabase
      .from('users')
      .update({
        pin_set: true,
        registration_complete: true,
      })
      .eq('id', user.id)

    if (updateProfileError) {
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      )
    }

    // Create wallet for user if it doesn't exist
    const { data: existingWallet } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!existingWallet) {
      const { error: walletError } = await supabase.from('wallets').insert({
        user_id: user.id,
        balance: 0,
        invested_amount: 0,
        pending_withdrawal: 0,
        total_earnings: 0,
      })

      if (walletError) {
        console.error('Failed to create wallet:', walletError)
        // Don't fail the request if wallet creation fails, it can be created later
      }
    }

    // Get updated user profile
    const { data: updatedProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      message: 'PIN setup successfully. Registration completed!',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        pin_set: true,
        registration_complete: true,
        ...updatedProfile,
      },
    })
  } catch (error: any) {
    if (error.issues) {
      return NextResponse.json(
        { error: 'Please enter a valid 4-digit PIN.', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
