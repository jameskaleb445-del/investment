-- Fix the handle_new_user function to safely handle referral_code generation
-- and ensure the trigger doesn't fail on duplicate codes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code TEXT;
  v_attempts INT := 0;
  v_max_attempts INT := 10;
BEGIN
  -- Generate a unique referral code
  -- Try up to 10 times to ensure uniqueness
  LOOP
    v_referral_code := UPPER(substr(md5(random()::text || NEW.id::text || clock_timestamp()::text), 1, 8));
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE referral_code = v_referral_code) THEN
      EXIT;
    END IF;
    
    v_attempts := v_attempts + 1;
    IF v_attempts >= v_max_attempts THEN
      -- Fallback: use a timestamp-based code if we can't generate a unique one
      v_referral_code := UPPER(substr(md5(NEW.id::text || extract(epoch from now())::text), 1, 8));
      EXIT;
    END IF;
  END LOOP;

  -- Insert user profile with explicit referral_code
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    referral_code,
    email_verified, 
    phone_verified, 
    pin_set, 
    registration_complete, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1),
      'User'
    ),
    v_referral_code,
    -- Email verified if user came from OAuth (has provider) and provider is not 'email'
    -- Use raw_app_meta_data instead of app_metadata in trigger context
    CASE 
      WHEN (NEW.raw_app_meta_data->>'provider') IS NOT NULL AND (NEW.raw_app_meta_data->>'provider') != 'email' THEN TRUE
      ELSE FALSE
    END,
    FALSE, -- Phone not verified by default
    FALSE, -- PIN not set yet
    FALSE, -- Registration not complete until PIN is set
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(NEW.email, users.email),
    full_name = COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      users.full_name
    ),
    email_verified = CASE 
      WHEN (NEW.raw_app_meta_data->>'provider') IS NOT NULL AND (NEW.raw_app_meta_data->>'provider') != 'email' THEN TRUE
      ELSE COALESCE(users.email_verified, FALSE)
    END,
    updated_at = NOW();
  
  -- Create wallet for new user (only if it doesn't exist)
  INSERT INTO public.wallets (user_id, balance, invested_amount, pending_withdrawal, total_earnings, created_at, updated_at)
  VALUES (NEW.id, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    -- This allows the user to be created even if profile creation fails
    -- The callback route will handle creating the profile manually
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

