import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ClayClient } from '@/lib/clay/client';
import { ClayDataMapper } from '@/lib/clay/data-mapper';

export async function POST() {
  try {
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

    // Get user profile to build search params
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('target_industries, target_roles, target_region')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Initialize Clay.com client
    const clayClient = new ClayClient({
      apiKey: process.env.CLAY_API_KEY!,
      rateLimit: {
        requests_per_minute: 60,
        requests_per_second: 1,
        burst_limit: 5
      },
      cache: {
        enabled: true,
        ttl_hours: 24,
        max_size: 100
      },
      mockData: {
        enabled: process.env.CLAY_USE_MOCK_DATA === 'true',
        fallback_on_error: true
      }
    });

    console.log('🚀 Generating Clay.com leads for quick-win with preferences:', {
      industries: profile.target_industries,
      roles: profile.target_roles,
      region: profile.target_region
    });

    // Search for leads using Clay.com
    const userPreferences = {
      industries: profile.target_industries || [],
      roles: profile.target_roles || [],
      region: profile.target_region || undefined
    };

    const result = await clayClient.searchPeopleWithFallback(
      {
        industries: profile.target_industries || [],
        job_titles: profile.target_roles || [],
        regions: profile.target_region ? [profile.target_region] : [],
        limit: 3,
      },
      userPreferences
    );

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch leads from Clay.com',
        },
        { status: 500 }
      );
    }

    // Handle empty results gracefully
    if (result.data.length === 0) {
      return NextResponse.json({
        success: true,
        leads: [],
        message: 'No prospects found matching your criteria. Try adjusting your target industries or regions.',
      });
    }

    // Transform Clay.com data to lead format
    const leads = ClayDataMapper.toLeadDataArray(result.data);

    // Save leads to database
    const leadsToSave = leads.map((lead) => ({
      user_id: user.id,
      lead_name: lead.lead_name,
      job_title: lead.job_title,
      company_name: lead.company_name,
      email: lead.email,
      phone: lead.phone,
      linkedin_url: lead.linkedin_url,
      company_size: lead.company_size,
      industry: lead.industry,
      source: lead.source,
    }));

    const { error } = await supabase
      .from('quick_win_leads')
      .insert(leadsToSave);

    if (error) {
      console.error('Error saving leads:', error);
      // Don't fail the request if saving fails, just log it
    }

    return NextResponse.json({
      success: true,
      leads,
    });
  } catch (error) {
    console.error('Error generating leads:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
