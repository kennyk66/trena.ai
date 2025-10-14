// POST /api/outreach/generate - Generate personalized outreach message

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateOutreach } from '@/lib/outreach/generation-service';
import { analyzeMessage } from '@/lib/outreach/coaching-service';
import type { GenerateOutreachInput } from '@/types/outreach';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const input: GenerateOutreachInput = {
      lead_id: body.lead_id,
      message_type: body.message_type,
      tone: body.tone,
      template_id: body.template_id,
      custom_instructions: body.custom_instructions,
    };

    // Validate required fields
    if (!input.lead_id || !input.message_type || !input.tone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: lead_id, message_type, tone',
        },
        { status: 400 }
      );
    }

    // Validate message type
    if (!['email', 'linkedin', 'call_script'].includes(input.message_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid message_type' },
        { status: 400 }
      );
    }

    // Validate tone
    if (!['warm', 'direct', 'formal', 'casual'].includes(input.tone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tone' },
        { status: 400 }
      );
    }

    // Generate outreach message
    const result = await generateOutreach({
      userId: user.id,
      input,
    });

    if (!result.success || !result.message) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate message' },
        { status: 500 }
      );
    }

    // Analyze message for coaching tips
    const coaching = await analyzeMessage({
      content: result.message.generated_content,
      subject: result.message.subject,
      messageType: result.message.message_type,
    });

    // Update message with coaching score
    await supabase
      .from('outreach_messages')
      .update({ coaching_score: coaching.score })
      .eq('id', result.message.id);

    result.message.coaching_score = coaching.score;

    return NextResponse.json({
      success: true,
      message: result.message,
      coaching,
    });
  } catch (error) {
    console.error('Generate outreach API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
