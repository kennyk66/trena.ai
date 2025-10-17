// PRD #0007: Light Gamification - Type Definitions

/**
 * User gamification stats
 */
export interface UserGamification {
  id: string;
  total_points: number;
  current_level: number;
  level_title: string;
  points_to_next_level: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  weekly_goal_leads: number;
  weekly_goal_messages: number;
  weekly_leads_researched: number;
  weekly_messages_sent: number;
  weekly_reset_date: string;
  total_leads_researched: number;
  total_high_priority_researched: number;
  total_messages_generated: number;
  total_messages_sent: number;
  total_replies_received: number;
  total_focus_completed: number;
  created_at: string;
  updated_at: string;
}

/**
 * Achievement unlocked by a user
 */
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement_name: string;
  achievement_description: string;
  points_awarded: number;
  unlocked_at: string;
}


/**
 * Achievement definition
 */
export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  tier: 'beginner' | 'intermediate' | 'advanced';
  checkCondition: (stats: UserGamification) => boolean;
}

/**
 * Level definition
 */
export interface LevelDefinition {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
}

/**
 * Event types that award points
 */
export type GameEventType =
  | 'lead_researched'
  | 'high_priority_lead_researched'
  | 'message_generated'
  | 'message_sent'
  | 'reply_received'
  | 'focus_completed'
  | 'daily_login';


/**
 * Weekly goal progress
 */
export interface WeeklyGoalProgress {
  leads: {
    goal: number;
    current: number;
    percentage: number;
  };
  messages: {
    goal: number;
    current: number;
    percentage: number;
  };
}

/**
 * Gamification summary (for dashboard widget)
 */
export interface GamificationSummary {
  stats: UserGamification;
  recentAchievements: UserAchievement[];
  weeklyProgress: WeeklyGoalProgress;
  pointsThisWeek: number;
  progressToNextLevel: number; // Percentage
}
