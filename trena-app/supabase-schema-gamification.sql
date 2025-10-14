-- PRD #0007: Light Gamification - Database Schema
-- This schema adds gamification features: points, levels, achievements, streaks

-- ============================================================================
-- TABLE: user_gamification
-- Stores gamification stats for each user
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,

  -- Points & Levels
  total_points INTEGER DEFAULT 0 NOT NULL,
  current_level INTEGER DEFAULT 1 NOT NULL,
  level_title TEXT DEFAULT 'Prospector' NOT NULL,
  points_to_next_level INTEGER DEFAULT 100 NOT NULL,

  -- Streaks
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_active_date DATE,

  -- Weekly Goals
  weekly_goal_leads INTEGER DEFAULT 10 NOT NULL,
  weekly_goal_messages INTEGER DEFAULT 5 NOT NULL,
  weekly_leads_researched INTEGER DEFAULT 0 NOT NULL,
  weekly_messages_sent INTEGER DEFAULT 0 NOT NULL,
  weekly_reset_date DATE DEFAULT CURRENT_DATE NOT NULL,

  -- Counts for achievements
  total_leads_researched INTEGER DEFAULT 0 NOT NULL,
  total_high_priority_researched INTEGER DEFAULT 0 NOT NULL,
  total_messages_generated INTEGER DEFAULT 0 NOT NULL,
  total_messages_sent INTEGER DEFAULT 0 NOT NULL,
  total_replies_received INTEGER DEFAULT 0 NOT NULL,
  total_focus_completed INTEGER DEFAULT 0 NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- TABLE: user_achievements
-- Tracks which achievements users have unlocked
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT NOT NULL,
  points_awarded INTEGER DEFAULT 0 NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Prevent duplicate achievements
  UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- TABLE: gamification_events
-- Logs all point-earning events for history and analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS gamification_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- 'lead_researched', 'message_sent', 'reply_received', etc.
  points_earned INTEGER DEFAULT 0 NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_gamification_events_user_id ON gamification_events(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_events_created_at ON gamification_events(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_events ENABLE ROW LEVEL SECURITY;

-- user_gamification policies
CREATE POLICY "Users can view own gamification stats"
  ON user_gamification FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own gamification stats"
  ON user_gamification FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own gamification stats"
  ON user_gamification FOR INSERT
  WITH CHECK (auth.uid() = id);

-- user_achievements policies
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- gamification_events policies
CREATE POLICY "Users can view own events"
  ON gamification_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON gamification_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to auto-create gamification profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_gamification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_gamification (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create gamification profile
DROP TRIGGER IF EXISTS on_auth_user_created_gamification ON auth.users;
CREATE TRIGGER on_auth_user_created_gamification
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_gamification();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_gamification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_user_gamification_timestamp ON user_gamification;
CREATE TRIGGER update_user_gamification_timestamp
  BEFORE UPDATE ON user_gamification
  FOR EACH ROW EXECUTE FUNCTION update_user_gamification_updated_at();

-- ============================================================================
-- ACHIEVEMENT DEFINITIONS (in comments for reference)
-- ============================================================================

/*
ACHIEVEMENTS:

Beginner Tier (0-500 points):
- "first_steps" - Research your first lead (10 pts)
- "hello_world" - Generate your first message (15 pts)
- "first_contact" - Send your first message (25 pts)
- "conversation_starter" - Get your first reply (50 pts)

Intermediate Tier (500-2000 points):
- "researcher" - Research 25 leads (50 pts)
- "outreach_master" - Send 50 messages (75 pts)
- "priority_hunter" - Research 20 high priority leads (75 pts)
- "focus_champion" - Complete 10 daily focus lists (100 pts)
- "week_warrior" - 7 day login streak (50 pts)

Advanced Tier (2000+ points):
- "century_club" - Send 100 messages (150 pts)
- "reply_pro" - 10% reply rate on 50+ messages (200 pts)
- "high_flyer" - Research 50 high priority leads (150 pts)
- "consistency_king" - 30 day login streak (250 pts)
- "master_closer" - 50 replies received (300 pts)

LEVELS:
Level 1 (0-99): Prospector
Level 2 (100-299): Hunter
Level 3 (300-599): Specialist
Level 4 (600-999): Expert
Level 5 (1000-1499): Champion
Level 6 (1500-2499): Master
Level 7 (2500+): Legend
*/
