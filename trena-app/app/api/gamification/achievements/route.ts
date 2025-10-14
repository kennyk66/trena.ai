// PRD #0007: Achievements API
// Returns all achievements (locked and unlocked)

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ACHIEVEMENTS } from '@/lib/gamification/gamification-service';
import { getGamificationStats } from '@/lib/gamification/gamification-service';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's unlocked achievements
    const { data: unlocked } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    const unlockedIds = new Set(unlocked?.map((a) => a.achievement_id) || []);

    // Get user stats to check progress
    const statsResult = await getGamificationStats(user.id);
    const stats = statsResult.stats;

    // Build achievement list with unlock status
    const achievements = ACHIEVEMENTS.map((achievement) => {
      const isUnlocked = unlockedIds.has(achievement.id);
      const unlockedData = unlocked?.find((a) => a.achievement_id === achievement.id);

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        points: achievement.points,
        tier: achievement.tier,
        isUnlocked,
        unlockedAt: unlockedData?.unlocked_at || null,
        progress: stats ? achievement.checkCondition(stats) : false,
      };
    });

    return NextResponse.json({
      success: true,
      achievements,
      totalAchievements: ACHIEVEMENTS.length,
      unlockedCount: unlocked?.length || 0,
    });
  } catch (error) {
    console.error('Achievements API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get achievements',
      },
      { status: 500 }
    );
  }
}
