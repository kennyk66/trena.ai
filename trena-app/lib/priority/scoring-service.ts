// PRD #0004: Lead Prioritization - Scoring Service
// This service calculates priority scores for researched leads based on buying signals and fit

import { createClient } from '@/lib/supabase/server';
import type { ResearchedLead } from '@/types/research';
import type { SignalBreakdown, PriorityLevel } from '@/types/priority';

/**
 * Calculate priority score for a researched lead
 * Scoring breakdown:
 * - Buying signals: 0-10 points (funding +2, leadership +2, growth +1, news +1, tech +1)
 * - Fit score: 0-4 points (industry match +2, title match +2)
 * - Total: 0-14 points
 *
 * Priority levels:
 * - High: 6+ points OR 2+ signals with any fit
 * - Medium: 3-5 points
 * - Low: 0-2 points
 */
export async function calculatePriorityScore(params: {
  leadId: string;
  userId: string;
  forceRecalculate?: boolean;
}): Promise<{
  success: boolean;
  priority?: {
    priority_score: number;
    priority_level: PriorityLevel;
    buying_signal_score: number;
    fit_score: number;
    signal_breakdown: SignalBreakdown[];
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // 1. Fetch the lead
    const { data: lead, error: fetchError } = await supabase
      .from('researched_leads')
      .select('*')
      .eq('id', params.leadId)
      .eq('user_id', params.userId)
      .single();

    if (fetchError || !lead) {
      return { success: false, error: 'Lead not found' };
    }

    // 2. Check if already scored (unless force recalculate)
    if (!params.forceRecalculate && lead.last_scored_at && lead.priority_score !== null) {
      return {
        success: true,
        priority: {
          priority_score: lead.priority_score,
          priority_level: lead.priority_level as PriorityLevel,
          buying_signal_score: lead.buying_signal_score,
          fit_score: lead.fit_score,
          signal_breakdown: lead.signal_breakdown as SignalBreakdown[],
        },
      };
    }

    // 3. Fetch user's target buyer profile for fit scoring
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('target_industries, target_roles')
      .eq('id', params.userId)
      .single();

    // 4. Calculate buying signal score
    const { score: buyingSignalScore, breakdown: signalBreakdown } = calculateBuyingSignalScore(
      lead as unknown as ResearchedLead
    );

    // 5. Calculate fit score
    const { score: fitScore, breakdown: fitBreakdown } = calculateFitScore(
      lead as unknown as ResearchedLead,
      userProfile?.target_industries || [],
      userProfile?.target_roles || []
    );

    // 6. Calculate total score
    const totalScore = buyingSignalScore + fitScore;

    // 7. Determine priority level
    const priorityLevel = determinePriorityLevel(
      totalScore,
      buyingSignalScore,
      fitScore,
      (lead.buying_signals as unknown as ResearchedLead['buying_signals']).length
    );

    // 8. Combine breakdown
    const fullBreakdown = [...signalBreakdown, ...fitBreakdown];

    // 9. Save to database
    const saveResult = await savePriorityScore({
      leadId: params.leadId,
      userId: params.userId,
      priorityScore: totalScore,
      priorityLevel,
      buyingSignalScore,
      fitScore,
      signalBreakdown: fullBreakdown,
    });

    if (!saveResult.success) {
      return { success: false, error: 'Failed to save priority score' };
    }

    return {
      success: true,
      priority: {
        priority_score: totalScore,
        priority_level: priorityLevel,
        buying_signal_score: buyingSignalScore,
        fit_score: fitScore,
        signal_breakdown: fullBreakdown,
      },
    };
  } catch (error) {
    console.error('Error calculating priority score:', error);
    return { success: false, error: 'Failed to calculate priority score' };
  }
}

/**
 * Calculate buying signal score (0-10 points)
 * - funding: +2 points
 * - leadership_change: +2 points
 * - hiring/expansion/growth: +1 point
 * - news/product_launch: +1 point
 * - tech stack (if matches): +1 point
 */
function calculateBuyingSignalScore(lead: ResearchedLead): {
  score: number;
  breakdown: SignalBreakdown[];
} {
  let score = 0;
  const breakdown: SignalBreakdown[] = [];

  if (!lead.buying_signals || lead.buying_signals.length === 0) {
    return { score: 0, breakdown: [] };
  }

  // Process each buying signal
  for (const signal of lead.buying_signals) {
    let points = 0;
    let signalName = signal.title;

    switch (signal.type) {
      case 'funding':
        points = 2;
        signalName = `Funding: ${signal.title}`;
        break;
      case 'leadership_change':
        points = 2;
        signalName = `Leadership Change: ${signal.title}`;
        break;
      case 'hiring':
      case 'expansion':
        points = 1;
        signalName = `Growth Signal: ${signal.title}`;
        break;
      case 'news':
      case 'product_launch':
        points = 1;
        signalName = `News/Product: ${signal.title}`;
        break;
      default:
        points = 0;
    }

    if (points > 0) {
      score += points;
      breakdown.push({
        signal_type: signal.type,
        signal_name: signalName,
        points,
        category: 'buying_signal',
      });
    }
  }

  // Cap at 10 points
  if (score > 10) {
    score = 10;
  }

  return { score, breakdown };
}

/**
 * Calculate fit score (0-4 points)
 * - Industry match: +2 (exact), +1 (partial)
 * - Job title match: +2 (exact), +1 (partial)
 */
function calculateFitScore(
  lead: ResearchedLead,
  targetIndustries: string[],
  targetRoles: string[]
): {
  score: number;
  breakdown: SignalBreakdown[];
} {
  let score = 0;
  const breakdown: SignalBreakdown[] = [];

  // 1. Industry match
  if (lead.company_industry && targetIndustries.length > 0) {
    const industryMatch = matchIndustry(lead.company_industry, targetIndustries);
    if (industryMatch.matched) {
      score += industryMatch.points;
      breakdown.push({
        signal_type: 'industry_match',
        signal_name: `Industry: ${lead.company_industry}`,
        points: industryMatch.points,
        category: 'fit',
      });
    }
  }

  // 2. Job title match
  if (lead.person_title && targetRoles.length > 0) {
    const titleMatch = matchJobTitle(lead.person_title, targetRoles);
    if (titleMatch.matched) {
      score += titleMatch.points;
      breakdown.push({
        signal_type: 'title_match',
        signal_name: `Title: ${lead.person_title}`,
        points: titleMatch.points,
        category: 'fit',
      });
    }
  }

  return { score, breakdown };
}

/**
 * Match lead industry against target industries
 * Returns +2 for exact match, +1 for partial match
 */
function matchIndustry(
  leadIndustry: string,
  targetIndustries: string[]
): { matched: boolean; points: number } {
  const leadIndustryLower = leadIndustry.toLowerCase().trim();

  for (const target of targetIndustries) {
    const targetLower = target.toLowerCase().trim();

    // Exact match
    if (leadIndustryLower === targetLower) {
      return { matched: true, points: 2 };
    }

    // Partial match (one contains the other)
    if (leadIndustryLower.includes(targetLower) || targetLower.includes(leadIndustryLower)) {
      return { matched: true, points: 1 };
    }
  }

  return { matched: false, points: 0 };
}

/**
 * Match lead job title against target roles
 * Returns +2 for exact match, +1 for partial match
 */
function matchJobTitle(
  leadTitle: string,
  targetRoles: string[]
): { matched: boolean; points: number } {
  const leadTitleLower = leadTitle.toLowerCase().trim();

  for (const target of targetRoles) {
    const targetLower = target.toLowerCase().trim();

    // Exact match
    if (leadTitleLower === targetLower) {
      return { matched: true, points: 2 };
    }

    // Partial match (title contains role or vice versa)
    if (leadTitleLower.includes(targetLower) || targetLower.includes(leadTitleLower)) {
      return { matched: true, points: 1 };
    }
  }

  return { matched: false, points: 0 };
}

/**
 * Determine priority level based on score
 * Special rule: 2+ buying signals with any fit = high priority
 * Otherwise:
 * - High: 6+ points
 * - Medium: 3-5 points
 * - Low: 0-2 points
 */
function determinePriorityLevel(
  totalScore: number,
  buyingSignalScore: number,
  fitScore: number,
  signalCount: number
): PriorityLevel {
  // Special rule: 2+ signals with any fit = high priority
  if (signalCount >= 2 && fitScore > 0) {
    return 'high';
  }

  // Standard scoring
  if (totalScore >= 6) {
    return 'high';
  } else if (totalScore >= 3) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Save priority score to database
 */
export async function savePriorityScore(params: {
  leadId: string;
  userId: string;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  buyingSignalScore: number;
  fitScore: number;
  signalBreakdown: SignalBreakdown[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const now = new Date().toISOString();

    // Check if lead has been scored before
    const { data: existingLead } = await supabase
      .from('researched_leads')
      .select('last_scored_at')
      .eq('id', params.leadId)
      .eq('user_id', params.userId)
      .single();

    const updateData = {
      priority_score: params.priorityScore,
      priority_level: params.priorityLevel,
      buying_signal_score: params.buyingSignalScore,
      fit_score: params.fitScore,
      signal_breakdown: params.signalBreakdown,
      last_rescored_at: existingLead?.last_scored_at ? now : null,
      last_scored_at: existingLead?.last_scored_at || now,
    };

    const { error: updateError } = await supabase
      .from('researched_leads')
      .update(updateData)
      .eq('id', params.leadId)
      .eq('user_id', params.userId);

    if (updateError) {
      console.error('Error saving priority score:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving priority score:', error);
    return { success: false, error: 'Failed to save priority score' };
  }
}

/**
 * Recalculate priority score for a lead (alias for calculatePriorityScore with forceRecalculate)
 */
export async function recalculatePriorityScore(leadId: string, userId: string) {
  return calculatePriorityScore({ leadId, userId, forceRecalculate: true });
}
