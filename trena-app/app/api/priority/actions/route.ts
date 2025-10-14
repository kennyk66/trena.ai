// PRD #0004: Lead Prioritization - Track Lead Actions API Route
// POST endpoint for tracking user actions on leads (contacted, viewed, etc.)

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { trackLeadAction } from '@/lib/priority/focus-service';

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
    const { lead_id, action_type, metadata } = body;

    if (!lead_id || !action_type) {
      return NextResponse.json(
        { success: false, error: 'lead_id and action_type are required' },
        { status: 400 }
      );
    }

    // 3. Validate action type
    const validActionTypes = ['contacted', 'viewed', 'added_to_focus', 'generated_outreach'];
    if (!validActionTypes.includes(action_type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid action_type. Must be one of: ${validActionTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 4. Track the action
    const result = await trackLeadAction({
      userId: user.id,
      leadId: lead_id,
      actionType: action_type,
      metadata: metadata || {},
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to track action' },
        { status: 500 }
      );
    }

    // 5. Return success
    return NextResponse.json({
      success: true,
      action: result.action,
    });
  } catch (error) {
    console.error('Track action API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
