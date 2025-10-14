// PRD #0007: Gamification Stats API
// Returns user's gamification statistics

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGamificationStats } from '@/lib/gamification/gamification-service';

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

    // Get gamification stats
    const result = await getGamificationStats(user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stats: result.stats,
    });
  } catch (error) {
    console.error('Gamification stats API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get gamification stats',
      },
      { status: 500 }
    );
  }
}
