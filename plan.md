# Rapid-Return Asset Investment Platform - Implementation Plan

## Project Overview

Next.js 15 web platform using Supabase backend for crowd-investing in physical, income-generating assets with short-term profit cycles (5-21 days). Features include project marketplace, wallet system, multi-level referrals, and comprehensive admin tools.

## Phase 1: Project Foundation & Dependencies

### 1.1 Install Core Dependencies

- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Server-side Supabase helpers for Next.js
- `zod` - Schema validation
- `react-hook-form` + `@hookform/resolvers` - Form handling
- `date-fns` - Date utilities
- `recharts` or `chart.js` - Charts for dashboard
- `sharp` or `next/image` - Image optimization for project photos

### 1.2 Configure Environment Variables

- Create `.env.local` template with Supabase URL, anon key, SMS gateway credentials, Mobile Money API keys
- Add `.env.example` for reference

### 1.3 Tailwind CSS Configuration

- Configure Tailwind v4 with custom theme
- Set up color scheme, typography, and component styles

## Phase 2: Supabase Database Schema

### 2.1 Create Supabase Migration Files

Create initial migration with tables:

- `users` - Extended user profiles (phone, full_name, referrer_id, referral_code, created_at, role)
- `wallets` - User wallet balances (user_id, balance, invested_amount, pending_withdrawal, total_earnings)
- `projects` - Asset/project listings (id, name, category, description, location, goal_amount, funded_amount, min_investment, max_investment, duration_days, estimated_roi, payout_schedule, status, images[], created_at, cycle_start_date, cycle_end_date, admin_id)
- `investments` - Project-based investments (id, user_id, project_id, amount, invested_date, expected_return, actual_return, payout_date, status)
- `project_updates` - Status updates and photos for projects (id, project_id, update_text, images[], created_at, admin_id)
- `transactions` - All financial transactions (id, user_id, type, amount, status, payment_method, reference, project_id, created_at)
- `referrals` - Referral relationships (id, referrer_id, referred_id, level, created_at)
- `referral_earnings` - Commission tracking (id, user_id, referral_id, amount, level, transaction_id, created_at)
- `withdrawal_requests` - Withdrawal requests (id, user_id, amount, status, admin_notes, pin_verified, otp_verified, created_at)
- `otp_codes` - OTP storage (id, user_id, code, type, expires_at, verified)

### 2.2 Set Up Row Level Security (RLS)

- Policies for users to access only their own data
- Public read access for active projects
- Admin policies for full access
- Public policies for registration/login endpoints

### 2.3 Database Functions & Triggers

- Function to calculate referral commissions on deposits/investments
- Trigger to update wallet balance on transaction completion
- Function to calculate project funding progress
- Function to process project completion and distribute payouts
- Trigger to update project status when funding goal reached

## Phase 3: Authentication System

### 3.1 Supabase Auth Setup

- Configure Supabase Auth providers (phone/email)
- Set up phone/email authentication flow
- Create middleware for protected routes

### 3.2 Auth Components

- `app/components/auth/LoginForm.tsx` - Login with phone/email
- `app/components/auth/RegisterForm.tsx` - Registration with referral code
- `app/components/auth/OTPInput.tsx` - OTP verification component
- `app/components/auth/PINInput.tsx` - PIN setup/verification

### 3.3 Auth Context & Hooks

- `app/contexts/AuthContext.tsx` - Global auth state
- `app/hooks/useAuth.ts` - Auth hook for components
- `app/hooks/useSession.ts` - Session management

### 3.4 Auth API Routes

- `app/api/auth/register/route.ts` - User registration with referral tracking
- `app/api/auth/login/route.ts` - User login
- `app/api/auth/verify-otp/route.ts` - OTP verification
- `app/api/auth/setup-pin/route.ts` - PIN setup
- `app/api/auth/verify-pin/route.ts` - PIN verification

## Phase 4: Wallet & Transaction System

### 4.1 Wallet Components

- `app/components/dashboard/WalletSummary.tsx` - Balance display
- `app/components/dashboard/TransactionHistory.tsx` - Transaction list
- `app/components/dashboard/DepositModal.tsx` - Deposit form
- `app/components/dashboard/WithdrawalModal.tsx` - Withdrawal form

### 4.2 Wallet API Routes

- `app/api/wallet/balance/route.ts` - Get wallet balance
- `app/api/wallet/deposit/route.ts` - Initiate deposit (Mobile Money)
- `app/api/wallet/withdraw/route.ts` - Request withdrawal (with PIN/OTP)
- `app/api/transactions/route.ts` - Get transaction history
- `app/api/transactions/[id]/route.ts` - Get transaction details

### 4.3 Mobile Money Integration

- `app/lib/mobile-money/orange-money.ts` - Orange Money API client
- `app/lib/mobile-money/mtn-money.ts` - MTN Mobile Money API client
- `app/lib/mobile-money/types.ts` - Mobile Money type definitions
- Implement webhook handlers for payment callbacks

### 4.4 Transaction Processing

- Background job/server action to process completed deposits
- Automatic referral commission calculation on deposit/investment confirmation
- Wallet balance updates on transaction status change

## Phase 5: Project Marketplace & Investment System

### 5.1 Project Constants

- `app/constants/projects.ts` - Project categories (Device Leasing, Retail Micro-Kits, Water Purification, Farm Equipment, Logistics Vehicles, Event Furniture, Ad/Sign Boards), status types, investment limits

### 5.2 Marketplace Components

- `app/components/marketplace/ProjectCard.tsx` - Individual project listing card with funding progress bar
- `app/components/marketplace/ProjectGrid.tsx` - Grid view of available projects
- `app/components/marketplace/ProjectFilters.tsx` - Filter by category, status, duration
- `app/components/marketplace/ProjectDetail.tsx` - Full project details page with updates gallery
- `app/components/marketplace/InvestModal.tsx` - Investment form with amount validation (min/max per project)
- `app/components/marketplace/FundingProgress.tsx` - Progress bar showing funded_amount/goal_amount
- `app/components/marketplace/ProjectUpdates.tsx` - Timeline of project updates/photos

### 5.3 Project API Routes

- `app/api/projects/route.ts` - List all projects (with filters: category, status, duration), create new project (admin)
- `app/api/projects/[id]/route.ts` - Get project details, update project (admin)
- `app/api/projects/[id]/invest/route.ts` - Create investment in project (validates min/max, funding availability)
- `app/api/projects/[id]/updates/route.ts` - Get/add project updates (admin for add)
- `app/api/projects/[id]/funding/route.ts` - Get real-time funding progress (WebSocket/SSE ready)
- `app/api/investments/route.ts` - Get user's investments across all projects
- `app/api/investments/[id]/route.ts` - Get specific investment details
- `app/api/investments/mature/route.ts` - Process completed project cycles and payouts (admin/cron)

### 5.4 Investment Logic

- Server action to invest in project (validates funding goal, min/max limits, wallet balance)
- Real-time funding progress updates using Supabase subscriptions
- Automatic project status transitions: `draft` → `funding` → `active` → `completed`
- When funding goal reached, project moves to `active` phase automatically
- Scheduled job/cron to check and complete project cycles daily (based on cycle_end_date)
- Automatic ROI calculation and payout distribution to investors based on project completion
- Support for project cycling (same asset can have multiple investment cycles)
- Profit distribution: (project_income - platform_fee) distributed proportionally to investors

## Phase 6: Referral System

### 6.1 Referral Components

- `app/components/dashboard/ReferralTree.tsx` - Visual referral tree showing 3 levels
- `app/components/dashboard/ReferralStats.tsx` - Commission earnings display
- `app/components/dashboard/ReferralCode.tsx` - Share referral code component with copy link

### 6.2 Referral API Routes

- `app/api/referrals/code/route.ts` - Get user referral code
- `app/api/referrals/tree/route.ts` - Get referral tree structure (3 levels deep)
- `app/api/referrals/earnings/route.ts` - Get referral commission history

### 6.3 Referral Logic

- Automatic referral relationship creation on registration (if referral_code provided)
- Multi-level commission calculation: Level 1 (10%), Level 2 (5%), Level 3 (2%)
- Commission triggered on deposits and investments (not just deposits)
- Commission payout to referrer wallets immediately upon investment confirmation

## Phase 7: Dashboard & Marketplace UI

### 7.1 Layout Components

- `app/components/layout/Navbar.tsx` - Top navigation with marketplace link, wallet balance
- `app/components/layout/Sidebar.tsx` - Sidebar navigation (dashboard, marketplace, referrals, transactions)
- `app/components/layout/Footer.tsx` - Footer component
- Update `app/layout.tsx` - Main app layout with auth protection

### 7.2 Dashboard Page

- `app/page.tsx` - Main dashboard with wallet summary, active investments, referrals
- Responsive grid layout
- Real-time balance updates
- Quick links to marketplace

### 7.3 Marketplace Page

- `app/marketplace/page.tsx` - Browse all available projects
- Filter by category, status (funding, active), duration
- Sort by funding progress, ROI, duration
- Search functionality

### 7.4 Project Detail Page

- `app/marketplace/[id]/page.tsx` - Full project details
- Investment form with real-time funding progress
- Project updates gallery with photos
- Location display (if applicable)
- Investment history for this project

### 7.5 UI Components

- `app/components/ui/Button.tsx` - Reusable button component
- `app/components/ui/Input.tsx` - Form input component
- `app/components/ui/Modal.tsx` - Modal component
- `app/components/ui/Notification.tsx` - Toast notifications
- `app/components/ui/Card.tsx` - Card component
- `app/components/ui/Badge.tsx` - Status badges for projects (funding, active, completed)
- `app/components/ui/ProgressBar.tsx` - Funding progress indicator

### 7.6 Charts

- `app/components/charts/EarningsChart.tsx` - Earnings over time
- `app/components/charts/ReferralStatsChart.tsx` - Referral performance
- `app/components/charts/InvestmentHistoryChart.tsx` - Investment performance by project

## Phase 8: Admin System

### 8.1 Admin Components

- `app/components/admin/Dashboard.tsx` - Admin overview with platform stats
- `app/components/admin/UsersList.tsx` - User management
- `app/components/admin/WithdrawalApprovals.tsx` - Withdrawal approval interface
- `app/components/admin/ProjectManager.tsx` - List all projects with status
- `app/components/admin/ProjectEditor.tsx` - Project form with media upload (images)
- `app/components/admin/ProjectUpdateForm.tsx` - Add status updates/photos to projects
- `app/components/admin/ProjectPayouts.tsx` - Process project completion and payouts

### 8.2 Admin Pages

- `app/admin/page.tsx` - Admin dashboard
- `app/admin/projects/page.tsx` - Manage all projects
- `app/admin/projects/new/page.tsx` - Create new project
- `app/admin/projects/[id]/page.tsx` - Edit project and manage updates
- `app/admin/withdrawals/page.tsx` - Approve withdrawals
- `app/admin/users/page.tsx` - User management

### 8.3 Admin API Routes

- `app/api/admin/users/route.ts` - List all users
- `app/api/admin/withdrawals/route.ts` - Approve/reject withdrawals
- `app/api/admin/transactions/route.ts` - View all transactions
- `app/api/admin/stats/route.ts` - Platform statistics (total users, investments, revenue)
- `app/api/admin/projects/route.ts` - Create/update projects
- `app/api/admin/projects/[id]/complete/route.ts` - Mark project as completed and trigger payouts
- `app/api/admin/projects/[id]/updates/route.ts` - Add project status updates with image uploads

### 8.4 Admin Middleware

- Role-based access control for admin routes
- Admin role check in API routes (users.role = 'admin')

## Phase 9: Security & Validation

### 9.1 Validation Schemas

- `app/validation/auth.ts` - Auth form validation
- `app/validation/wallet.ts` - Transaction validation
- `app/validation/projects.ts` - Project creation/update validation
- `app/validation/investments.ts` - Investment amount validation

### 9.2 Security Middleware

- `app/middleware.ts` - Route protection, auth checks
- Rate limiting for API routes
- Transaction limits enforcement
- PIN/OTP verification for sensitive actions

### 9.3 SMS OTP Service

- `app/lib/sms/client.ts` - SMS gateway integration (Africa's Talking, Twilio, etc.)
- `app/lib/sms/otp.ts` - OTP generation and verification
- Store OTP in Supabase `otp_codes` table with expiration

## Phase 10: Utilities & Helpers

### 10.1 Utility Functions

- `app/utils/format.ts` - Currency formatting (XAF), number formatting
- `app/utils/date.ts` - Date formatting utilities, cycle duration calculations
- `app/utils/validation.ts` - Common validators

### 10.2 Types & Models

- `app/models/User.ts` - User type definitions
- `app/models/Wallet.ts` - Wallet type definitions
- `app/models/Project.ts` - Project type definitions
- `app/models/Investment.ts` - Investment type definitions
- `app/models/Transaction.ts` - Transaction type definitions

### 10.3 Supabase Client

- `app/lib/supabase/client.ts` - Browser Supabase client
- `app/lib/supabase/server.ts` - Server-side Supabase client

## Phase 11: Testing & Polish

### 11.1 Error Handling

- Global error boundary
- API error handling
- User-friendly error messages

### 11.2 Loading States

- Skeleton loaders for project cards
- Loading spinners
- Optimistic UI updates for investments

### 11.3 Responsive Design

- Mobile-first approach
- Tablet and desktop layouts
- Touch-friendly interactions

## Implementation Notes

- All API routes use Next.js App Router API routes
- Server actions for mutations where appropriate
- Real-time updates using Supabase subscriptions for balance changes, funding progress, project status
- Transaction fees: 1% deposit fee, 1.5% withdrawal fee
- Platform management fee: 1-2% of project income (deducted before profit distribution)
- Investment model: Project-based with rapid cycles (5-21 days typical, configurable per project)
- Project categories: Device Leasing, Retail Micro-Kits, Water Purification, Farm Equipment, Logistics Vehicles, Event Furniture, Ad/Sign Boards (extensible via database)
- Project lifecycle: `draft` → `funding` → `active` → `completed` → (can cycle back to `funding` for same asset)
- Funding validation: Projects must reach goal_amount before moving to `active` status
- Payout schedule: Automatic distribution on project completion, or as specified per project (e.g., weekly, daily)
- Referral commissions: Level 1 (10%), Level 2 (5%), Level 3 (2%) on deposits and investments
- Minimum/maximum investment validation: Enforced per project (min_investment, max_investment fields)
- Project updates: Admin can post text updates, photos (stored in Supabase Storage), status changes visible to all investors
- Image uploads: Use Supabase Storage for project images and update photos

## Files to Create (Key Highlights)

Main directories:

- `app/api/` - All API routes (auth, wallet, projects, investments, referrals, admin)
- `app/components/` - All React components (auth, dashboard, marketplace, ui, layout, charts, admin)
- `app/constants/` - Project categories, status types, referral rates
- `app/contexts/` - React contexts (AuthContext, ProjectContext)
- `app/hooks/` - Custom hooks (useAuth, useProjects, useInvestments, useWallet)
- `app/lib/` - Utilities and clients (Supabase, Mobile Money, SMS)
- `app/models/` - TypeScript types (User, Wallet, Project, Investment, Transaction)
- `app/validation/` - Zod schemas (auth, wallet, projects, investments)
- `app/marketplace/` - Marketplace pages (list, detail views)
- `app/admin/` - Admin panel pages
- `supabase/migrations/` - Database migrations