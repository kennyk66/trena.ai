-- PRD #0004: Lead Prioritization - Database Schema
-- This migration adds priority scoring fields to researched_leads and creates supporting tables

-- Add priority fields to researched_leads table
ALTER TABLE researched_leads ADD COLUMN priority_score INTEGER DEFAULT 0;
ALTER TABLE researched_leads ADD COLUMN priority_level TEXT;
ALTER TABLE researched_leads ADD COLUMN buying_signal_score INTEGER DEFAULT 0;
ALTER TABLE researched_leads ADD COLUMN fit_score INTEGER DEFAULT 0;
ALTER TABLE researched_leads ADD COLUMN signal_breakdown JSONB DEFAULT '[]';
ALTER TABLE researched_leads ADD COLUMN last_scored_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE researched_leads ADD COLUMN last_rescored_at TIMESTAMPTZ;

-- Add constraint for priority_level
ALTER TABLE researched_leads ADD CONSTRAINT check_priority_level
  CHECK (priority_level IN ('high', 'medium', 'low'));

-- Add index for priority queries (fast filtering and sorting)
CREATE INDEX idx_priority ON researched_leads(user_id, priority_level, priority_score DESC);

-- Create daily_focus table for Today's Focus list
CREATE TABLE daily_focus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  focus_date DATE NOT NULL,
  lead_ids JSONB NOT NULL DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, focus_date)
);

-- Create index for daily focus queries
CREATE INDEX idx_daily_focus_user_date ON daily_focus(user_id, focus_date DESC);

-- Enable RLS on daily_focus
ALTER TABLE daily_focus ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_focus
CREATE POLICY "Users can view own daily focus"
  ON daily_focus
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily focus"
  ON daily_focus
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily focus"
  ON daily_focus
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create lead_actions table for tracking user interactions
CREATE TABLE lead_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES researched_leads(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT CHECK (action_type IN ('contacted', 'viewed', 'added_to_focus', 'generated_outreach')) NOT NULL,
  action_date TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Add index for lead actions queries
CREATE INDEX idx_lead_actions ON lead_actions(lead_id, action_type, action_date DESC);
CREATE INDEX idx_user_actions ON lead_actions(user_id, action_date DESC);

-- Enable RLS on lead_actions
ALTER TABLE lead_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_actions
CREATE POLICY "Users can view own lead actions"
  ON lead_actions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lead actions"
  ON lead_actions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON COLUMN researched_leads.priority_score IS 'Combined priority score (0-14): buying_signal_score + fit_score';
COMMENT ON COLUMN researched_leads.priority_level IS 'Priority category: high (6+), medium (3-5), low (0-2)';
COMMENT ON COLUMN researched_leads.buying_signal_score IS 'Points from buying signals (0-10)';
COMMENT ON COLUMN researched_leads.fit_score IS 'Points from target buyer fit (0-4)';
COMMENT ON COLUMN researched_leads.signal_breakdown IS 'Array of signals with point values for transparency';
COMMENT ON COLUMN researched_leads.last_scored_at IS 'When priority was first calculated';
COMMENT ON COLUMN researched_leads.last_rescored_at IS 'When priority was last re-calculated';

COMMENT ON TABLE daily_focus IS 'Daily generated list of top 5 priority leads for each user';
COMMENT ON COLUMN daily_focus.lead_ids IS 'Array of researched_lead IDs in priority order';

COMMENT ON TABLE lead_actions IS 'Tracks user interactions with leads for analytics and focus generation';
COMMENT ON COLUMN lead_actions.action_type IS 'Type of action: contacted, viewed, added_to_focus, generated_outreach';
