import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchPeople, convertToLeadData } from '@/lib/lusha/client';

// Rate limiting configuration
const REFRESH_COOLDOWN_SECONDS = parseInt(process.env.LUSHA_REFRESH_COOLDOWN_SECONDS || '30', 10);
const CACHE_HOURS = parseInt(process.env.LUSHA_CACHE_HOURS || '24', 10);

/**
 * GET /api/leads/recommended
 * Returns Lusha leads that match the user's onboarding preferences
 * Includes rate limiting and caching to control API usage
 */
export async function GET(request: Request) {
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

    // Parse URL parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3', 10);
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    // Get user's onboarding preferences
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

    // Check if user has completed onboarding
    if (
      !profile.target_industries ||
      profile.target_industries.length === 0 ||
      !profile.target_roles ||
      profile.target_roles.length === 0
    ) {
      return NextResponse.json({
        success: true,
        leads: [],
        message: 'Please complete onboarding to see recommended leads',
      });
    }

    // Check cache first (unless forceRefresh)
    if (!forceRefresh) {
      const cacheExpiryTime = new Date();
      cacheExpiryTime.setHours(cacheExpiryTime.getHours() - CACHE_HOURS);

      const { data: cachedLeads } = await supabase
        .from('user_profiles')
        .select('recommended_leads_cache, recommended_leads_cached_at')
        .eq('id', user.id)
        .single();

      if (
        cachedLeads?.recommended_leads_cache &&
        cachedLeads?.recommended_leads_cached_at &&
        new Date(cachedLeads.recommended_leads_cached_at) > cacheExpiryTime
      ) {
        console.log('Returning cached recommended leads');
        return NextResponse.json({
          success: true,
          leads: cachedLeads.recommended_leads_cache,
          cached: true,
          preferences: {
            industries: profile.target_industries,
            roles: profile.target_roles,
            region: profile.target_region,
          },
        });
      }
    }

    // Check rate limiting (cooldown between refreshes)
    const { data: lastRefresh } = await supabase
      .from('user_profiles')
      .select('recommended_leads_last_refresh')
      .eq('id', user.id)
      .single();

    if (lastRefresh?.recommended_leads_last_refresh && !forceRefresh) {
      const lastRefreshTime = new Date(lastRefresh.recommended_leads_last_refresh);
      const timeSinceLastRefresh = (Date.now() - lastRefreshTime.getTime()) / 1000; // seconds

      if (timeSinceLastRefresh < REFRESH_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(REFRESH_COOLDOWN_SECONDS - timeSinceLastRefresh);
        return NextResponse.json(
          {
            success: false,
            error: `Please wait ${waitSeconds} seconds before refreshing`,
            rateLimited: true,
            waitSeconds,
          },
          { status: 429 }
        );
      }
    }

    // Search for leads using Lusha with user's preferences
    console.log('Fetching fresh leads from Lusha Prospecting API');
    const result = await searchPeople({
      industries: profile.target_industries || [],
      jobTitles: profile.target_roles || [],
      regions: profile.target_region ? [profile.target_region] : [],
      limit,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch leads from Lusha',
        },
        { status: 500 }
      );
    }

    // Convert to LeadData format and add match reasoning
    const leadsWithMatching = result.data.map((person) => {
      const leadData = convertToLeadData(person);

      // Calculate match score and reasoning
      const matches: string[] = [];
      let matchScore = 0;

      // Industry match
      if (person.company?.industry && profile.target_industries) {
        const industryMatch = profile.target_industries.some(
          (targetIndustry: string) =>
            person.company?.industry?.toLowerCase().includes(targetIndustry.toLowerCase()) ||
            targetIndustry.toLowerCase().includes(person.company?.industry?.toLowerCase() || '')
        );
        if (industryMatch) {
          matches.push(`${person.company.industry} industry`);
          matchScore += 2;
        }
      }

      // Role/title match
      if (person.jobTitle && profile.target_roles) {
        const roleMatch = profile.target_roles.some(
          (targetRole: string) =>
            person.jobTitle?.toLowerCase().includes(targetRole.toLowerCase()) ||
            targetRole.toLowerCase().includes(person.jobTitle?.toLowerCase() || '')
        );
        if (roleMatch) {
          matches.push(`${person.jobTitle} role`);
          matchScore += 2;
        }
      }

      // Region match
      if (profile.target_region && profile.target_region !== 'Global/Multiple regions') {
        matches.push(`${profile.target_region} region`);
        matchScore += 1;
      }

      return {
        ...leadData,
        match_reasoning: matches.length > 0
          ? `Matches your target: ${matches.join(', ')}`
          : 'Recommended based on your preferences',
        match_score: matchScore,
      };
    });

    // Sort by match score (highest first)
    const sortedLeads = leadsWithMatching.sort((a, b) => b.match_score - a.match_score);

    // Cache the results and update last refresh timestamp
    const now = new Date().toISOString();
    await supabase
      .from('user_profiles')
      .update({
        recommended_leads_cache: sortedLeads,
        recommended_leads_cached_at: now,
        recommended_leads_last_refresh: now,
      })
      .eq('id', user.id);

    console.log(`Cached ${sortedLeads.length} recommended leads for user ${user.id}`);

    return NextResponse.json({
      success: true,
      leads: sortedLeads,
      cached: false,
      preferences: {
        industries: profile.target_industries,
        roles: profile.target_roles,
        region: profile.target_region,
      },
    });
  } catch (error) {
    console.error('Error fetching recommended leads:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
