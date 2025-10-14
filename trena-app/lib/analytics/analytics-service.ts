// PRD #0006: Dashboard & Analytics - Analytics Service
// This service calculates metrics and stats for the dashboard

import { createClient } from '@/lib/supabase/server';

/**
 * Dashboard statistics interface
 */
export interface DashboardStats {
  // Lead metrics
  totalLeads: number;
  highPriorityLeads: number;
  mediumPriorityLeads: number;
  lowPriorityLeads: number;
  leadsThisWeek: number;
  leadsThisMonth: number;

  // Outreach metrics
  totalMessages: number;
  draftMessages: number;
  sentMessages: number;
  messagesThisWeek: number;
  messagesThisMonth: number;

  // Engagement metrics
  repliedCount: number;
  openedCount: number;
  clickedCount: number;
  replyRate: number; // Percentage

  // Activity metrics
  leadsContacted: number;
  leadsContactedThisWeek: number;
  focusCompletionRate: number; // Percentage of focus leads contacted
}

/**
 * Recent activity item
 */
export interface RecentActivity {
  id: string;
  type: 'lead_researched' | 'message_generated' | 'message_sent' | 'lead_contacted';
  description: string;
  timestamp: string;
  metadata?: {
    lead_name?: string;
    lead_id?: string;
    message_type?: string;
    message_id?: string;
  };
}

/**
 * Priority distribution for charts
 */
export interface PriorityDistribution {
  high: number;
  medium: number;
  low: number;
}

/**
 * Get dashboard statistics for a user
 */
export async function getDashboardStats(userId: string): Promise<{
  success: boolean;
  stats?: DashboardStats;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Calculate date ranges
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all required data in parallel
    const [
      leadsResult,
      messagesResult,
      actionsResult,
      focusResult,
    ] = await Promise.all([
      // Leads data
      supabase
        .from('researched_leads')
        .select('id, priority_level, created_at')
        .eq('user_id', userId),

      // Messages data
      supabase
        .from('outreach_messages')
        .select('id, status, created_at')
        .eq('user_id', userId),

      // Lead actions
      supabase
        .from('lead_actions')
        .select('id, lead_id, action_type, action_date')
        .eq('user_id', userId),

      // Today's focus
      supabase
        .from('daily_focus')
        .select('lead_ids')
        .eq('user_id', userId)
        .eq('focus_date', now.toISOString().split('T')[0])
        .single(),
    ]);

    const leads = leadsResult.data || [];
    const messages = messagesResult.data || [];
    const actions = actionsResult.data || [];
    const focusLeadIds = (focusResult.data?.lead_ids as string[]) || [];

    // Calculate lead metrics
    const totalLeads = leads.length;
    const highPriorityLeads = leads.filter((l) => l.priority_level === 'high').length;
    const mediumPriorityLeads = leads.filter((l) => l.priority_level === 'medium').length;
    const lowPriorityLeads = leads.filter((l) => l.priority_level === 'low').length;
    const leadsThisWeek = leads.filter((l) => new Date(l.created_at) >= weekAgo).length;
    const leadsThisMonth = leads.filter((l) => new Date(l.created_at) >= monthAgo).length;

    // Calculate message metrics
    const totalMessages = messages.length;
    const draftMessages = messages.filter((m) => m.status === 'draft').length;
    const sentMessages = messages.filter((m) => m.status !== 'draft').length;
    const messagesThisWeek = messages.filter((m) => new Date(m.created_at) >= weekAgo).length;
    const messagesThisMonth = messages.filter((m) => new Date(m.created_at) >= monthAgo).length;

    // Calculate engagement metrics
    const repliedCount = messages.filter((m) => m.status === 'replied').length;
    const openedCount = messages.filter((m) => m.status === 'opened' || m.status === 'clicked' || m.status === 'replied').length;
    const clickedCount = messages.filter((m) => m.status === 'clicked' || m.status === 'replied').length;
    const replyRate = sentMessages > 0 ? (repliedCount / sentMessages) * 100 : 0;

    // Calculate activity metrics
    const contactedActions = actions.filter((a) => a.action_type === 'contacted');
    const leadsContacted = new Set(contactedActions.map((a) => a.lead_id)).size;
    const leadsContactedThisWeek = new Set(
      contactedActions
        .filter((a) => new Date(a.action_date) >= weekAgo)
        .map((a) => a.lead_id)
    ).size;

    // Calculate focus completion rate
    const focusContactedCount = focusLeadIds.filter((leadId) =>
      contactedActions.some((a) => a.lead_id === leadId)
    ).length;
    const focusCompletionRate = focusLeadIds.length > 0 ? (focusContactedCount / focusLeadIds.length) * 100 : 0;

    const stats: DashboardStats = {
      totalLeads,
      highPriorityLeads,
      mediumPriorityLeads,
      lowPriorityLeads,
      leadsThisWeek,
      leadsThisMonth,
      totalMessages,
      draftMessages,
      sentMessages,
      messagesThisWeek,
      messagesThisMonth,
      repliedCount,
      openedCount,
      clickedCount,
      replyRate,
      leadsContacted,
      leadsContactedThisWeek,
      focusCompletionRate,
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get dashboard stats',
    };
  }
}

/**
 * Get recent activity for a user
 */
export async function getRecentActivity(params: {
  userId: string;
  limit?: number;
}): Promise<{
  success: boolean;
  activities?: RecentActivity[];
  error?: string;
}> {
  const { userId, limit = 10 } = params;

  try {
    const supabase = await createClient();

    // Fetch recent leads, messages, and actions
    const [leadsResult, messagesResult, actionsResult] = await Promise.all([
      supabase
        .from('researched_leads')
        .select('id, person_name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit),

      supabase
        .from('outreach_messages')
        .select('id, lead_id, message_type, status, created_at, sent_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit),

      supabase
        .from('lead_actions')
        .select('id, lead_id, action_type, action_date')
        .eq('user_id', userId)
        .eq('action_type', 'contacted')
        .order('action_date', { ascending: false })
        .limit(limit),
    ]);

    const activities: RecentActivity[] = [];

    // Add lead research activities
    (leadsResult.data || []).forEach((lead) => {
      activities.push({
        id: `lead-${lead.id}`,
        type: 'lead_researched',
        description: `Researched ${lead.person_name || 'Unknown'}`,
        timestamp: lead.created_at,
        metadata: {
          lead_name: lead.person_name || undefined,
          lead_id: lead.id,
        },
      });
    });

    // Add message activities
    (messagesResult.data || []).forEach((message) => {
      const isSent = message.status !== 'draft';
      activities.push({
        id: `message-${message.id}`,
        type: isSent ? 'message_sent' : 'message_generated',
        description: isSent
          ? `Sent ${message.message_type} message`
          : `Generated ${message.message_type} draft`,
        timestamp: isSent && message.sent_at ? message.sent_at : message.created_at,
        metadata: {
          message_type: message.message_type,
          message_id: message.id,
          lead_id: message.lead_id,
        },
      });
    });

    // Add contacted activities
    (actionsResult.data || []).forEach((action) => {
      activities.push({
        id: `action-${action.id}`,
        type: 'lead_contacted',
        description: 'Contacted lead',
        timestamp: action.action_date,
        metadata: {
          lead_id: action.lead_id,
        },
      });
    });

    // Sort by timestamp (most recent first) and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedActivities = activities.slice(0, limit);

    return { success: true, activities: limitedActivities };
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recent activity',
    };
  }
}

/**
 * Get priority distribution for charts
 */
export async function getPriorityDistribution(userId: string): Promise<{
  success: boolean;
  distribution?: PriorityDistribution;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: leads } = await supabase
      .from('researched_leads')
      .select('priority_level')
      .eq('user_id', userId);

    if (!leads) {
      return { success: true, distribution: { high: 0, medium: 0, low: 0 } };
    }

    const distribution: PriorityDistribution = {
      high: leads.filter((l) => l.priority_level === 'high').length,
      medium: leads.filter((l) => l.priority_level === 'medium').length,
      low: leads.filter((l) => l.priority_level === 'low').length,
    };

    return { success: true, distribution };
  } catch (error) {
    console.error('Error getting priority distribution:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get priority distribution',
    };
  }
}
