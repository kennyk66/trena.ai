// PRD #0007: Light Gamification Service
// Handles points, levels, achievements, streaks

import { createClient } from '@/lib/supabase/server';
import type {
  UserGamification,
  UserAchievement,
  GamificationEvent,
  GameEventType,
  POINT_VALUES,
  AchievementDefinition,
  LevelDefinition,
  GamificationSummary,
} from '@/types/gamification';

// ============================================================================
// LEVEL DEFINITIONS
// ============================================================================

export const LEVELS: LevelDefinition[] = [
  { level: 1, title: 'Prospector', minPoints: 0, maxPoints: 99 },
  { level: 2, title: 'Hunter', minPoints: 100, maxPoints: 299 },
  { level: 3, title: 'Specialist', minPoints: 300, maxPoints: 599 },
  { level: 4, title: 'Expert', minPoints: 600, maxPoints: 999 },
  { level: 5, title: 'Champion', minPoints: 1000, maxPoints: 1499 },
  { level: 6, title: 'Master', minPoints: 1500, maxPoints: 2499 },
  { level: 7, title: 'Legend', minPoints: 2500, maxPoints: 999999 },
];

// ============================================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================================

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Beginner Tier
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Research your first lead',
    icon: '🎯',
    points: 10,
    tier: 'beginner',
    checkCondition: (stats) => stats.total_leads_researched >= 1,
  },
  {
    id: 'hello_world',
    name: 'Hello World',
    description: 'Generate your first message',
    icon: '✉️',
    points: 15,
    tier: 'beginner',
    checkCondition: (stats) => stats.total_messages_generated >= 1,
  },
  {
    id: 'first_contact',
    name: 'First Contact',
    description: 'Send your first message',
    icon: '📤',
    points: 25,
    tier: 'beginner',
    checkCondition: (stats) => stats.total_messages_sent >= 1,
  },
  {
    id: 'conversation_starter',
    name: 'Conversation Starter',
    description: 'Get your first reply',
    icon: '💬',
    points: 50,
    tier: 'beginner',
    checkCondition: (stats) => stats.total_replies_received >= 1,
  },

  // Intermediate Tier
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'Research 25 leads',
    icon: '🔍',
    points: 50,
    tier: 'intermediate',
    checkCondition: (stats) => stats.total_leads_researched >= 25,
  },
  {
    id: 'outreach_master',
    name: 'Outreach Master',
    description: 'Send 50 messages',
    icon: '📧',
    points: 75,
    tier: 'intermediate',
    checkCondition: (stats) => stats.total_messages_sent >= 50,
  },
  {
    id: 'priority_hunter',
    name: 'Priority Hunter',
    description: 'Research 20 high priority leads',
    icon: '⭐',
    points: 75,
    tier: 'intermediate',
    checkCondition: (stats) => stats.total_high_priority_researched >= 20,
  },
  {
    id: 'focus_champion',
    name: 'Focus Champion',
    description: 'Complete 10 daily focus lists',
    icon: '🎯',
    points: 100,
    tier: 'intermediate',
    checkCondition: (stats) => stats.total_focus_completed >= 10,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '7 day login streak',
    icon: '🔥',
    points: 50,
    tier: 'intermediate',
    checkCondition: (stats) => stats.current_streak >= 7,
  },

  // Advanced Tier
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Send 100 messages',
    icon: '💯',
    points: 150,
    tier: 'advanced',
    checkCondition: (stats) => stats.total_messages_sent >= 100,
  },
  {
    id: 'high_flyer',
    name: 'High Flyer',
    description: 'Research 50 high priority leads',
    icon: '🚀',
    points: 150,
    tier: 'advanced',
    checkCondition: (stats) => stats.total_high_priority_researched >= 50,
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: '30 day login streak',
    icon: '👑',
    points: 250,
    tier: 'advanced',
    checkCondition: (stats) => stats.current_streak >= 30,
  },
  {
    id: 'master_closer',
    name: 'Master Closer',
    description: 'Receive 50 replies',
    icon: '🏆',
    points: 300,
    tier: 'advanced',
    checkCondition: (stats) => stats.total_replies_received >= 50,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate level based on total points
 */
function calculateLevel(totalPoints: number): { level: number; title: string; pointsToNext: number } {
  const currentLevel = LEVELS.find((l) => totalPoints >= l.minPoints && totalPoints <= l.maxPoints);

  if (!currentLevel) {
    return { level: 7, title: 'Legend', pointsToNext: 0 };
  }

  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);
  const pointsToNext = nextLevel ? nextLevel.minPoints - totalPoints : 0;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    pointsToNext,
  };
}

/**
 * Check if weekly goals need to be reset
 */
function shouldResetWeeklyGoals(lastResetDate: string): boolean {
  const lastReset = new Date(lastResetDate);
  const now = new Date();
  const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));

  return daysSinceReset >= 7;
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Award points for an action and log event
 */
export async function awardPoints(params: {
  userId: string;
  eventType: GameEventType;
  metadata?: Record<string, unknown>;
}): Promise<{
  success: boolean;
  pointsAwarded?: number;
  newAchievements?: UserAchievement[];
  levelUp?: boolean;
  error?: string;
}> {
  const { userId, eventType, metadata = {} } = params;

  try {
    const supabase = await createClient();

    // Get points for this event type
    const POINTS: Record<GameEventType, number> = {
      lead_researched: 10,
      high_priority_lead_researched: 20,
      message_generated: 15,
      message_sent: 25,
      reply_received: 50,
      focus_completed: 100,
      daily_login: 5,
    };

    const pointsAwarded = POINTS[eventType];

    // Get user's current gamification stats
    const { data: currentStats } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('id', userId)
      .single();

    if (!currentStats) {
      // Initialize gamification for user if not exists
      await supabase.from('user_gamification').insert({ id: userId });
      return { success: true, pointsAwarded, newAchievements: [], levelUp: false };
    }

    const stats = currentStats as UserGamification;

    // Calculate new totals
    const newTotalPoints = stats.total_points + pointsAwarded;
    const oldLevel = stats.current_level;
    const { level: newLevel, title: newTitle, pointsToNext } = calculateLevel(newTotalPoints);

    // Update counters based on event type
    const updates: Partial<UserGamification> = {
      total_points: newTotalPoints,
      current_level: newLevel,
      level_title: newTitle,
      points_to_next_level: pointsToNext,
    };

    // Update specific counters
    if (eventType === 'lead_researched') {
      updates.total_leads_researched = stats.total_leads_researched + 1;
      updates.weekly_leads_researched = stats.weekly_leads_researched + 1;
    } else if (eventType === 'high_priority_lead_researched') {
      updates.total_leads_researched = stats.total_leads_researched + 1;
      updates.total_high_priority_researched = stats.total_high_priority_researched + 1;
      updates.weekly_leads_researched = stats.weekly_leads_researched + 1;
    } else if (eventType === 'message_generated') {
      updates.total_messages_generated = stats.total_messages_generated + 1;
    } else if (eventType === 'message_sent') {
      updates.total_messages_sent = stats.total_messages_sent + 1;
      updates.weekly_messages_sent = stats.weekly_messages_sent + 1;
    } else if (eventType === 'reply_received') {
      updates.total_replies_received = stats.total_replies_received + 1;
    } else if (eventType === 'focus_completed') {
      updates.total_focus_completed = stats.total_focus_completed + 1;
    }

    // Update stats
    await supabase.from('user_gamification').update(updates).eq('id', userId);

    // Log event
    await supabase.from('gamification_events').insert({
      user_id: userId,
      event_type: eventType,
      points_earned: pointsAwarded,
      metadata,
    });

    // Check for new achievements
    const newStats = { ...stats, ...updates } as UserGamification;
    const newAchievements = await checkAndUnlockAchievements(userId, newStats);

    return {
      success: true,
      pointsAwarded,
      newAchievements,
      levelUp: newLevel > oldLevel,
    };
  } catch (error) {
    console.error('Award points error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to award points',
    };
  }
}

/**
 * Check and unlock any new achievements
 */
async function checkAndUnlockAchievements(
  userId: string,
  stats: UserGamification
): Promise<UserAchievement[]> {
  const supabase = await createClient();

  // Get already unlocked achievements
  const { data: unlockedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const unlockedIds = new Set(unlockedAchievements?.map((a) => a.achievement_id) || []);

  // Check which achievements should be unlocked
  const newAchievements: UserAchievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedIds.has(achievement.id) && achievement.checkCondition(stats)) {
      // Unlock this achievement
      const { data } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
          achievement_name: achievement.name,
          achievement_description: achievement.description,
          points_awarded: achievement.points,
        })
        .select()
        .single();

      if (data) {
        newAchievements.push(data as UserAchievement);

        // Award bonus points for achievement
        await supabase
          .from('user_gamification')
          .update({
            total_points: stats.total_points + achievement.points,
          })
          .eq('id', userId);
      }
    }
  }

  return newAchievements;
}

/**
 * Update daily login streak
 */
export async function updateLoginStreak(userId: string): Promise<{
  success: boolean;
  streakContinued?: boolean;
  pointsAwarded?: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: stats } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('id', userId)
      .single();

    if (!stats) {
      return { success: false, error: 'Gamification stats not found' };
    }

    const today = new Date().toISOString().split('T')[0];
    const lastActive = stats.last_active_date;

    // Check if already logged in today
    if (lastActive === today) {
      return { success: true, streakContinued: false, pointsAwarded: 0 };
    }

    let newStreak = 1;
    const pointsAwarded = 5;

    if (lastActive) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(today);
      const daysDiff = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        // Streak continues
        newStreak = stats.current_streak + 1;
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1;
      }
    }

    const longestStreak = Math.max(stats.longest_streak, newStreak);

    await supabase
      .from('user_gamification')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_active_date: today,
        total_points: stats.total_points + pointsAwarded,
      })
      .eq('id', userId);

    // Log event
    await supabase.from('gamification_events').insert({
      user_id: userId,
      event_type: 'daily_login',
      points_earned: pointsAwarded,
      metadata: { streak: newStreak },
    });

    return {
      success: true,
      streakContinued: newStreak > 1,
      pointsAwarded,
    };
  } catch (error) {
    console.error('Update login streak error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update streak',
    };
  }
}

/**
 * Get user's gamification stats
 */
export async function getGamificationStats(userId: string): Promise<{
  success: boolean;
  stats?: UserGamification;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: stats, error } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Create gamification profile if it doesn't exist
      await supabase.from('user_gamification').insert({ id: userId });

      const { data: newStats } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('id', userId)
        .single();

      return { success: true, stats: newStats as UserGamification };
    }

    // Check if weekly goals need reset
    if (shouldResetWeeklyGoals(stats.weekly_reset_date)) {
      await supabase
        .from('user_gamification')
        .update({
          weekly_leads_researched: 0,
          weekly_messages_sent: 0,
          weekly_reset_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', userId);

      stats.weekly_leads_researched = 0;
      stats.weekly_messages_sent = 0;
    }

    return { success: true, stats: stats as UserGamification };
  } catch (error) {
    console.error('Get gamification stats error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get stats',
    };
  }
}

/**
 * Get gamification summary (for dashboard widget)
 */
export async function getGamificationSummary(userId: string): Promise<{
  success: boolean;
  summary?: GamificationSummary;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get stats
    const statsResult = await getGamificationStats(userId);
    if (!statsResult.success || !statsResult.stats) {
      return { success: false, error: statsResult.error };
    }

    const stats = statsResult.stats;

    // Get recent achievements (last 5)
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })
      .limit(5);

    // Calculate weekly progress
    const weeklyProgress = {
      leads: {
        goal: stats.weekly_goal_leads,
        current: stats.weekly_leads_researched,
        percentage: Math.min(
          100,
          Math.round((stats.weekly_leads_researched / stats.weekly_goal_leads) * 100)
        ),
      },
      messages: {
        goal: stats.weekly_goal_messages,
        current: stats.weekly_messages_sent,
        percentage: Math.min(
          100,
          Math.round((stats.weekly_messages_sent / stats.weekly_goal_messages) * 100)
        ),
      },
    };

    // Get points this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: weekEvents } = await supabase
      .from('gamification_events')
      .select('points_earned')
      .eq('user_id', userId)
      .gte('created_at', weekAgo.toISOString());

    const pointsThisWeek = weekEvents?.reduce((sum, e) => sum + e.points_earned, 0) || 0;

    // Calculate progress to next level
    const currentLevel = LEVELS.find((l) => l.level === stats.current_level);
    const progressToNextLevel = currentLevel
      ? Math.round(
          ((stats.total_points - currentLevel.minPoints) /
            (currentLevel.maxPoints - currentLevel.minPoints)) *
            100
        )
      : 100;

    return {
      success: true,
      summary: {
        stats,
        recentAchievements: (achievements || []) as UserAchievement[],
        weeklyProgress,
        pointsThisWeek,
        progressToNextLevel,
      },
    };
  } catch (error) {
    console.error('Get gamification summary error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get summary',
    };
  }
}
