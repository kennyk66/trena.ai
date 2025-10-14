// PRD #0003: Manual Research API Route
// POST endpoint for manual lead research

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { researchLead } from '@/lib/research/research-service';
import type { ManualSearchInput } from '@/types/research';

export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json();
    const input: ManualSearchInput = {
      person_name: body.person_name,
      company_name: body.company_name,
      email: body.email,
      linkedin_url: body.linkedin_url,
    };

    // Validation: require at least one identifier
    if (!input.person_name && !input.company_name && !input.email && !input.linkedin_url) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide at least one of: person name, company name, email, or LinkedIn URL',
        },
        { status: 400 }
      );
    }

    // Research the lead
    const result = await researchLead({
      input,
      userId: user.id,
      method: 'manual',
      forceRefresh: body.forceRefresh || false,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      lead: result.lead,
      cached: result.cached || false,
    });
  } catch (error) {
    console.error('Manual research API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
