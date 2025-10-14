// POST /api/outreach/[id]/regenerate - Regenerate message with same parameters

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateOutreach } from '@/lib/outreach/generation-service';
import { analyzeMessage } from '@/lib/outreach/coaching-service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch existing message to get parameters
    const { data: existingMessage, error: fetchError } = await supabase
      .from('outreach_messages')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingMessage) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    // Parse custom instructions from request body (optional)
    const body = await request.json().catch(() => ({}));
    const customInstructions = body.custom_instructions;

    // Generate new message with same parameters
    const result = await generateOutreach({
      userId: user.id,
      input: {
        lead_id: existingMessage.lead_id,
        message_type: existingMessage.message_type,
        tone: existingMessage.tone,
        custom_instructions: customInstructions,
      },
    });

    if (!result.success || !result.message) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to regenerate message' },
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

    // Delete old message (only if it was a draft)
    if (existingMessage.status === 'draft') {
      await supabase
        .from('outreach_messages')
        .delete()
        .eq('id', id);
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      coaching,
    });
  } catch (error) {
    console.error('Regenerate message API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
