// GET /api/outreach/messages - List user's outreach messages with filters

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { MessageFilters, MessageSortOption } from '@/types/outreach';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sort = (searchParams.get('sort') || 'created_at_desc') as MessageSortOption;

    // Build filters
    const filters: MessageFilters = {
      lead_id: searchParams.get('lead_id') || undefined,
      message_type: (searchParams.get('message_type') as MessageFilters['message_type']) || undefined,
      status: (searchParams.get('status') as MessageFilters['status']) || undefined,
      tone: (searchParams.get('tone') as MessageFilters['tone']) || undefined,
      search_query: searchParams.get('search_query') || undefined,
    };

    // Build query
    let query = supabase
      .from('outreach_messages')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (filters.lead_id) {
      query = query.eq('lead_id', filters.lead_id);
    }

    if (filters.message_type) {
      query = query.eq('message_type', filters.message_type);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.tone) {
      query = query.eq('tone', filters.tone);
    }

    if (filters.search_query) {
      query = query.or(
        `subject.ilike.%${filters.search_query}%,generated_content.ilike.%${filters.search_query}%,edited_content.ilike.%${filters.search_query}%`
      );
    }

    // Apply sorting
    if (sort === 'created_at_desc') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'created_at_asc') {
      query = query.order('created_at', { ascending: true });
    } else if (sort === 'sent_at_desc') {
      query = query.order('sent_at', { ascending: false, nullsFirst: false });
    } else if (sort === 'sent_at_asc') {
      query = query.order('sent_at', { ascending: true, nullsFirst: false });
    } else if (sort === 'subject_asc') {
      query = query.order('subject', { ascending: true, nullsFirst: false });
    } else if (sort === 'subject_desc') {
      query = query.order('subject', { ascending: false, nullsFirst: false });
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Fetch messages error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    const total = count || 0;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      success: true,
      messages: data || [],
      total,
      page,
      limit,
      has_more: hasMore,
    });
  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
