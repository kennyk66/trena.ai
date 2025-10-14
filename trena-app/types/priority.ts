// PRD #0004: Lead Prioritization - Type Definitions

/**
 * Priority level categories
 * - high: 6+ points
 * - medium: 3-5 points
 * - low: 0-2 points
 */
export type PriorityLevel = 'high' | 'medium' | 'low';

/**
 * Individual signal with point value for transparency
 */
export interface SignalBreakdown {
  signal_type: string;
  signal_name: string;
  points: number;
  category: 'buying_signal' | 'fit';
}

/**
 * Complete priority score breakdown
 */
export interface PriorityScore {
  priority_score: number; // Total score (0-14)
  priority_level: PriorityLevel;
  buying_signal_score: number; // 0-10 points
  fit_score: number; // 0-4 points
  signal_breakdown: SignalBreakdown[];
  last_scored_at: string;
  last_rescored_at: string | null;
}

/**
 * Daily focus list for a user
 */
export interface DailyFocus {
  id: string;
  user_id: string;
  focus_date: string; // ISO date string (YYYY-MM-DD)
  lead_ids: string[]; // Array of researched_lead IDs in priority order
  generated_at: string;
}

/**
 * Database row types for daily_focus
 */
export interface DailyFocusRow {
  id: string;
  user_id: string;
  focus_date: string;
  lead_ids: unknown; // JSONB in database
  generated_at: string;
}

/**
 * User action types
 */
export type LeadActionType = 'contacted' | 'viewed' | 'added_to_focus' | 'generated_outreach';

/**
 * Lead action for tracking user interactions
 */
export interface LeadAction {
  id: string;
  user_id: string;
  lead_id: string;
  action_type: LeadActionType;
  action_date: string;
  metadata: Record<string, unknown>;
}

/**
 * Database row types for lead_actions
 */
export interface LeadActionRow {
  id: string;
  user_id: string;
  lead_id: string;
  action_type: LeadActionType;
  action_date: string;
  metadata: unknown; // JSONB in database
}

/**
 * Input for calculating priority score
 */
export interface CalculatePriorityInput {
  leadId: string;
  userId: string;
  forceRecalculate?: boolean;
}

/**
 * Parameters for generating daily focus
 */
export interface GenerateFocusParams {
  userId: string;
  focusDate?: string; // ISO date string, defaults to today
  limit?: number; // Number of leads in focus, default 5
}

/**
 * Focus selection options
 */
export interface FocusSelectionOptions {
  excludeContactedDays?: number; // Exclude leads contacted in last N days (default 7)
  excludeYesterdayFocus?: boolean; // Exclude yesterday's focus (default true)
  preferDiversity?: boolean; // Prefer different companies/industries (default true)
}

/**
 * API response for priority calculation
 */
export interface CalculatePriorityResponse {
  success: boolean;
  priority?: PriorityScore;
  error?: string;
}

/**
 * API response for daily focus
 */
export interface GetFocusResponse {
  success: boolean;
  focus?: DailyFocus;
  leads?: Array<{
    id: string;
    person_name: string | null;
    person_title: string | null;
    company_name: string | null;
    priority_score: number;
    priority_level: PriorityLevel;
    buying_signals: unknown[];
  }>;
  error?: string;
}

/**
 * API request for tracking lead action
 */
export interface TrackActionRequest {
  lead_id: string;
  action_type: LeadActionType;
  metadata?: Record<string, unknown>;
}

/**
 * API response for tracking action
 */
export interface TrackActionResponse {
  success: boolean;
  action?: LeadAction;
  error?: string;
}
