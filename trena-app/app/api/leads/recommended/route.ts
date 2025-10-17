import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchPeopleWithFallback } from '@/lib/lusha/client';

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
    const clearCache = searchParams.get('clearCache') === 'true';

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

    // Clear cache if requested
    if (clearCache) {
      console.log('🗑️ Clearing cached recommended leads');
      await supabase
        .from('user_profiles')
        .update({
          recommended_leads_cache: null,
          recommended_leads_cached_at: null,
        })
        .eq('id', user.id);
    }

    // Check cache first (unless forceRefresh)
    if (!forceRefresh && !clearCache) {
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
        console.log('📦 Returning cached recommended leads');
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

    // Search for leads using Lusha API with progressive fallback strategies
    console.log('🚀 Starting enhanced Lusha lead search with progressive strategies');
    console.log('📊 User preferences:', {
      industries: profile.target_industries,
      roles: profile.target_roles,
      region: profile.target_region,
      limit
    });

    const userPreferences = {
      industries: profile.target_industries || [],
      roles: profile.target_roles || [],
      region: profile.target_region || undefined
    };

    const result = await searchPeopleWithFallback(
      {
        industries: profile.target_industries || [],
        jobTitles: profile.target_roles || [],
        regions: profile.target_region ? [profile.target_region] : [],
        limit,
      },
      userPreferences
    );

    if (!result.success || !result.data) {
      console.log('❌ All search strategies failed');
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch leads from Lusha API after trying multiple strategies',
          strategy: result.strategy,
          suggestions: [
            'Try broadening your target industries or roles',
            'Check if your Lusha API key is valid and has sufficient credits',
            'Enable mock data by setting LUSHA_USE_MOCK_DATA=true in your environment',
            'Contact support if this issue persists'
          ]
        },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully found ${result.data.length} leads using strategy: ${result.strategy?.name}`);

    // Lusha API already returns enriched leads with match scoring
    const enrichedLeads = result.data;

    console.log('📈 Lead match scores:', enrichedLeads.map((lead: { lead_name?: string; name?: string; match_score?: number; match_reasoning?: string }) => ({
      name: lead.lead_name || lead.name,
      score: lead.match_score,
      reasoning: lead.match_reasoning
    })));

    // Cache the results and update last refresh timestamp
    const now = new Date().toISOString();
    await supabase
      .from('user_profiles')
      .update({
        recommended_leads_cache: enrichedLeads,
        recommended_leads_cached_at: now,
        recommended_leads_last_refresh: now,
      })
      .eq('id', user.id);

    console.log(`Cached ${enrichedLeads.length} recommended leads for user ${user.id}`);

    return NextResponse.json({
      success: true,
      leads: enrichedLeads,
      cached: false,
      strategy: result.strategy,
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
