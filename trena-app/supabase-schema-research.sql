-- PRD #0003: Buyer Research Agent - Database Schema
-- This migration creates the researched_leads table for storing AI-powered prospect research

-- Create researched_leads table
CREATE TABLE researched_leads (
  -- Primary key and user reference
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,

  -- Research metadata
  research_method TEXT CHECK (research_method IN ('manual', 'csv', 'crm')),
  source TEXT DEFAULT 'lusha',

  -- Person data
  person_name TEXT,
  person_email TEXT,
  person_phone TEXT,
  person_linkedin TEXT,
  person_title TEXT,
  person_seniority TEXT,
  person_location TEXT,

  -- Company data
  company_name TEXT,
  company_domain TEXT,
  company_industry TEXT,
  company_size TEXT,
  company_revenue TEXT,
  company_location TEXT,
  company_description TEXT,

  -- Rich data stored as JSONB
  tech_stack JSONB DEFAULT '[]',
  work_history JSONB DEFAULT '[]',
  buying_signals JSONB DEFAULT '[]',
  ai_persona JSONB,

  -- Timestamps
  researched_at TIMESTAMPTZ DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_researched_leads_user_researched ON researched_leads(user_id, researched_at DESC);
CREATE INDEX idx_researched_leads_company ON researched_leads(company_name);
CREATE INDEX idx_researched_leads_person ON researched_leads(person_name);
CREATE INDEX idx_researched_leads_email ON researched_leads(person_email);

-- Enable Row Level Security
ALTER TABLE researched_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own researched leads
CREATE POLICY "Users can view own researched leads"
  ON researched_leads
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own researched leads
CREATE POLICY "Users can insert own researched leads"
  ON researched_leads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own researched leads
CREATE POLICY "Users can update own researched leads"
  ON researched_leads
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own researched leads
CREATE POLICY "Users can delete own researched leads"
  ON researched_leads
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_researched_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
CREATE TRIGGER researched_leads_updated_at
  BEFORE UPDATE ON researched_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_researched_leads_updated_at();

-- Comments for documentation
COMMENT ON TABLE researched_leads IS 'Stores AI-powered prospect research data from Lusha API and persona generation';
COMMENT ON COLUMN researched_leads.research_method IS 'How the lead was researched: manual, csv, or crm';
COMMENT ON COLUMN researched_leads.source IS 'Data source, currently only lusha';
COMMENT ON COLUMN researched_leads.tech_stack IS 'Array of technologies the company uses (from Lusha)';
COMMENT ON COLUMN researched_leads.work_history IS 'Array of previous roles and companies';
COMMENT ON COLUMN researched_leads.buying_signals IS 'Array of buying signals (funding, hiring, growth indicators)';
COMMENT ON COLUMN researched_leads.ai_persona IS 'AI-generated buyer persona with pain points, talk tracks, conversation starters';
COMMENT ON COLUMN researched_leads.last_viewed_at IS 'Last time user viewed this lead detail page';
