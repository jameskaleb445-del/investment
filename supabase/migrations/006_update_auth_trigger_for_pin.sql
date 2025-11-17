-- Update the handle_new_user function to properly set PIN and registration status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile
  -- For OAuth users (Google, etc.), email is already verified
  -- Check if user came from OAuth by checking provider
  INSERT INTO public.users (id, email, full_name, email_verified, phone_verified, pin_set, registration_complete, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    -- Email verified if user came from OAuth (has provider) and provider is not 'email'
    CASE 
      WHEN (NEW.app_metadata->>'provider') IS NOT NULL AND (NEW.app_metadata->>'provider') != 'email' THEN TRUE
      ELSE FALSE
    END,
    FALSE, -- Phone not verified by default
    FALSE, -- PIN not set yet
    FALSE, -- Registration not complete until PIN is set
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    email_verified = CASE 
      WHEN (NEW.app_metadata->>'provider') IS NOT NULL AND (NEW.app_metadata->>'provider') != 'email' THEN TRUE
      ELSE users.email_verified
    END,
    updated_at = NOW();
  
  -- Create wallet for new user
  INSERT INTO public.wallets (user_id, balance, invested_amount, pending_withdrawal, total_earnings, created_at, updated_at)
  VALUES (NEW.id, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

