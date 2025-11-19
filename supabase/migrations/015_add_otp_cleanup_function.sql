-- Create a function to clean up expired and old verified OTP codes
-- This should be run periodically (e.g., daily) to keep the database clean

CREATE OR REPLACE FUNCTION public.cleanup_expired_otp_codes()
RETURNS TABLE(deleted_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete expired OTPs (expires_at < NOW()) that are not verified
  -- Delete verified OTPs older than 7 days (keep for auditing/security logs)
  DELETE FROM public.otp_codes
  WHERE (
    -- Expired and not verified
    (expires_at < NOW() AND verified = false)
    OR
    -- Verified OTPs older than 7 days
    (verified = true AND created_at < NOW() - INTERVAL '7 days')
  );

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_deleted_count;
END;
$$;

-- Grant execute permission to authenticated users and anon (for cron jobs)
GRANT EXECUTE ON FUNCTION public.cleanup_expired_otp_codes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_otp_codes() TO anon;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Set up a scheduled job using pg_cron to run cleanup daily at 2 AM UTC
-- This will automatically delete expired and old verified OTPs
SELECT cron.schedule(
  'cleanup-expired-otps',
  '0 2 * * *', -- Daily at 2 AM UTC (cron format: minute hour day month weekday)
  $$SELECT public.cleanup_expired_otp_codes();$$
);

