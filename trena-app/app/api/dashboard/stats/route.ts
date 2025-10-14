// PRD #0006: Dashboard Stats API
// Returns comprehensive dashboard statistics for a user

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDashboardStats } from '@/lib/analytics/analytics-service';

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

    // Get dashboard stats
    const result = await getDashboardStats(user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stats: result.stats,
    });
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get dashboard stats',
      },
      { status: 500 }
    );
  }
}
