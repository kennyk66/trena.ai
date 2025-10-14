// PRD #0003: Core Research Service
// Orchestrates Lusha API calls, AI persona generation, and database storage

import { createClient } from '@/lib/supabase/server';
import { personEnrich, companyEnrich, extractBuyingSignals } from '@/lib/lusha/client';
import { generatePersona } from '@/lib/ai/persona-generator';
import { calculatePriorityScore } from '@/lib/priority/scoring-service';
import { awardPoints } from '@/lib/gamification/gamification-service';
import type {
  ResearchedLead,
  ManualSearchInput,
  ResearchMethod,
  WorkHistory,
  TechStackItem,
} from '@/types/research';

/**
 * Research a lead: enrich data from Lusha, generate AI persona, save to database
 * @param input - Search parameters (person name, company, email, or LinkedIn)
 * @param userId - User ID for database storage
 * @param method - How the lead was researched (manual, csv, crm)
 * @param forceRefresh - Skip cache and regenerate (default: false)
 * @returns Researched lead with all enriched data
 */
export async function researchLead(params: {
  input: ManualSearchInput;
  userId: string;
  method: ResearchMethod;
  forceRefresh?: boolean;
}): Promise<{ success: boolean; lead?: ResearchedLead; error?: string; cached?: boolean }> {
  const { input, userId, method, forceRefresh = false } = params;
  const startTime = Date.now();

  try {
    // Step 1: Check for cached research (if not forcing refresh)
    if (!forceRefresh) {
      const cached = await getCachedLead(input, userId);
      if (cached) {
        console.log('Returning cached lead:', cached.id);
        return { success: true, lead: cached, cached: true };
      }
    }

    // Step 2: Enrich person data from Lusha
    console.log('Enriching person data from Lusha...');
    const personResult = await personEnrich({
      email: input.email,
      linkedin_url: input.linkedin_url,
      name: input.person_name,
      company: input.company_name,
    });

    if (!personResult.success || !personResult.data) {
      return {
        success: false,
        error: personResult.error || 'Could not find person data',
      };
    }

    const personData = personResult.data;

    // Step 3: Use company data already returned from person enrichment
    console.log('Using company data from person enrichment...');
    let companyData = personResult.companyData;

    // Only fetch separately if company data wasn't included in person response
    if (!companyData && input.company_name) {
      console.log('Enriching company data separately from Lusha...');
      const companyResult = await companyEnrich(input.company_name);
      if (companyResult.success) {
        companyData = companyResult.data;
      }
    }

    // Step 4: Extract buying signals (now with enhanced raw data from Lusha)
    console.log('Extracting buying signals...');
    const buyingSignals = extractBuyingSignals(companyData, personData, personResult.rawData);

    // Step 5: Get user's selling context for AI persona
    const supabase = await createClient();
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('selling_style, motivators, target_industries')
      .eq('id', userId)
      .single();

    // Step 6: Generate AI persona
    console.log('Generating AI persona...');
    const aiPersona = await generatePersona({
      personData,
      companyData,
      buyingSignals,
      userProfile: userProfile || undefined,
    });

    // Step 7: Transform work history to our format
    const workHistory: WorkHistory[] =
      personData.work_history?.map((job) => ({
        company_name: job.company,
        job_title: job.title,
        start_date: job.start_date,
        end_date: job.end_date,
        is_current: !job.end_date,
        duration: job.end_date
          ? calculateDuration(job.start_date, job.end_date)
          : 'Present',
      })) || [];

    // Step 8: Transform tech stack to our format
    const techStack: TechStackItem[] =
      companyData?.technologies?.map((tech) => ({
        name: tech,
        category: categorizeTechName(tech),
      })) || [];

    // Step 9: Save to database
    console.log('Saving lead to database...');
    const leadData = {
      user_id: userId,
      research_method: method,
      source: 'lusha' as const,

      // Person data
      person_name: personData.full_name || `${personData.first_name} ${personData.last_name}`,
      person_email: personData.email,
      person_phone: personData.phone,
      person_linkedin: personData.linkedin_url,
      person_title: personData.title,
      person_seniority: personData.seniority,
      person_location: personData.location,

      // Company data
      company_name: companyData?.name || personData.company?.name,
      company_domain: companyData?.domain || personData.company?.domain,
      company_industry: companyData?.industry || personData.company?.industry,
      company_size: companyData?.size,
      company_revenue: companyData?.revenue,
      company_location: companyData?.location,
      company_description: companyData?.description,

      // Rich data
      tech_stack: techStack,
      work_history: workHistory,
      buying_signals: buyingSignals,
      ai_persona: aiPersona,
    };

    const { data: savedLead, error: saveError } = await supabase
      .from('researched_leads')
      .insert(leadData)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving lead:', saveError);
      return { success: false, error: 'Failed to save lead to database' };
    }

    // Step 10: Calculate priority score (PRD #0004)
    console.log('Calculating priority score...');
    const priorityResult = await calculatePriorityScore({
      leadId: savedLead.id,
      userId,
      forceRecalculate: false,
    });

    if (priorityResult.success) {
      console.log('Priority score calculated:', priorityResult.priority?.priority_level);
      // Update the savedLead with priority data
      Object.assign(savedLead, {
        priority_score: priorityResult.priority?.priority_score,
        priority_level: priorityResult.priority?.priority_level,
        buying_signal_score: priorityResult.priority?.buying_signal_score,
        fit_score: priorityResult.priority?.fit_score,
        signal_breakdown: priorityResult.priority?.signal_breakdown,
      });
    } else {
      console.warn('Failed to calculate priority score:', priorityResult.error);
    }

    const elapsedTime = Date.now() - startTime;
    console.log(`Research completed in ${elapsedTime}ms`);

    // Step 11: Award gamification points (PRD #0007)
    const isHighPriority = savedLead.priority_level === 'high';
    await awardPoints({
      userId,
      eventType: isHighPriority ? 'high_priority_lead_researched' : 'lead_researched',
      metadata: {
        lead_id: savedLead.id,
        priority_level: savedLead.priority_level,
        priority_score: savedLead.priority_score,
      },
    });

    return { success: true, lead: savedLead as ResearchedLead, cached: false };
  } catch (error) {
    console.error('Research error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check if lead was recently researched (within 30 days)
 * Returns cached lead if found, null otherwise
 */
async function getCachedLead(
  input: ManualSearchInput,
  userId: string
): Promise<ResearchedLead | null> {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Build query to find matching lead
  let query = supabase
    .from('researched_leads')
    .select('*')
    .eq('user_id', userId)
    .gte('researched_at', thirtyDaysAgo.toISOString());

  // Match by email (most reliable)
  if (input.email) {
    query = query.eq('person_email', input.email);
  }
  // Match by LinkedIn URL
  else if (input.linkedin_url) {
    query = query.eq('person_linkedin', input.linkedin_url);
  }
  // Match by name + company
  else if (input.person_name && input.company_name) {
    query = query.eq('person_name', input.person_name).eq('company_name', input.company_name);
  }
  // Match by name only (less reliable)
  else if (input.person_name) {
    query = query.eq('person_name', input.person_name);
  } else {
    return null; // Not enough info to check cache
  }

  const { data, error } = await query.order('researched_at', { ascending: false }).limit(1).single();

  if (error || !data) {
    return null;
  }

  return data as ResearchedLead;
}

/**
 * Calculate duration between two dates
 */
function calculateDuration(startDate?: string, endDate?: string): string {
  if (!startDate) return 'Unknown';

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  } else if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  } else {
    return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
  }
}

/**
 * Categorize technology name (simple heuristic)
 */
function categorizeTechName(tech: string): string {
  const lowerTech = tech.toLowerCase();

  if (['salesforce', 'hubspot', 'pipedrive'].some(crm => lowerTech.includes(crm))) {
    return 'CRM';
  }
  if (['google analytics', 'mixpanel', 'amplitude'].some(analytics => lowerTech.includes(analytics))) {
    return 'Analytics';
  }
  if (['mailchimp', 'sendgrid', 'marketo'].some(marketing => lowerTech.includes(marketing))) {
    return 'Marketing';
  }
  if (['aws', 'azure', 'google cloud', 'heroku'].some(cloud => lowerTech.includes(cloud))) {
    return 'Infrastructure';
  }
  if (['react', 'vue', 'angular', 'node', 'python'].some(dev => lowerTech.includes(dev))) {
    return 'Development';
  }

  return 'Other';
}

/**
 * Get all researched leads for a user with filtering and pagination
 */
export async function getResearchedLeads(params: {
  userId: string;
  limit?: number;
  offset?: number;
  sortBy?: 'priority_desc' | 'priority_asc' | 'researched_at_desc' | 'researched_at_asc' | 'company_name_asc' | 'company_name_desc'; // PRD #0004: Added priority sorting
  filters?: {
    industry?: string;
    company_size?: string;
    has_email?: boolean;
    has_buying_signals?: boolean;
    search_query?: string;
    priority_level?: 'high' | 'medium' | 'low'; // PRD #0004: Added priority filter
  };
}): Promise<{ success: boolean; leads?: ResearchedLead[]; total?: number; error?: string }> {
  const {
    userId,
    limit = 20,
    offset = 0,
    sortBy = 'researched_at_desc',
    filters = {},
  } = params;

  try {
    const supabase = await createClient();
    let query = supabase.from('researched_leads').select('*', { count: 'exact' }).eq('user_id', userId);

    // Apply filters
    if (filters.industry) {
      query = query.eq('company_industry', filters.industry);
    }
    if (filters.company_size) {
      query = query.eq('company_size', filters.company_size);
    }
    if (filters.has_email) {
      query = query.not('person_email', 'is', null);
    }
    if (filters.has_buying_signals) {
      query = query.not('buying_signals', 'eq', '[]');
    }
    if (filters.search_query) {
      // Search by person name or company name
      query = query.or(
        `person_name.ilike.%${filters.search_query}%,company_name.ilike.%${filters.search_query}%`
      );
    }
    if (filters.priority_level) {
      // PRD #0004: Filter by priority level
      query = query.eq('priority_level', filters.priority_level);
    }

    // Apply sorting
    switch (sortBy) {
      case 'priority_desc': // PRD #0004: Sort by priority score (high to low)
        query = query.order('priority_score', { ascending: false });
        break;
      case 'priority_asc': // PRD #0004: Sort by priority score (low to high)
        query = query.order('priority_score', { ascending: true });
        break;
      case 'researched_at_desc':
        query = query.order('researched_at', { ascending: false });
        break;
      case 'researched_at_asc':
        query = query.order('researched_at', { ascending: true });
        break;
      case 'company_name_asc':
        query = query.order('company_name', { ascending: true });
        break;
      case 'company_name_desc':
        query = query.order('company_name', { ascending: false });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      return { success: false, error: 'Failed to fetch leads' };
    }

    return {
      success: true,
      leads: data as ResearchedLead[],
      total: count || 0,
    };
  } catch (error) {
    console.error('Get leads error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get a single researched lead by ID
 */
export async function getResearchedLead(params: {
  leadId: string;
  userId: string;
}): Promise<{ success: boolean; lead?: ResearchedLead; error?: string }> {
  const { leadId, userId } = params;

  try {
    const supabase = await createClient();

    // Update last_viewed_at timestamp
    const { data, error } = await supabase
      .from('researched_leads')
      .update({ last_viewed_at: new Date().toISOString() })
      .eq('id', leadId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error fetching lead:', error);
      return { success: false, error: 'Lead not found' };
    }

    return { success: true, lead: data as ResearchedLead };
  } catch (error) {
    console.error('Get lead error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Regenerate AI persona for an existing lead
 */
export async function regeneratePersona(params: {
  leadId: string;
  userId: string;
}): Promise<{ success: boolean; lead?: ResearchedLead; error?: string }> {
  const { leadId, userId } = params;

  try {
    const supabase = await createClient();

    // Get existing lead
    const { data: existingLead, error: fetchError } = await supabase
      .from('researched_leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingLead) {
      return { success: false, error: 'Lead not found' };
    }

    // Get user profile for context
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('selling_style, motivators, target_industries')
      .eq('id', userId)
      .single();

    // Reconstruct person and company data for AI generation
    const personData = {
      first_name: existingLead.person_name?.split(' ')[0] || '',
      last_name: existingLead.person_name?.split(' ').slice(1).join(' ') || '',
      full_name: existingLead.person_name || '',
      email: existingLead.person_email,
      phone: existingLead.person_phone,
      linkedin_url: existingLead.person_linkedin,
      title: existingLead.person_title,
      seniority: existingLead.person_seniority,
      location: existingLead.person_location,
      company: {
        name: existingLead.company_name || '',
        domain: existingLead.company_domain,
        industry: existingLead.company_industry,
      },
      work_history: existingLead.work_history || [],
      education: [],
    };

    const companyData = {
      name: existingLead.company_name || '',
      domain: existingLead.company_domain,
      industry: existingLead.company_industry,
      size: existingLead.company_size,
      revenue: existingLead.company_revenue,
      location: existingLead.company_location,
      description: existingLead.company_description,
      technologies: existingLead.tech_stack?.map((t: TechStackItem) => t.name) || [],
    };

    // Regenerate AI persona
    const aiPersona = await generatePersona({
      personData,
      companyData,
      buyingSignals: existingLead.buying_signals || [],
      userProfile: userProfile || undefined,
    });

    // Update lead with new persona
    const { data: updatedLead, error: updateError } = await supabase
      .from('researched_leads')
      .update({ ai_persona: aiPersona })
      .eq('id', leadId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: 'Failed to update persona' };
    }

    return { success: true, lead: updatedLead as ResearchedLead };
  } catch (error) {
    console.error('Regenerate persona error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
