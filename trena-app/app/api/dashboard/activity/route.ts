// PRD #0006: Recent Activity API
// Returns recent user activity for the dashboard

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRecentActivity } from '@/lib/analytics/analytics-service';

export async function GET(request: Request) {
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Get recent activity
    const result = await getRecentActivity({
      userId: user.id,
      limit,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      activities: result.activities,
    });
  } catch (error) {
    console.error('Recent activity API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recent activity',
      },
      { status: 500 }
    );
  }
}
