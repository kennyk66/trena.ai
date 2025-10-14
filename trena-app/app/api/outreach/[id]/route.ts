// GET /api/outreach/[id] - Get single message with events
// PUT /api/outreach/[id] - Update message
// DELETE /api/outreach/[id] - Delete message

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { UpdateMessageInput } from '@/types/outreach';

export async function GET(
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

    // Fetch message
    const { data: message, error: messageError } = await supabase
      .from('outreach_messages')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    // Fetch events
    const { data: events } = await supabase
      .from('message_events')
      .select('*')
      .eq('message_id', id)
      .order('timestamp', { ascending: false });

    return NextResponse.json({
      success: true,
      message: {
        ...message,
        events: events || [],
      },
    });
  } catch (error) {
    console.error('Get message API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Parse request body
    const body: UpdateMessageInput = await request.json();

    // Build update object
    const updates: Partial<UpdateMessageInput & { sent_at: string }> = {};

    if (body.edited_content !== undefined) {
      updates.edited_content = body.edited_content;
    }

    if (body.final_content !== undefined) {
      updates.final_content = body.final_content;
    }

    if (body.status !== undefined) {
      updates.status = body.status;

      // If status is being set to 'sent', set sent_at
      if (body.status === 'sent' && !body.sent_at) {
        updates.sent_at = new Date().toISOString();
      }
    }

    if (body.coaching_applied !== undefined) {
      updates.coaching_applied = body.coaching_applied;
    }

    if (body.sent_at !== undefined) {
      updates.sent_at = body.sent_at;
    }

    // Update message
    const { data, error } = await supabase
      .from('outreach_messages')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Failed to update message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: data,
    });
  } catch (error) {
    console.error('Update message API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Only allow deleting drafts
    const { data: message } = await supabase
      .from('outreach_messages')
      .select('status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    if (message.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: 'Only draft messages can be deleted' },
        { status: 400 }
      );
    }

    // Delete message
    const { error } = await supabase
      .from('outreach_messages')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete message API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
