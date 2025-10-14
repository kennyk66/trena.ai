// PRD #0004: Lead Prioritization - Calculate Priority API Route
// POST /api/priority/calculate - Calculate or recalculate priority score for a lead

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculatePriorityScore } from '@/lib/priority/scoring-service';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { lead_id, force_recalculate } = body;

    if (!lead_id) {
      return NextResponse.json({ success: false, error: 'lead_id is required' }, { status: 400 });
    }

    // 3. Calculate priority score
    const result = await calculatePriorityScore({
      leadId: lead_id,
      userId: user.id,
      forceRecalculate: force_recalculate || false,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to calculate priority' },
        { status: 500 }
      );
    }

    // 4. Return priority data
    return NextResponse.json({
      success: true,
      priority: result.priority,
    });
  } catch (error) {
    console.error('Error in calculate priority API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
