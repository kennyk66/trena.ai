// PRD #0007: Gamification Page
// Shows full stats, all achievements, and progress

import { createClient } from '@/lib/supabase/server';
import { getGamificationSummary, ACHIEVEMENTS } from '@/lib/gamification/gamification-service';
import { Card } from '@/components/ui/card';
import { Trophy, Zap, Target, TrendingUp, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function GamificationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get gamification summary
  const summaryResult = await getGamificationSummary(user.id);
  const summary = summaryResult.summary;

  if (!summary) {
    return <div>Loading...</div>;
  }

  const { stats, weeklyProgress, pointsThisWeek, progressToNextLevel } = summary;

  // Get all user achievements
  const { data: unlockedAchievements } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', user.id);

  const unlockedIds = new Set(unlockedAchievements?.map((a) => a.achievement_id) || []);

  // Group achievements by tier
  const achievementsByTier = {
    beginner: ACHIEVEMENTS.filter((a) => a.tier === 'beginner'),
    intermediate: ACHIEVEMENTS.filter((a) => a.tier === 'intermediate'),
    advanced: ACHIEVEMENTS.filter((a) => a.tier === 'advanced'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
        <p className="text-muted-foreground mt-2">
          Track your achievements and level up your sales game
        </p>
      </div>

      {/* Level & Points Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Level Card */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Current Level</p>
              <h3 className="text-2xl font-bold text-purple-700">
                Level {stats.current_level}
              </h3>
            </div>
          </div>
          <p className="text-lg font-semibold text-purple-900 mb-3">{stats.level_title}</p>
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress to Next Level</span>
              <span>{progressToNextLevel}%</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.points_to_next_level} points to next level
            </p>
          </div>
        </Card>

        {/* Points Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Points</p>
              <h3 className="text-2xl font-bold text-blue-700">{stats.total_points}</h3>
            </div>
          </div>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">This Week</span>
              <span className="font-medium">{pointsThisWeek} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Achievements</span>
              <span className="font-medium">{unlockedAchievements?.length || 0}</span>
            </div>
          </div>
        </Card>

        {/* Streak Card */}
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-6 w-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Login Streak</p>
              <h3 className="text-2xl font-bold text-orange-700">
                {stats.current_streak} Days
              </h3>
            </div>
          </div>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Longest Streak</span>
              <span className="font-medium">{stats.longest_streak} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Keep it going!</span>
              <span className="font-medium">🔥</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Goals */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Weekly Goals</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Leads Goal */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Leads Researched</h4>
              <span className="text-lg font-bold text-blue-600">
                {weeklyProgress.leads.current}/{weeklyProgress.leads.goal}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${weeklyProgress.leads.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {weeklyProgress.leads.percentage}% complete
            </p>
          </div>

          {/* Messages Goal */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Messages Sent</h4>
              <span className="text-lg font-bold text-green-600">
                {weeklyProgress.messages.current}/{weeklyProgress.messages.goal}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${weeklyProgress.messages.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {weeklyProgress.messages.percentage}% complete
            </p>
          </div>
        </div>
      </Card>

      {/* Achievements by Tier */}
      <div className="space-y-6">
        {/* Beginner Tier */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Beginner Achievements</h3>
            <Badge variant="outline" className="ml-2">
              {achievementsByTier.beginner.filter((a) => unlockedIds.has(a.id)).length}/
              {achievementsByTier.beginner.length}
            </Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {achievementsByTier.beginner.map((achievement) => {
              const isUnlocked = unlockedIds.has(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-4 border rounded-lg ${
                    isUnlocked
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="text-center mb-2">
                    <span className="text-3xl">{isUnlocked ? achievement.icon : '🔒'}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-center mb-1">
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-gray-600 text-center mb-2">
                    {achievement.description}
                  </p>
                  <p className="text-xs font-medium text-center text-green-600">
                    +{achievement.points} pts
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Intermediate Tier */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Intermediate Achievements</h3>
            <Badge variant="outline" className="ml-2">
              {achievementsByTier.intermediate.filter((a) => unlockedIds.has(a.id)).length}/
              {achievementsByTier.intermediate.length}
            </Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {achievementsByTier.intermediate.map((achievement) => {
              const isUnlocked = unlockedIds.has(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-4 border rounded-lg ${
                    isUnlocked
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="text-center mb-2">
                    <span className="text-3xl">{isUnlocked ? achievement.icon : '🔒'}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-center mb-1">
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-gray-600 text-center mb-2">
                    {achievement.description}
                  </p>
                  <p className="text-xs font-medium text-center text-blue-600">
                    +{achievement.points} pts
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Advanced Tier */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Advanced Achievements</h3>
            <Badge variant="outline" className="ml-2">
              {achievementsByTier.advanced.filter((a) => unlockedIds.has(a.id)).length}/
              {achievementsByTier.advanced.length}
            </Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {achievementsByTier.advanced.map((achievement) => {
              const isUnlocked = unlockedIds.has(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-4 border rounded-lg ${
                    isUnlocked
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="text-center mb-2">
                    <span className="text-3xl">{isUnlocked ? achievement.icon : '🔒'}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-center mb-1">
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-gray-600 text-center mb-2">
                    {achievement.description}
                  </p>
                  <p className="text-xs font-medium text-center text-purple-600">
                    +{achievement.points} pts
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Stats Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Lifetime Stats</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{stats.total_leads_researched}</p>
            <p className="text-xs text-gray-600">Leads Researched</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">
              {stats.total_high_priority_researched}
            </p>
            <p className="text-xs text-gray-600">High Priority</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{stats.total_messages_generated}</p>
            <p className="text-xs text-gray-600">Messages Generated</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{stats.total_messages_sent}</p>
            <p className="text-xs text-gray-600">Messages Sent</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{stats.total_replies_received}</p>
            <p className="text-xs text-gray-600">Replies Received</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{stats.total_focus_completed}</p>
            <p className="text-xs text-gray-600">Focus Completed</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
