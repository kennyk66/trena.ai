-- PRD #0005: Personalized Outreach Generation - Database Schema
-- This migration creates tables for AI-generated outreach messages

-- Create outreach_messages table
CREATE TABLE outreach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES researched_leads(id) ON DELETE CASCADE NOT NULL,
  message_type TEXT CHECK (message_type IN ('email', 'linkedin', 'call_script')) NOT NULL,
  subject TEXT, -- For emails only
  generated_content TEXT NOT NULL,
  edited_content TEXT,
  final_content TEXT,
  tone TEXT CHECK (tone IN ('warm', 'direct', 'formal', 'casual')) NOT NULL DEFAULT 'warm',
  coaching_applied BOOLEAN DEFAULT FALSE,
  coaching_score INTEGER DEFAULT 0 CHECK (coaching_score >= 0 AND coaching_score <= 100),
  status TEXT CHECK (status IN ('draft', 'sent', 'opened', 'clicked', 'replied')) NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for outreach_messages
CREATE INDEX idx_outreach_user_lead ON outreach_messages(user_id, lead_id, created_at DESC);
CREATE INDEX idx_outreach_user_status ON outreach_messages(user_id, status, created_at DESC);
CREATE INDEX idx_outreach_user_type ON outreach_messages(user_id, message_type, created_at DESC);

-- Create message_events table for tracking (opens, clicks, replies)
CREATE TABLE message_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES outreach_messages(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT CHECK (event_type IN ('sent', 'opened', 'clicked', 'replied', 'bounced')) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Add indexes for message_events
CREATE INDEX idx_events_message ON message_events(message_id, event_type, timestamp DESC);
CREATE INDEX idx_events_type_time ON message_events(event_type, timestamp DESC);

-- Enable RLS on outreach_messages
ALTER TABLE outreach_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for outreach_messages
CREATE POLICY "Users can view own messages"
  ON outreach_messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON outreach_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
  ON outreach_messages
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON outreach_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on message_events
ALTER TABLE message_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_events
CREATE POLICY "Users can view events for own messages"
  ON message_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM outreach_messages
      WHERE outreach_messages.id = message_events.message_id
      AND outreach_messages.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert message events"
  ON message_events
  FOR INSERT
  WITH CHECK (TRUE); -- Events can be created by system/webhooks

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_outreach_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER outreach_messages_updated_at
  BEFORE UPDATE ON outreach_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_outreach_updated_at();

-- Comments for documentation
COMMENT ON TABLE outreach_messages IS 'AI-generated outreach messages (email, LinkedIn, call scripts)';
COMMENT ON COLUMN outreach_messages.generated_content IS 'Original AI-generated content';
COMMENT ON COLUMN outreach_messages.edited_content IS 'User-edited version (if modified)';
COMMENT ON COLUMN outreach_messages.final_content IS 'Final version sent/copied (edited_content or generated_content)';
COMMENT ON COLUMN outreach_messages.coaching_applied IS 'Whether user applied coaching suggestions';
COMMENT ON COLUMN outreach_messages.coaching_score IS 'Message quality score from 0-100';
COMMENT ON COLUMN outreach_messages.tone IS 'Communication tone: warm, direct, formal, casual';
COMMENT ON COLUMN outreach_messages.status IS 'Message status: draft, sent, opened, clicked, replied';

COMMENT ON TABLE message_events IS 'Tracking events for sent messages (opens, clicks, replies)';
COMMENT ON COLUMN message_events.event_type IS 'Event type: sent, opened, clicked, replied, bounced';
COMMENT ON COLUMN message_events.metadata IS 'Additional event data (IP, user agent, link clicked, etc.)';
