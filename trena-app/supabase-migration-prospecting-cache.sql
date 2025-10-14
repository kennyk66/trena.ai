-- Add caching and rate limiting columns for Lusha Prospecting API
-- Run this in your Supabase SQL Editor

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS recommended_leads_cache JSONB,
ADD COLUMN IF NOT EXISTS recommended_leads_cached_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS recommended_leads_last_refresh TIMESTAMPTZ;

COMMENT ON COLUMN user_profiles.recommended_leads_cache IS 'Cached recommended leads from Lusha Prospecting API (24h TTL)';
COMMENT ON COLUMN user_profiles.recommended_leads_cached_at IS 'Timestamp when leads were last cached';
COMMENT ON COLUMN user_profiles.recommended_leads_last_refresh IS 'Timestamp of last refresh (for rate limiting)';
