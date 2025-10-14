-- Trena.ai Onboarding Schema Migration
-- PRD #0002: Onboarding & Profile Learning
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/lczvmzramidwoquaqcdt/sql

-- ============================================================================
-- 1. Extend user_profiles table with onboarding fields
-- ============================================================================

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS sales_quota TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS motivators JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS motivators_other TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS selling_style TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS target_industries JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS target_roles JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS target_region TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS sales_motion TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.motivators IS 'Array of motivators (e.g., ["Hitting quota", "Getting promoted"])';
COMMENT ON COLUMN user_profiles.target_industries IS 'Array of target industries (e.g., ["Technology/SaaS", "Healthcare"])';
COMMENT ON COLUMN user_profiles.target_roles IS 'Array of target buyer roles (e.g., ["CEO", "VP Sales"])';

-- ============================================================================
-- 2. Create quick_win_leads table
-- ============================================================================

CREATE TABLE IF NOT EXISTS quick_win_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  lead_name TEXT NOT NULL,
  job_title TEXT,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  company_size TEXT,
  industry TEXT,
  source TEXT DEFAULT 'lusha',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE quick_win_leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own leads" ON quick_win_leads;
DROP POLICY IF EXISTS "Users can insert own leads" ON quick_win_leads;

-- Policy: Users can view their own leads
CREATE POLICY "Users can view own leads"
  ON quick_win_leads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own leads
CREATE POLICY "Users can insert own leads"
  ON quick_win_leads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_quick_win_leads_user_id ON quick_win_leads(user_id);

-- ============================================================================
-- 3. Create placeholder tables for future integrations
-- ============================================================================

-- API Credentials (for storing encrypted API keys - future use)
CREATE TABLE IF NOT EXISTS api_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL, -- 'lusha', 'apollo', 'clearbit', etc.
  credentials_encrypted TEXT, -- Store encrypted JSON
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE api_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own api credentials" ON api_credentials;
CREATE POLICY "Users can manage own api credentials"
  ON api_credentials
  FOR ALL
  USING (auth.uid() = user_id);

-- Email Accounts (for email integration - future use)
CREATE TABLE IF NOT EXISTS email_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  email_provider TEXT NOT NULL, -- 'gmail', 'outlook', etc.
  email_address TEXT NOT NULL,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own email accounts" ON email_accounts;
CREATE POLICY "Users can manage own email accounts"
  ON email_accounts
  FOR ALL
  USING (auth.uid() = user_id);

-- CRM Accounts (for CRM integration - future use)
CREATE TABLE IF NOT EXISTS crm_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  crm_provider TEXT NOT NULL, -- 'salesforce', 'hubspot', 'pipedrive', etc.
  account_id TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE crm_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own crm accounts" ON crm_accounts;
CREATE POLICY "Users can manage own crm accounts"
  ON crm_accounts
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. Add indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_completed
  ON user_profiles(onboarding_completed);

CREATE INDEX IF NOT EXISTS idx_api_credentials_user_id
  ON api_credentials(user_id);

CREATE INDEX IF NOT EXISTS idx_email_accounts_user_id
  ON email_accounts(user_id);

CREATE INDEX IF NOT EXISTS idx_crm_accounts_user_id
  ON crm_accounts(user_id);

-- ============================================================================
-- 5. Update trigger to set updated_at timestamp
-- ============================================================================

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to api_credentials
DROP TRIGGER IF EXISTS update_api_credentials_updated_at ON api_credentials;
CREATE TRIGGER update_api_credentials_updated_at
  BEFORE UPDATE ON api_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Next steps:
-- 1. Verify all tables exist: SELECT * FROM user_profiles LIMIT 1;
-- 2. Test RLS policies work correctly
-- 3. Update your TypeScript types to match new schema
