# Investment System Updates - TODO List

## Overview
Complete overhaul of the investment system to implement:
- 10-level investment structure (Lv1-Lv10: 5k → 600k)
- 2x earnings cap system (auto-stops at double investment)
- 5% withdrawal fee (up from 1.5%)
- Withdrawal ladder system (progressive limits)
- Updated referral bonus structure
- Product differentiation (3 investment types)

---

## 📋 Configuration & Constants (3 tasks)

### ✅ Task 1: Update Investment Levels Configuration
- *File*: src/app/constants/projects.ts or new config file
- *Action*: Create 10 levels (Lv1-Lv10) with:
  - Stakes: [5k, 10k, 20k, 40k, 80k, 120k, 200k, 320k, 450k, 600k]
  - Daily ROI: [12%, 12.5%, 13%, 13.5%, 14%, 14.5%, 15%, 15.5%, 16%, 16.5%]
  - Hourly profits: [25, 52.1, 108.3, 225, 466.7, 725, 1,250, 2,066.7, 3,000, 4,125] XAF
  - Daily profits: [600, 1,250, 2,600, 5,400, 11,200, 17,400, 30,000, 49,600, 72,000, 99,000] XAF

### ✅ Task 2: Update Referral Bonus Calculations
- *File*: src/app/constants/projects.ts
- *Action*: Update referral commission rates:
  - Lv1: 26% (1,300 XAF on 5k investment)
  - Lv2: 30% (3,000 XAF on 10k investment)
  - Lv3: 32.5% (6,500 XAF on 20k investment)
  - Lv4+: 35% cap (14k, 28k, 42k, 70k, 112k, 157.5k, 210k)

### ✅ Task 3: Update Platform Fees
- *File*: src/app/constants/projects.ts
- *Action*: Change withdrawal fee from 1.5% to 5%
typescript
export const PLATFORM_FEES = {
  DEPOSIT: 0.01,      // 1%
  WITHDRAWAL: 0.05,   // 5% (updated from 0.015)
  PROJECT_MANAGEMENT: 0.015, // 1.5%
} as const


---

## 🗄 Database Migrations (3 tasks)

### ✅ Task 4: Add Earnings Cap Fields to Investments Table
- *File*: supabase/migrations/018_add_earnings_cap.sql
- *Action*: Add columns to investments table:
  - max_earnings_multiplier DECIMAL(3, 1) DEFAULT 2.0 (2x cap)
  - max_earnings_cap DECIMAL(15, 2) (calculated: amount * multiplier)
  - accumulated_earnings DECIMAL(15, 2) DEFAULT 0 (tracks daily earnings)
  - last_earnings_calculation TIMESTAMPTZ (tracks last daily calculation)

### ✅ Task 5: Add Withdrawal Tracking to Wallets Table
- *File*: supabase/migrations/019_add_withdrawal_tracking.sql
- *Action*: Add columns to wallets table:
  - withdrawal_count INTEGER DEFAULT 0 (tracks number of completed withdrawals)
  - last_withdrawal_at TIMESTAMPTZ (tracks last withdrawal timestamp)

### ✅ Task 6: Create Project Levels Table
- *File*: supabase/migrations/020_create_project_levels.sql
- *Action*: Create project_levels table:
sql
CREATE TABLE IF NOT EXISTS public.project_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  level_name TEXT NOT NULL, -- 'LV1', 'LV2', etc.
  price_xaf DECIMAL(15, 2) NOT NULL,
  hourly_return_xaf DECIMAL(15, 2) NOT NULL,
  daily_roi DECIMAL(5, 2) NOT NULL,
  max_earnings_multiplier DECIMAL(3, 1) DEFAULT 2.0,
  display_order INTEGER NOT NULL,
  tag TEXT, -- 'New', 'Popular', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, level_name)
);


---

## 🔧 Backend Logic Updates (8 tasks)

### ✅ Task 7: Update Investment Creation Logic
- *File*: src/app/api/projects/[id]/invest/route.ts
- *Action*: 
  - Calculate max_earnings_cap = amount * 2.0
  - Initialize accumulated_earnings = 0
  - Store both in investment record

### ✅ Task 8: Create Daily Earnings Calculation Service
- *File*: src/app/api/daily-rewards/route.ts or new src/app/api/investments/calculate-earnings/route.ts
- *Action*: 
  - Create cron job or scheduled function
  - For each active investment:
    - Calculate daily profit: amount * (daily_roi / 100)
    - Add to accumulated_earnings
    - Check if accumulated_earnings >= max_earnings_cap
    - If yes: Auto-complete investment, return principal + profit to wallet
    - Update last_earnings_calculation timestamp

### ✅ Task 9: Implement Withdrawal Ladder System
- *File*: src/app/api/wallet/withdraw/route.ts
- *Action*: Implement progressive withdrawal limits:
  - Withdrawal #1: min 2,500 XAF, max 5,000 XAF
  - Withdrawal #2: min 4,000 XAF, max 10,000 XAF
  - Withdrawal #3: min 10,000 XAF, max 20,000 XAF
  - Withdrawal #4: min 20,000 XAF, max 40,000 XAF
  - Withdrawal #5: min 40,000 XAF, max 100,000 XAF
  - Withdrawal #6+: min 40,000 XAF, max = 40% of balance OR highest active stake

### ✅ Task 10: Update Withdrawal Fee & Cooldown
- *File*: src/app/api/wallet/withdraw/route.ts
- *Action*:
  - Apply 5% fee: fee = amount * 0.05, net_amount = amount - fee
  - Enforce 48-hour cooldown: Check last_withdrawal_at, reject if < 48 hours ago
  - Update withdrawal_count and last_withdrawal_at on success

### ✅ Task 11: Update Referral Commission Calculation
- *File*: src/app/api/projects/[id]/invest/route.ts
- *Action*: 
  - Determine investment level based on amount
  - Apply appropriate referral percentage (26%, 30%, 32.5%, or 35% cap)
  - Calculate commission: amount * referral_rate

### ✅ Task 19: Update Projects API to Return Levels from Database
- *File*: src/app/api/projects/route.ts
- *Action*: 
  - Join project_levels table in query
  - Return levels from database instead of hardcoded PROJECT_LEVEL_OPTIONS
  - Format levels to match frontend structure

### ✅ Task 20: Create Admin Endpoint to Seed Project Levels
- *File*: src/app/api/admin/projects/[id]/levels/route.ts (new)
- *Action*: 
  - Create POST endpoint to seed project_levels for existing projects
  - Or create migration script to populate levels for all projects
  - Use the 10-level structure defined in Task 1

### ✅ Task 23: Update Daily Rewards to Respect 2x Cap
- *File*: src/app/api/daily-rewards/route.ts
- *Action*: 
  - Check accumulated_earnings before adding daily profit
  - Stop accumulation when cap is reached
  - Auto-complete investment when cap is hit

---

## 🎨 Frontend Updates (9 tasks)

### ✅ Task 12: Update Marketplace with All 10 Levels
- *File*: src/app/[locale]/marketplace/page.tsx
- *Action*: 
  - Remove hardcoded PROJECT_LEVEL_OPTIONS
  - Fetch levels from API (from database)
  - Display all 10 levels for each project category

### ✅ Task 13: Add Earnings Cap Progress to Project Cards
- *File*: src/app/components/marketplace/ProjectMarketCard.tsx
- *Action*: 
  - Display progress bar: "Earnings: 7,200 / 10,000 XAF (72% to cap)"
  - Show days remaining to reach cap
  - Visual indicator when cap is reached

### ✅ Task 14: Update Project Details Sheet
- *File*: src/app/components/marketplace/ProjectDetailsSheet.tsx
- *Action*: 
  - Show max_earnings_cap for selected level
  - Display accumulated_earnings progress
  - Calculate and show days remaining to reach cap
  - Add warning when approaching cap

### ✅ Task 15: Update Withdrawal Bottom Sheet
- *File*: src/app/components/wallet/WithdrawalBottomSheet.tsx
- *Action*: 
  - Display 5% fee calculation: "You'll receive: {amount - fee} XAF"
  - Show current withdrawal limit based on withdrawal_count
  - Display 48-hour cooldown countdown if applicable
  - Show next tier unlock info

### ✅ Task 16: Update Wallet Display
- *File*: src/app/[locale]/wallet/page.tsx or wallet components
- *Action*: 
  - Display withdrawal_count badge
  - Show next available withdrawal limit
  - Display time until next withdrawal allowed (if in cooldown)

### ✅ Task 17: Differentiate Investment Products
- *Files*: Multiple marketplace components
- *Action*: 
  - *Device Leasing*: Lv1-Lv4 (5k-40k), 7-10 day cycles, 12-13.5% daily ROI
  - *Retail Micro-Kits*: Lv5-Lv7 (80k-200k), 14-18 day cycles, 14-15% daily ROI
  - *Water Purification*: Lv8-Lv10 (320k-600k), 21-28 day cycles, 15.5-16.5% daily ROI
  - Update project cards to show category-specific characteristics

### ✅ Task 18: Update Marketplace ROI Display
- *File*: src/app/components/marketplace/ProjectMarketCard.tsx
- *Action*: 
  - Show different ROI ranges per category
  - Display cycle duration prominently
  - Add category-specific badges/tags

### ✅ Task 21: Allow Multiple Simultaneous Levels
- *Files*: Investment display components
- *Action*: 
  - Remove any single-level restrictions
  - Allow users to invest in multiple levels of same project
  - Show all active investments grouped by project

### ✅ Task 22: Add Cap Reached Visual Indicators
- *Files*: Investment cards, dashboard components
- *Action*: 
  - Add badge: "Cap Reached - Ready to Withdraw"
  - Highlight investments that have reached cap
  - Add notification when cap is reached

---

## 🧪 Testing (1 task)

### ✅ Task 24: Comprehensive Testing
- *Action*: Verify all functionality:
  - ✅ Investment creation with new level structure
  - ✅ Daily earnings accumulation
  - ✅ 2x cap enforcement (stops at double)
  - ✅ Auto-completion when cap is reached
  - ✅ Withdrawal ladder limits
  - ✅ 5% fee calculation
  - ✅ 48-hour cooldown enforcement
  - ✅ Referral bonus calculations
  - ✅ Multiple simultaneous investments
  - ✅ Frontend displays all data correctly

---

## 📊 Level Structure Reference

| Level | Stake (XAF) | Daily ROI | Daily Profit | Hourly Profit | Referral Bonus |
|-------|-------------|-----------|--------------|---------------|----------------|
| Lv1   | 5,000       | 12.0%     | 600          | 25.0          | 1,300 (26%)    |
| Lv2   | 10,000      | 12.5%     | 1,250        | 52.1          | 3,000 (30%)    |
| Lv3   | 20,000      | 13.0%     | 2,600        | 108.3         | 6,500 (32.5%)  |
| Lv4   | 40,000      | 13.5%     | 5,400        | 225.0         | 14,000 (35%)   |
| Lv5   | 80,000      | 14.0%     | 11,200       | 466.7         | 28,000 (35%)   |
| Lv6   | 120,000     | 14.5%     | 17,400       | 725.0         | 42,000 (35%)   |
| Lv7   | 200,000     | 15.0%     | 30,000       | 1,250.0       | 70,000 (35%)   |
| Lv8   | 320,000     | 15.5%     | 49,600       | 2,066.7       | 112,000 (35%)  |
| Lv9   | 450,000     | 16.0%     | 72,000       | 3,000.0       | 157,500 (35%)  |
| Lv10  | 600,000     | 16.5%     | 99,000       | 4,125.0       | 210,000 (35%)  |

*Earnings Cap*: All levels use 2x multiplier (double your investment)

---

## 🚀 Implementation Order

1. *Phase 1: Database & Constants* (Tasks 1-6)
   - Update constants
   - Create migrations
   - Seed initial data

2. *Phase 2: Backend Core Logic* (Tasks 7-11, 19-20, 23)
   - Investment creation
   - Earnings calculation
   - Withdrawal system
   - Referral updates

3. *Phase 3: Frontend Updates* (Tasks 12-18, 21-22)
   - Marketplace updates
   - Component enhancements
   - UI/UX improvements

4. *Phase 4: Testing* (Task 24)
   - Comprehensive testing
   - Bug fixes
   - Final polish

---

*Total Tasks*: 24
*Estimated Completion*: After green light approval