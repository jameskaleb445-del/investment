# Authentication Setup Guide

This guide will help you set up Supabase authentication with Google OAuth for the investment platform.

## Prerequisites

1. A Supabase account and project
2. A Google Cloud Console project with OAuth credentials

## Step 1: Supabase Setup

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Google** provider
4. You'll need to configure Google OAuth credentials (see Step 2)

## Step 2: Google OAuth Setup

### 2.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Choose **Web application** as the application type
6. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://your-domain.com/auth/callback`
   - **Important**: Also add the Supabase callback URL:
     - `https://your-project-ref.supabase.co/auth/v1/callback`

### 2.2 Configure Supabase

1. In your Supabase dashboard, go to **Authentication** > **Providers** > **Google**
2. Enter your **Client ID** and **Client Secret** from Google Cloud Console
3. Save the configuration

## Step 3: Environment Variables

Create a `.env.local` file in the root of your project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Note: Google OAuth credentials are configured in Supabase dashboard,
# not in environment variables for this setup
```

You can find these values in your Supabase project settings:
- **Project URL**: Settings > API > Project URL
- **Anon Key**: Settings > API > Project API keys > anon/public

## Step 4: Database Setup

Make sure you have run the database migrations:

```bash
# If using Supabase CLI
supabase db push

# Or apply migrations manually in Supabase SQL Editor
```

The migrations should create:
- `users` table (extends auth.users)
- `wallets` table
- Other necessary tables

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login`
3. Click the **Google** button
4. You should be redirected to Google's OAuth consent screen
5. After authentication, you'll be redirected back to your app

## Troubleshooting

### Issue: "redirect_uri_mismatch" error

**Solution**: Make sure you've added both callback URLs:
- Your app's callback: `http://localhost:3000/auth/callback`
- Supabase's callback: `https://your-project-ref.supabase.co/auth/v1/callback`

### Issue: User not created in public.users table

**Solution**: Set up a database trigger to automatically create a user profile when a user signs up. Add this to your Supabase SQL Editor:

```sql
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Create wallet for new user
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Issue: Middleware blocking routes

**Solution**: Check that your middleware is correctly configured. Protected routes are:
- `/wallet`
- `/profile`
- `/referrals`
- `/marketplace`

Public routes (no auth required):
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-otp`

## Next Steps

After setting up authentication:

1. Test the complete flow: sign up → verify email → sign in
2. Test Google OAuth flow
3. Test protected routes (should redirect to login if not authenticated)
4. Set up email templates in Supabase dashboard (optional)
5. Configure additional OAuth providers if needed (Apple, etc.)

## Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- Regularly rotate your API keys
- Enable Row Level Security (RLS) policies in Supabase
- Review and test your RLS policies regularly



