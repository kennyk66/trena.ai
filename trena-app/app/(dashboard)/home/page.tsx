// PRD #0006: Dashboard & Analytics - Home Page
// Comprehensive dashboard with stats, focus, and activity

import { createClient } from '@/lib/supabase/server';
import { getDashboardStats, getRecentActivity } from '@/lib/analytics/analytics-service';
import { getDailyFocus } from '@/lib/priority/focus-service';
import { getGamificationSummary, updateLoginStreak } from '@/lib/gamification/gamification-service';
import { StatCard } from '@/components/dashboard/stat-card';
import { FocusWidget } from '@/components/dashboard/focus-widget';
import { ActivityWidget } from '@/components/dashboard/activity-widget';
import { GamificationWidget } from '@/components/gamification/gamification-widget';
import { RecommendedLeadsWidget } from '@/components/dashboard/recommended-leads-widget';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Update login streak (awards points for daily login)
  await updateLoginStreak(user.id);

  // Fetch dashboard data in parallel
  const [statsResult, activityResult, focusResult, gamificationResult] = await Promise.all([
    getDashboardStats(user.id),
    getRecentActivity({ userId: user.id, limit: 10 }),
    getDailyFocus({
      userId: user.id,
      focusDate: new Date().toISOString().split('T')[0],
    }),
    getGamificationSummary(user.id),
  ]);

  const stats = statsResult.stats;
  const activities = activityResult.activities || [];
  const focusLeads = focusResult.leads || [];
  const gamificationSummary = gamificationResult.summary;

  // Get user profile for personalization
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('name')
    .eq('id', user.id)
    .single();

  const displayName = profile?.name || user.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {displayName}! 👋</h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s your sales performance overview for today
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Leads"
            value={stats.totalLeads}
            iconName="Users"
            description={`${stats.highPriorityLeads} high priority`}
            variant="default"
          />
          <StatCard
            title="This Week"
            value={stats.leadsThisWeek}
            iconName="TrendingUp"
            description="New leads researched"
            variant="success"
          />
          <StatCard
            title="Messages Sent"
            value={stats.sentMessages}
            iconName="Mail"
            description={`${stats.draftMessages} drafts remaining`}
            variant="primary"
          />
          <StatCard
            title="Reply Rate"
            value={`${stats.replyRate.toFixed(1)}%`}
            iconName="CheckCircle2"
            description={`${stats.repliedCount} replies received`}
            variant="warning"
          />
        </div>
      )}

      {/* Secondary Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="High Priority Leads"
            value={stats.highPriorityLeads}
            iconName="Target"
            description={`${stats.mediumPriorityLeads} medium, ${stats.lowPriorityLeads} low`}
            variant="warning"
          />
          <StatCard
            title="Leads Contacted"
            value={stats.leadsContacted}
            iconName="Users"
            description={`${stats.leadsContactedThisWeek} this week`}
            variant="success"
          />
          <StatCard
            title="Total Messages"
            value={stats.totalMessages}
            iconName="MessageSquare"
            description={`${stats.messagesThisWeek} this week`}
            variant="primary"
          />
        </div>
      )}

      {/* Recommended Leads Widget (Full Width) */}
      <RecommendedLeadsWidget limit={3} />

      {/* Focus, Activity & Gamification Widgets */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Focus */}
        <FocusWidget
          focusLeads={focusLeads}
          focusCompletionRate={stats?.focusCompletionRate || 0}
        />

        {/* Recent Activity */}
        <ActivityWidget activities={activities} />

        {/* Gamification Progress */}
        {gamificationSummary && <GamificationWidget summary={gamificationSummary} />}
      </div>

      {/* Engagement Metrics */}
      {stats && stats.sentMessages > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Opened"
            value={stats.openedCount}
            iconName="Mail"
            description={`${((stats.openedCount / stats.sentMessages) * 100).toFixed(1)}% open rate`}
            variant="default"
          />
          <StatCard
            title="Clicked"
            value={stats.clickedCount}
            iconName="TrendingUp"
            description={`${((stats.clickedCount / stats.sentMessages) * 100).toFixed(1)}% click rate`}
            variant="success"
          />
          <StatCard
            title="Replied"
            value={stats.repliedCount}
            iconName="CheckCircle2"
            description={`${stats.replyRate.toFixed(1)}% reply rate`}
            variant="warning"
          />
        </div>
      )}
    </div>
  );
}
