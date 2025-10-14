// PRD #0004: Lead Prioritization - Today's Focus Service
// Generates daily focus list of top 5 priority leads

import { createClient } from '@/lib/supabase/server';
import type { ResearchedLead } from '@/types/research';
import type { DailyFocus, LeadAction } from '@/types/priority';

/**
 * Generate Today's Focus list for a user
 * Algorithm:
 * 1. Fetch high-priority leads
 * 2. Exclude leads contacted in last 7 days
 * 3. Exclude yesterday's focus
 * 4. Sort by priority score (desc)
 * 5. Apply diversity (prefer different companies/industries)
 * 6. Take top 5
 * 7. If <5 high-priority leads, fill with top medium-priority leads
 */
export async function generateDailyFocus(params: {
  userId: string;
  focusDate?: string; // ISO date string (YYYY-MM-DD), defaults to today
  limit?: number; // Number of leads, default 5
  excludeContactedDays?: number; // Exclude contacted in last N days, default 7
}): Promise<{
  success: boolean;
  focus?: DailyFocus;
  leads?: Array<ResearchedLead & { priority_position?: number }>;
  error?: string;
}> {
  const {
    userId,
    focusDate = new Date().toISOString().split('T')[0],
    limit = 5,
    excludeContactedDays = 7,
  } = params;

  try {
    const supabase = await createClient();

    // 1. Check if focus already exists for this date
    const { data: existingFocus } = await supabase
      .from('daily_focus')
      .select('*')
      .eq('user_id', userId)
      .eq('focus_date', focusDate)
      .single();

    if (existingFocus) {
      // Return existing focus with leads
      const leadIds = (existingFocus.lead_ids as unknown) as string[];
      const { data: leads } = await supabase
        .from('researched_leads')
        .select('*')
        .in('id', leadIds)
        .eq('user_id', userId);

      return {
        success: true,
        focus: {
          id: existingFocus.id,
          user_id: existingFocus.user_id,
          focus_date: existingFocus.focus_date,
          lead_ids: leadIds,
          generated_at: existingFocus.generated_at,
        },
        leads: (leads || []) as ResearchedLead[],
      };
    }

    // 2. Get leads contacted in last N days
    const contactedSinceDate = new Date();
    contactedSinceDate.setDate(contactedSinceDate.getDate() - excludeContactedDays);

    const { data: recentlyContactedActions } = await supabase
      .from('lead_actions')
      .select('lead_id')
      .eq('user_id', userId)
      .eq('action_type', 'contacted')
      .gte('action_date', contactedSinceDate.toISOString());

    const contactedLeadIds = recentlyContactedActions?.map((a) => a.lead_id) || [];

    // 3. Get yesterday's focus to exclude those leads
    const yesterday = new Date(focusDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDateStr = yesterday.toISOString().split('T')[0];

    const { data: yesterdayFocus } = await supabase
      .from('daily_focus')
      .select('lead_ids')
      .eq('user_id', userId)
      .eq('focus_date', yesterdayDateStr)
      .single();

    const yesterdayLeadIds = yesterdayFocus ? ((yesterdayFocus.lead_ids as unknown) as string[]) : [];

    // 4. Fetch high-priority leads
    let highPriorityQuery = supabase
      .from('researched_leads')
      .select('*')
      .eq('user_id', userId)
      .eq('priority_level', 'high')
      .order('priority_score', { ascending: false });

    // Exclude contacted and yesterday's focus
    const excludeIds = [...contactedLeadIds, ...yesterdayLeadIds];
    if (excludeIds.length > 0) {
      highPriorityQuery = highPriorityQuery.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data: highPriorityLeads } = await highPriorityQuery.limit(limit);

    let selectedLeads: ResearchedLead[] = (highPriorityLeads || []) as ResearchedLead[];

    // 5. If we have fewer than limit high-priority leads, add medium-priority leads
    if (selectedLeads.length < limit) {
      const remaining = limit - selectedLeads.length;
      let mediumPriorityQuery = supabase
        .from('researched_leads')
        .select('*')
        .eq('user_id', userId)
        .eq('priority_level', 'medium')
        .order('priority_score', { ascending: false });

      // Exclude already selected and excluded IDs
      const allExcludeIds = [...excludeIds, ...selectedLeads.map((l) => l.id)];
      if (allExcludeIds.length > 0) {
        mediumPriorityQuery = mediumPriorityQuery.not('id', 'in', `(${allExcludeIds.join(',')})`);
      }

      const { data: mediumPriorityLeads } = await mediumPriorityQuery.limit(remaining);

      if (mediumPriorityLeads && mediumPriorityLeads.length > 0) {
        selectedLeads = [...selectedLeads, ...(mediumPriorityLeads as ResearchedLead[])];
      }
    }

    // 6. Apply diversity logic (prefer different companies/industries)
    selectedLeads = applyDiversityLogic(selectedLeads, limit);

    // 7. Save to daily_focus table
    const leadIds = selectedLeads.map((l) => l.id);

    const { data: newFocus, error: insertError } = await supabase
      .from('daily_focus')
      .insert({
        user_id: userId,
        focus_date: focusDate,
        lead_ids: leadIds,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving daily focus:', insertError);
      return { success: false, error: 'Failed to save daily focus' };
    }

    return {
      success: true,
      focus: {
        id: newFocus.id,
        user_id: newFocus.user_id,
        focus_date: newFocus.focus_date,
        lead_ids: leadIds,
        generated_at: newFocus.generated_at,
      },
      leads: selectedLeads,
    };
  } catch (error) {
    console.error('Error generating daily focus:', error);
    return { success: false, error: 'Failed to generate daily focus' };
  }
}

/**
 * Apply diversity logic to prefer different companies and industries
 */
function applyDiversityLogic(leads: ResearchedLead[], limit: number): ResearchedLead[] {
  if (leads.length <= limit) {
    return leads;
  }

  const selected: ResearchedLead[] = [];
  const usedCompanies = new Set<string>();
  const usedIndustries = new Set<string>();

  // First pass: pick leads with unique companies
  for (const lead of leads) {
    if (selected.length >= limit) break;

    const company = lead.company_name?.toLowerCase() || '';
    if (!usedCompanies.has(company) && company) {
      selected.push(lead);
      usedCompanies.add(company);
      if (lead.company_industry) {
        usedIndustries.add(lead.company_industry.toLowerCase());
      }
    }
  }

  // Second pass: if still need more, pick from different industries
  if (selected.length < limit) {
    for (const lead of leads) {
      if (selected.length >= limit) break;
      if (selected.includes(lead)) continue;

      const industry = lead.company_industry?.toLowerCase() || '';
      if (!usedIndustries.has(industry) && industry) {
        selected.push(lead);
        usedIndustries.add(industry);
      }
    }
  }

  // Third pass: fill remaining with highest scored leads
  if (selected.length < limit) {
    for (const lead of leads) {
      if (selected.length >= limit) break;
      if (!selected.includes(lead)) {
        selected.push(lead);
      }
    }
  }

  return selected.slice(0, limit);
}

/**
 * Get today's focus for a user
 */
export async function getDailyFocus(params: {
  userId: string;
  focusDate?: string;
}): Promise<{
  success: boolean;
  focus?: DailyFocus;
  leads?: ResearchedLead[];
  error?: string;
}> {
  const { userId, focusDate = new Date().toISOString().split('T')[0] } = params;

  try {
    const supabase = await createClient();

    // Get focus record
    const { data: focusData, error: focusError } = await supabase
      .from('daily_focus')
      .select('*')
      .eq('user_id', userId)
      .eq('focus_date', focusDate)
      .single();

    if (focusError || !focusData) {
      // No focus exists, generate it
      return await generateDailyFocus({ userId, focusDate });
    }

    // Get leads
    const leadIds = (focusData.lead_ids as unknown) as string[];
    if (leadIds.length === 0) {
      return {
        success: true,
        focus: {
          id: focusData.id,
          user_id: focusData.user_id,
          focus_date: focusData.focus_date,
          lead_ids: [],
          generated_at: focusData.generated_at,
        },
        leads: [],
      };
    }

    const { data: leads, error: leadsError } = await supabase
      .from('researched_leads')
      .select('*')
      .in('id', leadIds)
      .eq('user_id', userId);

    if (leadsError) {
      console.error('Error fetching focus leads:', leadsError);
      return { success: false, error: 'Failed to fetch focus leads' };
    }

    // Sort leads by their order in lead_ids
    const sortedLeads = leadIds
      .map((id) => leads?.find((l) => l.id === id))
      .filter((l) => l !== undefined) as ResearchedLead[];

    return {
      success: true,
      focus: {
        id: focusData.id,
        user_id: focusData.user_id,
        focus_date: focusData.focus_date,
        lead_ids: leadIds,
        generated_at: focusData.generated_at,
      },
      leads: sortedLeads,
    };
  } catch (error) {
    console.error('Error getting daily focus:', error);
    return { success: false, error: 'Failed to get daily focus' };
  }
}

/**
 * Mark a lead as contacted
 */
export async function markLeadContacted(params: {
  userId: string;
  leadId: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; action?: LeadAction; error?: string }> {
  const { userId, leadId, metadata = {} } = params;

  try {
    const supabase = await createClient();

    // Insert lead action
    const { data: action, error: insertError } = await supabase
      .from('lead_actions')
      .insert({
        user_id: userId,
        lead_id: leadId,
        action_type: 'contacted',
        metadata,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error marking lead as contacted:', insertError);
      return { success: false, error: 'Failed to mark lead as contacted' };
    }

    return {
      success: true,
      action: {
        id: action.id,
        user_id: action.user_id,
        lead_id: action.lead_id,
        action_type: action.action_type,
        action_date: action.action_date,
        metadata: action.metadata as Record<string, unknown>,
      },
    };
  } catch (error) {
    console.error('Error marking lead as contacted:', error);
    return { success: false, error: 'Failed to mark lead as contacted' };
  }
}

/**
 * Track any lead action (viewed, added_to_focus, generated_outreach, contacted)
 */
export async function trackLeadAction(params: {
  userId: string;
  leadId: string;
  actionType: 'contacted' | 'viewed' | 'added_to_focus' | 'generated_outreach';
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; action?: LeadAction; error?: string }> {
  const { userId, leadId, actionType, metadata = {} } = params;

  try {
    const supabase = await createClient();

    const { data: action, error: insertError } = await supabase
      .from('lead_actions')
      .insert({
        user_id: userId,
        lead_id: leadId,
        action_type: actionType,
        metadata,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error tracking lead action:', insertError);
      return { success: false, error: 'Failed to track lead action' };
    }

    return {
      success: true,
      action: {
        id: action.id,
        user_id: action.user_id,
        lead_id: action.lead_id,
        action_type: action.action_type,
        action_date: action.action_date,
        metadata: action.metadata as Record<string, unknown>,
      },
    };
  } catch (error) {
    console.error('Error tracking lead action:', error);
    return { success: false, error: 'Failed to track lead action' };
  }
}
