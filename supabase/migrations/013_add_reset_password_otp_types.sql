-- Add 'reset' and 'reset_token' types to otp_codes table for password reset functionality
ALTER TABLE public.otp_codes
DROP CONSTRAINT IF EXISTS otp_codes_type_check;

-- Add new constraint with reset password types
ALTER TABLE public.otp_codes
ADD CONSTRAINT otp_codes_type_check 
CHECK (type IN ('login', 'withdrawal', 'deposit', 'register', 'verification', 'reset', 'reset_token'));

