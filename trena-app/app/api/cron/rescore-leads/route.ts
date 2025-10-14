// PRD #0004: Lead Prioritization - Daily Re-scoring Cron Job
// Recalculates priority scores for all researched leads daily
// This ensures scores stay current as user profiles and buying signals may change

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recalculatePriorityScore } from '@/lib/priority/scoring-service';

/**
 * Cron job to re-score all leads daily
 * Triggered by Vercel Cron at 2 AM UTC
 *
 * Security: Requires CRON_SECRET header to match environment variable
 *
 * Process:
 * 1. Verify cron secret
 * 2. Get all users with researched leads
 * 3. For each user, recalculate scores for all their leads
 * 4. Track success/failure counts
 * 5. Return summary
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Invalid cron secret');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const startTime = Date.now();

    // 2. Get all users who have researched leads
    const { data: usersWithLeads, error: usersError } = await supabase
      .from('researched_leads')
      .select('user_id')
      .not('user_id', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(usersWithLeads?.map((l) => l.user_id) || [])];

    let totalLeads = 0;
    let successCount = 0;
    let failureCount = 0;
    const userStats: Record<string, { leads: number; success: number; failed: number }> = {};

    // 3. For each user, recalculate scores for all their leads
    for (const userId of uniqueUserIds) {
      if (!userId) continue;

      // Get all leads for this user
      const { data: userLeads, error: leadsError } = await supabase
        .from('researched_leads')
        .select('id')
        .eq('user_id', userId);

      if (leadsError || !userLeads) {
        console.error(`Error fetching leads for user ${userId}:`, leadsError);
        continue;
      }

      userStats[userId] = { leads: userLeads.length, success: 0, failed: 0 };
      totalLeads += userLeads.length;

      // Recalculate score for each lead
      for (const lead of userLeads) {
        try {
          const result = await recalculatePriorityScore(lead.id, userId);

          if (result.success) {
            successCount++;
            userStats[userId].success++;
          } else {
            failureCount++;
            userStats[userId].failed++;
            console.error(`Failed to rescore lead ${lead.id}:`, result.error);
          }
        } catch (error) {
          failureCount++;
          userStats[userId].failed++;
          console.error(`Error rescoring lead ${lead.id}:`, error);
        }
      }
    }

    const duration = Date.now() - startTime;

    // 4. Return summary
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      stats: {
        users_processed: uniqueUserIds.length,
        total_leads: totalLeads,
        successfully_rescored: successCount,
        failed: failureCount,
        success_rate: totalLeads > 0 ? ((successCount / totalLeads) * 100).toFixed(2) + '%' : '0%',
      },
      user_stats: userStats,
    };

    console.log('Lead re-scoring cron job completed:', summary);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error in rescore-leads cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to rescore leads',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
