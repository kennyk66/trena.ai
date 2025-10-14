// PRD #0007: Gamification Summary API
// Returns gamification summary for dashboard widget

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGamificationSummary } from '@/lib/gamification/gamification-service';

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

    // Get gamification summary
    const result = await getGamificationSummary(user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      summary: result.summary,
    });
  } catch (error) {
    console.error('Gamification summary API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get gamification summary',
      },
      { status: 500 }
    );
  }
}
