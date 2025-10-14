// PRD #0004: Lead Prioritization - Get Today's Focus API Route
// GET endpoint for fetching user's daily focus list

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDailyFocus } from '@/lib/priority/focus-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const focusDate = searchParams.get('date') || undefined; // Optional date (YYYY-MM-DD)

    // 3. Get or generate today's focus
    const result = await getDailyFocus({
      userId: user.id,
      focusDate,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to get focus' },
        { status: 500 }
      );
    }

    // 4. Return focus and leads
    return NextResponse.json({
      success: true,
      focus: result.focus,
      leads: result.leads,
      count: result.leads?.length || 0,
    });
  } catch (error) {
    console.error('Get focus API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
