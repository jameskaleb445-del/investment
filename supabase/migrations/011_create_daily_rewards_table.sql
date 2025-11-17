-- Create daily_rewards table to track daily reward claims
CREATE TABLE IF NOT EXISTS public.daily_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  claim_date DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  streak INTEGER NOT NULL DEFAULT 1 CHECK (streak >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, claim_date)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_id ON public.daily_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_claim_date ON public.daily_rewards(claim_date);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_date ON public.daily_rewards(user_id, claim_date DESC);

-- Enable Row Level Security
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own daily rewards"
  ON public.daily_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily rewards"
  ON public.daily_rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow system to insert daily rewards (from API)
CREATE POLICY "System can create daily rewards"
  ON public.daily_rewards FOR INSERT
  WITH CHECK (true);

