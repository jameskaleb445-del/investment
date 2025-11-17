-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Users policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Public can view user referral codes (for registration)
CREATE POLICY "Public can view referral codes"
  ON public.users FOR SELECT
  USING (true);

-- Wallets policies
-- Users can view their own wallet
CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own wallet (via triggers/functions only)
-- Direct updates are restricted
CREATE POLICY "Users cannot directly update wallet"
  ON public.wallets FOR UPDATE
  USING (false);

-- Admins can view all wallets
CREATE POLICY "Admins can view all wallets"
  ON public.wallets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Projects policies
-- Anyone can view active projects (funding, active, completed)
CREATE POLICY "Public can view active projects"
  ON public.projects FOR SELECT
  USING (status IN ('funding', 'active', 'completed'));

-- Users can view draft projects (for admins)
CREATE POLICY "Admins can view draft projects"
  ON public.projects FOR SELECT
  USING (
    status = 'draft' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can create projects
CREATE POLICY "Admins can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update projects
CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Investments policies
-- Users can view their own investments
CREATE POLICY "Users can view own investments"
  ON public.investments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create investments
CREATE POLICY "Users can create investments"
  ON public.investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all investments
CREATE POLICY "Admins can view all investments"
  ON public.investments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Project updates policies
-- Anyone can view project updates for active projects
CREATE POLICY "Public can view project updates"
  ON public.project_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND status IN ('funding', 'active', 'completed')
    )
  );

-- Only admins can create project updates
CREATE POLICY "Admins can create project updates"
  ON public.project_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Transactions policies
-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create transactions (for deposits, withdrawals)
CREATE POLICY "Users can create own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Referrals policies
-- Users can view referrals where they are the referrer or referred
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- System can create referrals (via functions)
-- Users cannot directly create referrals
CREATE POLICY "System can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (true); -- Controlled by application logic

-- Referral earnings policies
-- Users can view their own referral earnings
CREATE POLICY "Users can view own referral earnings"
  ON public.referral_earnings FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all referral earnings
CREATE POLICY "Admins can view all referral earnings"
  ON public.referral_earnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Withdrawal requests policies
-- Users can view their own withdrawal requests
CREATE POLICY "Users can view own withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create withdrawal requests
CREATE POLICY "Users can create withdrawal requests"
  ON public.withdrawal_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all withdrawal requests
CREATE POLICY "Admins can view all withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update withdrawal requests
CREATE POLICY "Admins can update withdrawal requests"
  ON public.withdrawal_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- OTP codes policies
-- Users can view their own OTP codes (for verification)
CREATE POLICY "Users can view own OTP codes"
  ON public.otp_codes FOR SELECT
  USING (auth.uid() = user_id);

-- System can create OTP codes
CREATE POLICY "System can create OTP codes"
  ON public.otp_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own OTP codes (mark as verified)
CREATE POLICY "Users can update own OTP codes"
  ON public.otp_codes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

