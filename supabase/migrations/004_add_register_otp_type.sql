-- Add 'register' and 'verification' types to otp_codes table
-- First, drop the existing constraint
ALTER TABLE public.otp_codes
DROP CONSTRAINT IF EXISTS otp_codes_type_check;

-- Add new constraint with additional types
ALTER TABLE public.otp_codes
ADD CONSTRAINT otp_codes_type_check 
CHECK (type IN ('login', 'withdrawal', 'deposit', 'register', 'verification'));

-- Also update the otp_codes table to allow temporary storage without user_id during registration
-- We'll create a new column for temporary storage (email/phone) before user creation
ALTER TABLE public.otp_codes
ADD COLUMN IF NOT EXISTS identifier TEXT; -- Stores email or phone before user is created
ALTER TABLE public.otp_codes
ALTER COLUMN user_id DROP NOT NULL; -- Allow NULL user_id for registration OTPs

-- Add index for faster lookups by identifier
CREATE INDEX IF NOT EXISTS idx_otp_codes_identifier ON public.otp_codes(identifier) WHERE identifier IS NOT NULL;

