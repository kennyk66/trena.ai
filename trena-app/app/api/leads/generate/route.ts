import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchPeople, convertToLeadData } from '@/lib/lusha/client';

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

    // Search for leads using Lusha
    const result = await searchPeople({
      industries: profile.target_industries || [],
      jobTitles: profile.target_roles || [],
      regions: profile.target_region ? [profile.target_region] : [],
      limit: 3,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch leads',
        },
        { status: 500 }
      );
    }

    // Handle empty results gracefully
    if (!result.data || result.data.length === 0) {
      return NextResponse.json({
        success: true,
        leads: [],
        message: 'No prospects found matching your criteria. Try adjusting your target industries or regions.',
      });
    }

    // Convert to LeadData format
    const leads = result.data.map(convertToLeadData);

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
