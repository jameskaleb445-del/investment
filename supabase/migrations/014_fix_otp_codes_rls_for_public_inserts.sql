-- Fix RLS policy for otp_codes to allow public/system insertion for register and reset OTPs
-- These OTPs may be created before user authentication (registration) or for users who forgot password

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "System can create OTP codes" ON public.otp_codes;

-- Create a new policy that allows:
-- 1. Authenticated users to create OTPs for themselves (user_id = auth.uid())
-- 2. Public/system to create register/reset type OTPs (for registration and password reset flows)
CREATE POLICY "System can create OTP codes"
  ON public.otp_codes FOR INSERT
  WITH CHECK (
    -- Authenticated users can create OTPs for themselves
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- Public/system can create register and reset type OTPs (before user authentication)
    (type IN ('register', 'reset', 'verification') AND (user_id IS NULL OR user_id IS NOT NULL))
  );

