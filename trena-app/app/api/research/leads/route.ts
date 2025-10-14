// PRD #0003: Get Researched Leads List API Route
// GET endpoint for fetching user's researched leads with filtering, sorting, pagination

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getResearchedLeads } from '@/lib/research/research-service';
import type { ResearchSortOption } from '@/types/research';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = (searchParams.get('sortBy') || 'researched_at_desc') as ResearchSortOption;

    // Parse filters
    const filters = {
      industry: searchParams.get('industry') || undefined,
      company_size: searchParams.get('company_size') || undefined,
      has_email: searchParams.get('has_email') === 'true' ? true : undefined,
      has_buying_signals: searchParams.get('has_buying_signals') === 'true' ? true : undefined,
      search_query: searchParams.get('search_query') || undefined,
      priority_level: searchParams.get('priority_level') as 'high' | 'medium' | 'low' | undefined, // PRD #0004
    };

    // Get leads
    const result = await getResearchedLeads({
      userId: user.id,
      limit,
      offset,
      sortBy,
      filters,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      leads: result.leads,
      total: result.total,
      page: Math.floor(offset / limit) + 1,
      limit,
      has_more: (result.total || 0) > offset + limit,
    });
  } catch (error) {
    console.error('Get leads API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
