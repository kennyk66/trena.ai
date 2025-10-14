// PRD #0004: Lead Prioritization - Daily Focus Generation Cron Job
// Generates Today's Focus list for all users at midnight
// This ensures users have fresh focus lists ready when they start their day

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDailyFocus } from '@/lib/priority/focus-service';

/**
 * Cron job to generate daily focus for all users
 * Triggered by Vercel Cron at 12:00 AM UTC
 *
 * Security: Requires CRON_SECRET header to match environment variable
 *
 * Process:
 * 1. Verify cron secret
 * 2. Get all users with researched leads
 * 3. For each user, generate today's focus list (top 5 priority leads)
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
    const today = new Date().toISOString().split('T')[0];

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

    let successCount = 0;
    let failureCount = 0;
    let alreadyExistsCount = 0;
    const focusStats: Record<string, {
      status: 'success' | 'failed' | 'already_exists';
      lead_count?: number;
      error?: string;
    }> = {};

    // 3. For each user, generate today's focus
    for (const userId of uniqueUserIds) {
      if (!userId) continue;

      try {
        // Check if focus already exists for today
        const { data: existingFocus } = await supabase
          .from('daily_focus')
          .select('id, lead_ids')
          .eq('user_id', userId)
          .eq('focus_date', today)
          .single();

        if (existingFocus) {
          alreadyExistsCount++;
          const leadIds = (existingFocus.lead_ids as unknown) as string[];
          focusStats[userId] = {
            status: 'already_exists',
            lead_count: leadIds.length,
          };
          continue;
        }

        // Generate focus for today
        const result = await generateDailyFocus({
          userId,
          focusDate: today,
          limit: 5,
          excludeContactedDays: 7,
        });

        if (result.success && result.focus) {
          successCount++;
          focusStats[userId] = {
            status: 'success',
            lead_count: result.leads?.length || 0,
          };
        } else {
          failureCount++;
          focusStats[userId] = {
            status: 'failed',
            error: result.error || 'Unknown error',
          };
          console.error(`Failed to generate focus for user ${userId}:`, result.error);
        }
      } catch (error) {
        failureCount++;
        focusStats[userId] = {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        console.error(`Error generating focus for user ${userId}:`, error);
      }
    }

    const duration = Date.now() - startTime;

    // 4. Return summary
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      focus_date: today,
      duration_ms: duration,
      stats: {
        users_processed: uniqueUserIds.length,
        newly_generated: successCount,
        already_exists: alreadyExistsCount,
        failed: failureCount,
        success_rate: uniqueUserIds.length > 0
          ? (((successCount + alreadyExistsCount) / uniqueUserIds.length) * 100).toFixed(2) + '%'
          : '0%',
      },
      focus_stats: focusStats,
    };

    console.log('Daily focus generation cron job completed:', summary);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error in generate-focus cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate daily focus',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
