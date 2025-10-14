'use client';

import { Card } from '@/components/ui/card';
import { Trophy, TrendingUp, Target, Zap } from 'lucide-react';
import type { GamificationSummary } from '@/types/gamification';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface GamificationWidgetProps {
  summary: GamificationSummary;
}

export function GamificationWidget({ summary }: GamificationWidgetProps) {
  const { stats, recentAchievements, weeklyProgress, pointsThisWeek, progressToNextLevel } =
    summary;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold">Your Progress</h3>
        </div>
        <Link href="/gamification">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </div>

      {/* Level & Points */}
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-gray-600">Level {stats.current_level}</p>
            <h4 className="text-xl font-bold text-purple-700">{stats.level_title}</h4>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-700">{stats.total_points}</p>
            <p className="text-xs text-gray-600">total points</p>
          </div>
        </div>

        {/* Progress to next level */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Level Progress</span>
            <span>{stats.points_to_next_level} pts to next level</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak */}
      {stats.current_streak > 0 && (
        <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-semibold text-orange-900">
                {stats.current_streak} Day Streak! 🔥
              </p>
              <p className="text-xs text-orange-700">Keep it going!</p>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Goals */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-gray-500" />
          <h5 className="text-sm font-semibold">Weekly Goals</h5>
        </div>

        {/* Leads Goal */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Leads Researched</span>
            <span className="font-medium">
              {weeklyProgress.leads.current}/{weeklyProgress.leads.goal}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ width: `${weeklyProgress.leads.percentage}%` }}
            />
          </div>
        </div>

        {/* Messages Goal */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Messages Sent</span>
            <span className="font-medium">
              {weeklyProgress.messages.current}/{weeklyProgress.messages.goal}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-green-600 h-1.5 rounded-full transition-all"
              style={{ width: `${weeklyProgress.messages.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* This Week Stats */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="p-2 bg-gray-50 rounded text-center">
          <p className="text-lg font-bold text-gray-900">{pointsThisWeek}</p>
          <p className="text-xs text-gray-600">Points This Week</p>
        </div>
        <div className="p-2 bg-gray-50 rounded text-center">
          <p className="text-lg font-bold text-gray-900">{recentAchievements.length}</p>
          <p className="text-xs text-gray-600">Recent Unlocks</p>
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <h5 className="text-sm font-semibold">Recent Achievements</h5>
          </div>
          <div className="space-y-2">
            {recentAchievements.slice(0, 3).map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded"
              >
                <span className="text-2xl">🏆</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-yellow-900 truncate">
                    {achievement.achievement_name}
                  </p>
                  <p className="text-xs text-yellow-700">+{achievement.points_awarded} points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
