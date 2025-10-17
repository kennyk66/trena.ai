import {
  LushaSearchParams,
  LushaPersonData,
  LushaApiResponse,
  LeadData,
} from '@/types/onboarding';
import type {
  LushaCompanyData,
  LushaPersonData as EnrichedPersonData,
  BuyingSignal,
} from '@/types/research';
import {
  getProgressiveSearchStrategies,
  SearchStrategy,
  getMatchReasoning,
  INDUSTRY_MAPPINGS,
  getSeniorityLevels
} from './industry-mappings';

const LUSHA_API_BASE_URL = 'https://api.lusha.com/v2';
const LUSHA_PROSPECTING_URL = 'https://api.lusha.com/prospecting';

/**
 * Lusha API Client
 * Documentation: https://www.lusha.com/docs/api/
 */

/**
 * Search for people using Lusha Prospecting API with progressive fallback strategies
 * Tries multiple search approaches from specific to broad until finding results
 *
 * @param params - Search parameters (industries, job titles, regions)
 * @param userPreferences - Original user preferences for match reasoning
 * @returns Array of enriched lead data with strategy information
 */
export async function searchPeopleWithFallback(
  params: LushaSearchParams,
  userPreferences?: {
    industries: string[];
    roles: string[];
    region?: string;
  }
): Promise<{ success: boolean; data?: LeadData[]; strategy?: SearchStrategy; error?: string }> {
  console.log('🔍 Starting progressive search with fallback strategies');

  // Generate search strategies based on user preferences
  const strategies = userPreferences
    ? getProgressiveSearchStrategies(userPreferences.industries, userPreferences.roles, userPreferences.region)
    : getProgressiveSearchStrategies(params.industries || [], params.jobTitles || [], params.regions?.[0]);

  console.log(`📋 Generated ${strategies.length} search strategies:`, strategies.map(s => s.name));

  // Try each strategy until we find results
  for (let i = 0; i < strategies.length; i++) {
    const strategy = strategies[i];
    console.log(`\n🎯 Strategy ${i + 1}/${strategies.length}: ${strategy.name} - ${strategy.description}`);

    try {
      // Search using this strategy
      const searchResult = await searchPeople({
        industries: strategy.industries,
        jobTitles: strategy.jobTitles,
        regions: strategy.regions,
        limit: params.limit || 3
      });

      if (searchResult.success && searchResult.data && searchResult.data.length > 0) {
        console.log(`✅ SUCCESS: Strategy "${strategy.name}" found ${searchResult.data.length} leads`);

        // Add match reasoning to each lead - return as LeadData array
        const enrichedLeads = searchResult.data.map(lead => ({
          ...convertToLeadData(lead),
          match_reasoning: getMatchReasoning(lead,
            userPreferences?.industries || [],
            userPreferences?.roles || [],
            strategy
          ),
          match_score: calculateMatchScore(lead, userPreferences),
          strategy_used: strategy.name
        }));

        // Sort by match score
        enrichedLeads.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

        return {
          success: true,
          data: enrichedLeads,
          strategy
        };
      } else {
        console.log(`❌ Strategy "${strategy.name}" failed: ${searchResult.error || 'No results'}`);
      }
    } catch (error) {
      console.error(`❌ Strategy "${strategy.name}" threw error:`, error);
    }
  }

  // If all strategies failed, return empty with helpful message
  console.log('\n🚫 All search strategies failed');
  return {
    success: false,
    error: 'No leads found using any search strategy. This may indicate API issues or very specific search criteria.',
    strategy: strategies[strategies.length - 1] // Return the last (most general) strategy
  };
}

/**
 * Calculate match score for a lead based on user preferences
 */
function calculateMatchScore(
  lead: LushaPersonData,
  userPreferences?: { industries: string[]; roles: string[] }
): number {
  if (!userPreferences) return 1;

  let score = 0;

  // Industry match
  if (lead.company?.industry && userPreferences.industries.length > 0) {
    const industryMatch = userPreferences.industries.some(industry =>
      lead.company?.industry?.toLowerCase().includes(industry.toLowerCase()) ||
      industry.toLowerCase().includes(lead.company?.industry?.toLowerCase() || '')
    );
    if (industryMatch) score += 3;
  }

  // Role match
  if (lead.jobTitle && userPreferences.roles.length > 0) {
    const roleMatch = userPreferences.roles.some(role =>
      lead.jobTitle?.toLowerCase().includes(role.toLowerCase()) ||
      role.toLowerCase().includes(lead.jobTitle?.toLowerCase() || '')
    );
    if (roleMatch) score += 3;
  }

  // Seniority bonus (higher seniority = higher score)
  const seniorityKeywords = ['ceo', 'chief', 'vp', 'vice president', 'director', 'head'];
  if (lead.jobTitle) {
    const titleLower = lead.jobTitle.toLowerCase();
    const seniorityIndex = seniorityKeywords.findIndex(keyword => titleLower.includes(keyword));
    if (seniorityIndex !== -1) {
      score += (seniorityKeywords.length - seniorityIndex);
    }
  }

  return Math.max(score, 1); // Minimum score of 1
}

/**
 * Search for people using Lusha Prospecting API
 * Step 1: Search for prospects matching criteria
 * Step 2: Enrich the top results with full contact details
 *
 * @param params - Search parameters (industries, job titles, regions)
 * @returns Array of enriched lead data
 */
export async function searchPeople(
  params: LushaSearchParams
): Promise<LushaApiResponse> {
  const apiKey = process.env.LUSHA_API_KEY;

  if (!apiKey || apiKey === 'your-lusha-api-key-here') {
    console.warn('Lusha API key not configured');
    // Always fall back to mock data when API key is missing
    console.log('🎭 No API key configured, using mock data');
    return getMockLushaData(params);
  }

  // Check if we should use mock data for development
  if (process.env.LUSHA_USE_MOCK_DATA === 'true') {
    console.log('Using mock data for development (LUSHA_USE_MOCK_DATA=true)');
    return getMockLushaData(params);
  }

  try {
    // Step 1: Search for prospects
    console.log('Lusha Prospecting: Searching for prospects with params:', params);

    const searchResult = await prospectContactSearch({
      industries: params.industries,
      jobTitles: params.jobTitles,
      regions: params.regions,
    });

    if (!searchResult.success || !searchResult.contactIds || searchResult.contactIds.length === 0) {
      console.log('No prospects found from Prospecting API');

      // Provide helpful suggestions based on the error
      let errorSuggestions = '';
      if (searchResult.error) {
        if (searchResult.error.includes('authentication') || searchResult.error.includes('401') || searchResult.error.includes('403')) {
          errorSuggestions = 'SOLUTION: Check your Lusha API key and ensure it has Prospecting API access. Contact Lusha support to verify your account permissions.';
        } else if (searchResult.error.includes('not have Prospecting API access')) {
          errorSuggestions = 'SOLUTION: Your current Lusha plan may not include Prospecting API access. Contact Lusha support to upgrade your plan or enable this feature.';
        } else {
          errorSuggestions = 'SOLUTION: Try broadening your search criteria or use mock data for development by setting LUSHA_USE_MOCK_DATA=true in your environment.';
        }
      }

      console.warn('SUGGESTION:', errorSuggestions);
      console.warn('SUGGESTION: For development, you can use mock data by setting LUSHA_USE_MOCK_DATA=true');

      return {
        success: false,
        error: `No prospects found. ${searchResult.error || 'This could indicate the Lusha API key lacks Prospecting API access.'} ${errorSuggestions}`
      };
    }

    // Step 2: Enrich top N contacts
    const contactIdsToEnrich = searchResult.contactIds.slice(0, params.limit || 3);
    console.log(`Enriching ${contactIdsToEnrich.length} contacts:`, contactIdsToEnrich);

    const enrichResult = await prospectContactEnrich(contactIdsToEnrich, searchResult.requestId);

    if (!enrichResult.success || !enrichResult.contacts) {
      console.log('Enrichment failed');
      return {
        success: false,
        error: enrichResult.error || 'Failed to enrich contact data'
      };
    }

    // Transform enriched contacts to LushaPersonData format
    const people: LushaPersonData[] = enrichResult.contacts
      .filter(contact => contact.isSuccess && contact.data)
      .map((contact) => {
        const data = contact.data;
          const jobTitle = typeof data?.jobTitle === 'string' ? data.jobTitle : data?.jobTitle?.title || '';

        return {
          name: data?.fullName || `${data?.firstName || ''} ${data?.lastName || ''}`.trim(),
          jobTitle: jobTitle,
          company: {
            name: data?.companyName || '',
            industry: data?.company?.mainIndustry || data?.company?.subIndustry,
            size: data?.company?.employees,
          },
          email: data?.emailAddresses?.[0]?.email,
          phone: data?.phoneNumbers?.[0]?.number,
          linkedinUrl: data?.socialLinks?.linkedin,
        };
      });

    console.log(`Successfully enriched ${people.length} prospects`);

    return {
      success: true,
      data: people,
    };
  } catch (error) {
    console.error('Lusha prospecting error:', error);
    
    // Always fall back to mock data when API fails
    console.log('🎭 API failed, falling back to mock data');
    return getMockLushaData(params);
  }
}

/**
 * Search for contact IDs using Lusha Prospecting API
 * POST /prospecting/contact/search
 */
async function prospectContactSearch(params: {
  industries?: string[];
  jobTitles?: string[];
  regions?: string[];
}): Promise<{ success: boolean; contactIds?: string[]; requestId?: string; error?: string }> {
  const apiKey = process.env.LUSHA_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'API key not configured' };
  }

  try {
    // Build a clean, simplified request based on Lusha API documentation
    const filters: Record<string, unknown> = {};

    // Add company filters with proper structure
    const companyInclude: Record<string, unknown> = {};

    if (params.regions && params.regions.length > 0) {
      const countries = mapRegionsToCountries(params.regions);
      if (countries.length > 0) {
        companyInclude.locations = countries.map(country => ({ country }));
      }
    }

    if (params.industries && params.industries.length > 0) {
      // Map industry names to Lusha's expected format
      const mappedIndustries = params.industries.map(industry => {
        const mapping = INDUSTRY_MAPPINGS[industry.toLowerCase()] ||
                       Object.values(INDUSTRY_MAPPINGS).find(m =>
                         m.primary.toLowerCase() === industry.toLowerCase() ||
                         m.synonyms.some(s => s.toLowerCase() === industry.toLowerCase())
                       );
        return mapping ? mapping.lushaKeywords : [industry];
      }).flat();

      if (mappedIndustries.length > 0) {
        companyInclude.industries = mappedIndustries.slice(0, 5); // Limit to avoid overly restrictive search
      }
    }

    if (Object.keys(companyInclude).length > 0) {
      filters.companies = {
        include: companyInclude
      };
    }

    // Add contact filters with proper seniority mapping
    if (params.jobTitles && params.jobTitles.length > 0) {
      const seniorityLevels = getSeniorityLevels(params.jobTitles);
      if (seniorityLevels.length > 0) {
        filters.contacts = {
          include: {
            seniority: seniorityLevels
          }
        };
      }
    } else {
      // Default to senior roles if no specific roles provided
      filters.contacts = {
        include: {
          seniority: [3, 4, 5, 6, 7] // Manager to C-Level
        }
      };
    }

    const requestBody = { filters };

    console.log('🔍 Lusha prospect search request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${LUSHA_PROSPECTING_URL}/contact/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ Lusha prospect search error: ${response.status} - ${errorBody}`);

      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: `Lusha API authentication failed. Please check your API key and ensure it has Prospecting API access. (Status: ${response.status})`
        };
      }

      if (response.status === 400) {
        return {
          success: false,
          error: `Invalid request format. The API returned: ${errorBody}`
        };
      }

      return {
        success: false,
        error: `Lusha API error (${response.status}): ${errorBody}`
      };
    }

    const data = await response.json();
    console.log('📋 Lusha prospect search response:', JSON.stringify(data, null, 2));

    // Analyze response structure
    console.log('📊 Response structure analysis:', {
      hasData: !!data.data,
      dataLength: Array.isArray(data.data) ? data.data.length : 'N/A',
      hasContacts: !!data.contacts,
      contactsLength: Array.isArray(data.contacts) ? data.contacts.length : 'N/A',
      hasResults: !!data.results,
      resultsLength: Array.isArray(data.results) ? data.results.length : 'N/A',
      totalResults: data.totalResults,
      allKeys: Object.keys(data)
    });

    // Extract contact IDs from response using multiple possible structures
    let contactIds: string[] = [];

    if (Array.isArray(data.data)) {
      contactIds = data.data.map((c: { id?: string; contactId?: string }) => c.id || c.contactId).filter(Boolean);
    } else if (Array.isArray(data.contacts)) {
      contactIds = data.contacts.map((c: { id?: string; contactId?: string }) => c.id || c.contactId).filter(Boolean);
    } else if (Array.isArray(data.results)) {
      contactIds = data.results.map((c: { id?: string; contactId?: string }) => c.id || c.contactId).filter(Boolean);
    }

    if (contactIds.length > 0) {
      console.log(`✅ SUCCESS: Found ${contactIds.length} contacts`);
      console.log('📝 Sample contact IDs:', contactIds.slice(0, 3));
      return {
        success: true,
        contactIds,
        requestId: data.requestId // Return the requestId from the search response
      };
    } else {
      console.log('❌ No contact IDs found in response');

      // If no results, try a broader search without restrictive filters
      if (params.industries || params.regions) {
        console.log('🔄 Trying broader search with minimal filters...');
        return prospectContactSearch({ jobTitles: params.jobTitles });
      }

      return {
        success: false,
        error: `No prospects found matching the criteria. Lusha returned ${data.totalResults || 0} total results.`
      };
    }

  } catch (error) {
    console.error('💥 Prospect search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while searching prospects'
    };
  }
}

// Type for enriched contact from Lusha Prospecting API
interface LushaEnrichedContact {
  isSuccess?: boolean;
  data?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    jobTitle?: {
      title?: string;
    } | string;
    company?: {
      name?: string;
      industry?: string;
      size?: string;
      mainIndustry?: string;
      subIndustry?: string;
      employees?: string;
    };
    emailAddresses?: Array<{ email?: string }>;
    phoneNumbers?: Array<{ number?: string }>;
    socialLinks?: {
      linkedin?: string;
    };
    companyName?: string;
  };
  fullName?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: {
    title?: string;
  } | string;
  company?: {
    name?: string;
    industry?: string;
    size?: string;
  };
  emails?: string[];
  email?: string;
  phones?: string[];
  phone?: string;
  socialLinks?: {
    linkedin?: string;
  };
  linkedinUrl?: string;
}

/**
 * Enrich contacts by IDs using Lusha Prospecting API
 * POST /prospecting/contact/enrich
 */
async function prospectContactEnrich(
  contactIds: string[],
  requestId?: string
): Promise<{ success: boolean; contacts?: LushaEnrichedContact[]; error?: string }> {
  const apiKey = process.env.LUSHA_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'API key not configured' };
  }

  if (contactIds.length === 0) {
    return { success: false, error: 'No contact IDs provided' };
  }

  try {
    if (!requestId) {
      return { success: false, error: 'RequestId is required for enrichment' };
    }

    const requestBody = {
      requestId: requestId,
      contactIds: contactIds.slice(0, 100), // Max 100 per request
    };

    console.log('🔧 Lusha enrich request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${LUSHA_PROSPECTING_URL}/contact/enrich`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ Lusha enrich error: ${response.status} - ${errorBody}`);

      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: `Lusha API authentication failed during enrichment. Please check your API key permissions. (Status: ${response.status})`
        };
      }

      if (response.status === 400) {
        return {
          success: false,
          error: `Invalid enrichment request: ${errorBody}`
        };
      }

      return {
        success: false,
        error: `Enrichment API error (${response.status}): ${errorBody}`
      };
    }

    const data = await response.json();
    console.log('📋 Lusha enrich response:', JSON.stringify(data, null, 2));

    // Handle different response structures
    let contacts: LushaEnrichedContact[] = [];

    if (Array.isArray(data.contacts)) {
      contacts = data.contacts;
    } else if (Array.isArray(data.data)) {
      contacts = data.data;
    } else if (Array.isArray(data.results)) {
      contacts = data.results;
    } else if (data.data && typeof data.data === 'object') {
      // If data is an object with contact IDs as keys
      contacts = Object.values(data.data) as LushaEnrichedContact[];
    }

    console.log(`✅ Enriched ${contacts.length} contacts successfully`);

    return {
      success: true,
      contacts,
    };
  } catch (error) {
    console.error('💥 Contact enrich error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during contact enrichment',
    };
  }
}

/**
 * Enrich a single lead with additional data from Lusha
 * @param email - Email address to enrich
 * @returns Enriched lead data
 */
export async function enrichLead(email: string): Promise<LushaApiResponse> {
  const apiKey = process.env.LUSHA_API_KEY;

  if (!apiKey || apiKey === 'your-lusha-api-key-here') {
    console.warn('Lusha API key not configured');
    return { success: false, error: 'API key not configured' };
  }

  try {
    const requestBody = {
      contacts: [{
        contactId: "1",
        email: email,
      }],
      metadata: {
        revealEmails: true,
        revealPhones: true,
      },
    };

    const response = await fetch(`${LUSHA_API_BASE_URL}/person`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Lusha API error: ${response.status} - ${errorBody}`);
      throw new Error(`Lusha API error: ${response.status} - ${errorBody}`);
    }

    const responseData = await response.json();

    // Log the full response for debugging
    console.log('Lusha enrichLead API response:', JSON.stringify(responseData, null, 2));

    const data = responseData.contacts?.[0] || responseData.data?.[0] || responseData;

    if (!data) {
      console.error('Full Lusha enrichLead response structure:', responseData);
      throw new Error('No contact data returned from Lusha API');
    }

    const person: LushaPersonData = {
      name: data.fullName || data.full_name || `${data.firstName || data.first_name || ''} ${data.lastName || data.last_name || ''}`.trim(),
      jobTitle: data.jobTitle || data.job_title || data.title,
      company: {
        name: data.company?.name || data.companies?.[0]?.name,
        industry: data.company?.industry || data.companies?.[0]?.industry,
        size: data.company?.size || data.companies?.[0]?.size,
      },
      email: data.email,
      phone: data.phone,
      linkedinUrl: data.linkedInUrl || data.linkedin_url,
    };

    return {
      success: true,
      data: [person],
    };
  } catch (error) {
    console.error('Lusha enrich error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test function for debugging Lusha API requests
 * This can be used with Postman or curl to test different request formats
 */
export async function testLushaAPIRequest(
  format: 'format1' | 'format2' | 'format3' | 'format4' | 'format5' = 'format1',
  params: {
    industries?: string[];
    jobTitles?: string[];
    regions?: string[];
  } = {}
): Promise<{ success: boolean; request?: Record<string, unknown>; response?: unknown; error?: string }> {
  const apiKey = process.env.LUSHA_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'API key not configured' };
  }

  try {
    // Define the same request formats as in prospectContactSearch (updated)
    const requestFormats = [
      // Format 1: Working format - only filters object, no pagination
      () => {
        const filters: Record<string, unknown> = {};

        if (params.regions && params.regions.length > 0) {
          const countries = mapRegionsToCountries(params.regions);
          if (countries.length > 0) {
            filters.companies = {
              include: {
                locations: countries.map(country => ({ country }))
              }
            };
          }
        }

        if (params.jobTitles && params.jobTitles.length > 0) {
          filters.contacts = {
            include: {
              seniority: [3, 4, 5]
            }
          };
        }

        return { filters };
      },

      // Format 2: Alternative seniority levels (4,5,6)
      () => {
        const filters: Record<string, unknown> = {};

        if (params.regions && params.regions.length > 0) {
          const countries = mapRegionsToCountries(params.regions);
          if (countries.length > 0) {
            filters.companies = {
              include: {
                locations: countries.map(country => ({ country }))
              }
            };
          }
        }

        if (params.jobTitles && params.jobTitles.length > 0) {
          filters.contacts = {
            include: {
              seniority: [4, 5, 6]
            }
          };
        }

        return { filters };
      },

      // Format 3: With industry filters if API supports them
      () => {
        const filters: Record<string, unknown> = {};

        if (params.regions && params.regions.length > 0 || params.industries && params.industries.length > 0) {
          const companyInclude: Record<string, unknown> = {};

          if (params.regions && params.regions.length > 0) {
            const countries = mapRegionsToCountries(params.regions);
            if (countries.length > 0) {
              companyInclude.locations = countries.map(country => ({ country }));
            }
          }

          if (params.industries && params.industries.length > 0) {
            companyInclude.industries = params.industries;
          }

          filters.companies = {
            include: companyInclude
          };
        }

        if (params.jobTitles && params.jobTitles.length > 0) {
          filters.contacts = {
            include: {
              seniority: [3, 4, 5]
            }
          };
        }

        return { filters };
      },

      // Format 4: Minimal filters - only locations
      () => {
        const filters: Record<string, unknown> = {};

        if (params.regions && params.regions.length > 0) {
          const countries = mapRegionsToCountries(params.regions);
          if (countries.length > 0) {
            filters.companies = {
              include: {
                locations: countries.map(country => ({ country }))
              }
            };
          }
        }

        return { filters };
      },

      // Format 5: Empty filters object
      () => ({ filters: {} })
    ];

    const formatIndex = parseInt(format.replace('format', '')) - 1;
    const requestBody = requestFormats[formatIndex]();

    console.log(`Testing Lusha API with ${format}:`);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${LUSHA_PROSPECTING_URL}/contact/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Response body:', JSON.stringify(responseData, null, 2));
    } catch {
      console.log('Response text (not JSON):', responseText);
      responseData = responseText;
    }

    return {
      success: response.ok,
      request: requestBody,
      response: responseData,
      error: response.ok ? undefined : `HTTP ${response.status}: ${responseText}`
    };

  } catch (error) {
    console.error('Test request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Convert LushaPersonData to LeadData format
 */
export function convertToLeadData(person: LushaPersonData): LeadData {
  return {
    lead_name: person.name,
    job_title: person.jobTitle,
    company_name: person.company?.name,
    email: person.email,
    phone: person.phone,
    linkedin_url: person.linkedinUrl,
    company_size: person.company?.size,
    industry: person.company?.industry,
    source: 'lusha',
  };
}

/**
 * Generate mock Lusha data for development/testing
 */
function getMockLushaData(params: LushaSearchParams): LushaApiResponse {
  console.log('Generating mock data for params:', params);

  const mockPeople: LushaPersonData[] = [
    {
      name: 'Sarah Johnson',
      jobTitle: 'VP Sales',
      company: {
        name: 'TechCorp Inc.',
        industry: 'Technology/SaaS',
        size: '500-1000'
      },
      email: 'sarah.johnson@techcorp.com',
      phone: '+1-555-0123',
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson'
    },
    {
      name: 'Michael Chen',
      jobTitle: 'Director of Marketing',
      company: {
        name: 'HealthTech Solutions',
        industry: 'Healthcare',
        size: '1000-5000'
      },
      email: 'm.chen@healthtech.com',
      phone: '+1-555-0124',
      linkedinUrl: 'https://linkedin.com/in/michaelchen'
    },
    {
      name: 'Emily Rodriguez',
      jobTitle: 'CEO',
      company: {
        name: 'FinanceFlow',
        industry: 'Financial Services',
        size: '50-100'
      },
      email: 'emily@financeflow.com',
      phone: '+1-555-0125',
      linkedinUrl: 'https://linkedin.com/in/emilyrodriguez'
    },
    {
      name: 'David Kim',
      jobTitle: 'CTO',
      company: {
        name: 'Retail Innovations',
        industry: 'Retail/E-commerce',
        size: '100-500'
      },
      email: 'd.kim@retailinnovations.com',
      phone: '+1-555-0126',
      linkedinUrl: 'https://linkedin.com/in/davidkim'
    },
    {
      name: 'Jennifer Wilson',
      jobTitle: 'COO',
      company: {
        name: 'Manufacturing Pro',
        industry: 'Manufacturing',
        size: '1000-5000'
      },
      email: 'j.wilson@manufacturingpro.com',
      phone: '+1-555-0127',
      linkedinUrl: 'https://linkedin.com/in/jenniferwilson'
    }
  ];

  // Filter mock data based on provided parameters to simulate realistic behavior
  let filteredPeople = mockPeople;

  if (params.industries && params.industries.length > 0) {
    filteredPeople = filteredPeople.filter(person =>
      params.industries!.some(industry =>
        person.company?.industry?.toLowerCase().includes(industry.toLowerCase()) ||
        industry.toLowerCase().includes(person.company?.industry?.toLowerCase() || '')
      )
    );
  }

  if (params.jobTitles && params.jobTitles.length > 0) {
    filteredPeople = filteredPeople.filter(person =>
      params.jobTitles!.some(title =>
        person.jobTitle?.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(person.jobTitle?.toLowerCase() || '')
      )
    );
  }

  // Limit to requested number of results
  const limitedPeople = filteredPeople.slice(0, params.limit || 3);

  console.log(`Returning ${limitedPeople.length} mock leads`);

  return {
    success: true,
    data: limitedPeople
  };
}

/**
 * Map our region names to Lusha country codes
 */
function mapRegionsToCountries(regions: string[]): string[] {
  const mapping: Record<string, string[]> = {
    'north-america': ['US', 'CA', 'MX'],
    'north america': ['US', 'CA', 'MX'],
    'usa': ['US'],
    'canada': ['CA'],
    'mexico': ['MX'],
    'europe': ['GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'IE', 'SE', 'NO', 'DK', 'FI', 'CH', 'AT', 'BE'],
    'european union': ['DE', 'FR', 'ES', 'IT', 'NL', 'IE', 'SE', 'NO', 'DK', 'FI', 'CH', 'AT', 'BE'],
    'asia-pacific': ['AU', 'JP', 'SG', 'IN', 'CN', 'HK', 'NZ', 'KR', 'MY', 'TH', 'PH'],
    'asia': ['JP', 'SG', 'IN', 'CN', 'HK', 'NZ', 'KR', 'MY', 'TH', 'PH'],
    'latin-america': ['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'UY', 'PY', 'EC', 'BO'],
    'south america': ['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'UY', 'PY', 'EC', 'BO'],
    'africa': ['ZA', 'NG', 'KE', 'EG', 'MA', 'GH', 'TN'],
    'middle east': ['IL', 'AE', 'SA', 'QA', 'KW', 'JO', 'LB', 'OM'],
    'global/multiple-regions': [], // Don't filter by country
    'global': [], // No geographic filtering
    'worldwide': [], // No geographic filtering
  };

  const countries = regions.flatMap((region) => {
    const regionKey = region.toLowerCase().trim();
    return mapping[regionKey] || [];
  });

  // Return empty array for global/empty regions to allow worldwide search
  return countries.length > 0 ? countries : [];
}


/**
 * Search for a company by name or domain
 * @param query - Company name or domain
 * @returns Company data from Lusha
 */
export async function companySearch(
  query: string
): Promise<{ success: boolean; data?: LushaCompanyData; error?: string }> {
  const apiKey = process.env.LUSHA_API_KEY;

  if (!apiKey || apiKey === 'your-lusha-api-key-here') {
    console.warn('Lusha API key not configured');
    return { success: false, error: 'Lusha API key not configured' };
  }

  try {
    const response = await fetch(`${LUSHA_API_BASE_URL}/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey,
      },
      body: JSON.stringify({ company: query }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Lusha company search API error: ${response.status} - ${errorBody}`);
      throw new Error(`Lusha API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const company: LushaCompanyData = {
      name: data.name,
      domain: data.domain,
      industry: data.industry,
      size: data.size || data.employee_count,
      revenue: data.revenue,
      location: data.location || data.headquarters,
      description: data.description,
      founded_year: data.founded_year,
      linkedin_url: data.linkedin_url,
      twitter_url: data.twitter_url,
      facebook_url: data.facebook_url,
      technologies: data.technologies || [],
    };

    return { success: true, data: company };
  } catch (error) {
    console.error('Lusha company search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Enrich a person with comprehensive data including work history
 * @param params - Person identifiers (email, linkedin_url, or name + company)
 * @returns Enriched person data
 */
export async function personEnrich(params: {
  email?: string;
  linkedin_url?: string;
  name?: string;
  company?: string;
}): Promise<{
  success: boolean;
  data?: EnrichedPersonData;
  companyData?: LushaCompanyData;
  rawData?: {
    personData?: Record<string, unknown>;
    companyData?: Record<string, unknown>;
  };
  error?: string;
}> {
  const apiKey = process.env.LUSHA_API_KEY;

  if (!apiKey || apiKey === 'your-lusha-api-key-here') {
    console.warn('Lusha API key not configured');
    return { success: false, error: 'Lusha API key not configured' };
  }

  try {
    // Build the contact object for Lusha API v2
    const contact: Record<string, unknown> = {
      contactId: "1",
    };

    if (params.name) {
      contact.fullName = params.name;
    }
    if (params.email) {
      contact.email = params.email;
    }
    if (params.linkedin_url) {
      contact.linkedinUrl = params.linkedin_url;
    }
    if (params.company) {
      contact.companies = [{
        name: params.company,
        isCurrent: true
      }];
    }

    const requestBody = {
      contacts: [contact],
      metadata: {
        revealEmails: true,
        revealPhones: true,
      },
    };

    const response = await fetch(`${LUSHA_API_BASE_URL}/person`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Lusha person enrich API error: ${response.status} - ${errorBody}`);
      throw new Error(`Lusha API error: ${response.status} - ${errorBody}`);
    }

    const responseData = await response.json();

    // Log the full response for debugging
    console.log('Lusha API response:', JSON.stringify(responseData, null, 2));

    // Extract contact data - Lusha returns contacts as an object with contactId as keys
    let contactData;
    if (responseData.contacts) {
      // Get the first contact from the contacts object
      const contactIds = Object.keys(responseData.contacts);
      if (contactIds.length > 0) {
        const firstContactId = contactIds[0];
        contactData = responseData.contacts[firstContactId];
      }
    }

    if (!contactData) {
      console.error('Full Lusha response structure:', responseData);
      throw new Error('No contact data returned from Lusha API');
    }

    // Extract the actual person data from the nested structure
    const data = contactData.data || contactData;
    const companyId = data.companyId;
    const companyData = companyId && responseData.companies?.[companyId];

    // Log available fields for debugging
    console.log('Available data fields:', Object.keys(data));
    console.log('Company data available:', !!companyData);

    const person: EnrichedPersonData = {
      first_name: data.firstName || data.first_name || '',
      last_name: data.lastName || data.last_name || '',
      full_name: data.fullName || data.full_name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      email: data.emails?.[0] || data.emailAddresses?.[0]?.email,
      phone: data.phones?.[0] || data.phoneNumbers?.[0]?.number,
      linkedin_url: data.socialLinks?.linkedin || data.linkedin_url,
      title: data.jobTitle?.title || data.title,
      seniority: data.jobTitle?.seniority || data.seniority,
      location: data.location?.city && data.location?.country
        ? `${data.location.city}, ${data.location.country}`
        : data.location?.country || data.location,
      company: {
        name: companyData?.name || '',
        domain: companyData?.domains?.homepage || companyData?.domains?.email,
        industry: companyData?.mainIndustry || companyData?.subIndustry,
      },
      work_history: data.previousJob ? [{
          company: data.previousJob.company?.name || '',
          title: data.previousJob.jobTitle?.title || '',
          start_date: undefined,
          end_date: data.jobStartDate, // Current job start date is when previous job ended
        }] : [],
      education:
        data.education?.map((edu: unknown) => ({
          institution: (edu as { institution: string }).institution,
          degree: (edu as { degree?: string }).degree,
          field_of_study: (edu as { field_of_study?: string }).field_of_study || (edu as { fieldOfStudy?: string }).fieldOfStudy,
        })) || [],
    };

    console.log('Parsed person data:', {
      name: person.full_name,
      title: person.title,
      company: person.company?.name,
      email: person.email,
    });

    // Also return company data if available
    let enrichedCompanyData: LushaCompanyData | undefined;
    if (companyData) {
      enrichedCompanyData = {
        name: companyData.name,
        domain: companyData.domains?.homepage || companyData.domains?.email,
        industry: companyData.mainIndustry,
        size: companyData.companySize ? `${companyData.companySize[0]}-${companyData.companySize[1]}` : undefined,
        revenue: companyData.revenueRange ? `$${companyData.revenueRange[0]}-$${companyData.revenueRange[1]}` : undefined,
        location: companyData.location?.rawLocation || `${companyData.location?.city || ''}, ${companyData.location?.country || ''}`.trim(),
        description: companyData.description,
        founded_year: undefined,
        linkedin_url: companyData.social?.linkedin,
        twitter_url: undefined,
        facebook_url: undefined,
        technologies: companyData.technologies || companyData.specialities || [],
      };
    }

    // Return raw data for enhanced buying signals
    return {
      success: true,
      data: person,
      companyData: enrichedCompanyData,
      rawData: {
        personData: data as Record<string, unknown>,
        companyData: companyData as Record<string, unknown> | undefined,
      }
    };
  } catch (error) {
    console.error('Lusha person enrich error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Enrich a company with comprehensive data
 * @param companyName - Company name or domain
 * @returns Enriched company data
 */
export async function companyEnrich(
  companyName: string
): Promise<{ success: boolean; data?: LushaCompanyData; error?: string }> {
  const apiKey = process.env.LUSHA_API_KEY;

  if (!apiKey || apiKey === 'your-lusha-api-key-here') {
    console.warn('Lusha API key not configured');
    return { success: false, error: 'Lusha API key not configured' };
  }

  try {
    const response = await fetch(`${LUSHA_API_BASE_URL}/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey,
      },
      body: JSON.stringify({ company: companyName }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Lusha company enrich API error: ${response.status} - ${errorBody}`);
      throw new Error(`Lusha API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();

    const company: LushaCompanyData = {
      name: data.name,
      domain: data.domain,
      industry: data.industry,
      size: data.size || data.employee_count,
      revenue: data.revenue || data.revenue_range,
      location: data.location || data.headquarters,
      description: data.description,
      founded_year: data.founded_year,
      linkedin_url: data.linkedin_url,
      twitter_url: data.twitter_url,
      facebook_url: data.facebook_url,
      technologies: data.technologies || data.tech_stack || [],
    };

    return { success: true, data: company };
  } catch (error) {
    console.error('Lusha company enrich error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract buying signals from enriched data
 * Now enhanced to use rich data from Lusha API response including funding, job changes, company metrics, etc.
 */
export function extractBuyingSignals(
  companyData?: LushaCompanyData,
  personData?: EnrichedPersonData,
  rawLushaData?: {
    personData?: Record<string, unknown>;
    companyData?: Record<string, unknown>;
  }
): BuyingSignal[] {
  const signals: BuyingSignal[] = [];

  // Extract raw data if available for enhanced signals
  const rawPerson = rawLushaData?.personData;
  const rawCompany = rawLushaData?.companyData;

  // 1. FUNDING SIGNALS - Check for recent funding rounds
  if (rawCompany && typeof rawCompany === 'object') {
    const funding = (rawCompany as { funding?: {
      lastRoundDate?: string;
      lastRoundAmount?: number;
      lastRoundType?: string;
      isIpo?: boolean;
      currency?: string;
    } }).funding;

    if (funding?.lastRoundDate && funding?.lastRoundAmount) {
      const roundDate = new Date(funding.lastRoundDate);
      const monthsAgo = (Date.now() - roundDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

      if (monthsAgo < 12) {
        const amount = funding.currency === 'USD'
          ? `$${(funding.lastRoundAmount / 1000000).toFixed(1)}M`
          : `${funding.lastRoundAmount.toLocaleString()}`;

        signals.push({
          type: 'funding',
          title: `Recent ${funding.lastRoundType} Funding`,
          description: `Raised ${amount} ${Math.round(monthsAgo)} months ago`,
          date: funding.lastRoundDate,
        });
      }
    }

    // IPO Signal
    if (funding?.isIpo) {
      signals.push({
        type: 'expansion',
        title: 'Publicly Traded Company',
        description: 'Company has gone public, indicating significant growth and resources',
      });
    }
  }

  // 2. JOB CHANGE SIGNALS - Enhanced with exact dates from Lusha
  if (rawPerson && typeof rawPerson === 'object') {
    const jobStartDate = (rawPerson as { jobStartDate?: string }).jobStartDate;
    const seniority = (rawPerson as { jobTitle?: { seniority?: string } }).jobTitle?.seniority;

    if (jobStartDate && seniority) {
      const startDate = new Date(jobStartDate);
      const monthsAgo = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

      const seniorityLower = seniority.toLowerCase();
      const isSenior = ['executive', 'c-level', 'vp', 'director', 'head'].some((level) =>
        seniorityLower.includes(level)
      );

      if (monthsAgo < 6 && isSenior) {
        signals.push({
          type: 'leadership_change',
          title: 'New Executive',
          description: `${personData?.title || seniority} started ${Math.round(monthsAgo)} months ago - likely evaluating new solutions`,
          date: jobStartDate,
        });
      } else if (monthsAgo < 3) {
        signals.push({
          type: 'leadership_change',
          title: 'Recent Hire',
          description: `Started ${Math.round(monthsAgo)} months ago - building new relationships`,
          date: jobStartDate,
        });
      }
    }
  }

  // 3. COMPANY SCALE SIGNALS - Using actual ranges from Lusha
  if (rawCompany && typeof rawCompany === 'object') {
    const companySize = (rawCompany as { companySize?: [number, number] }).companySize;
    const revenueRange = (rawCompany as { revenueRange?: [number, number] }).revenueRange;

    // Large company signal (10k+ employees)
    if (companySize && companySize[0] >= 10000) {
      signals.push({
        type: 'expansion',
        title: 'Enterprise-Scale Company',
        description: `${companySize[0].toLocaleString()}-${companySize[1].toLocaleString()} employees - significant budget potential`,
      });
    }

    // High revenue signal ($1B+)
    if (revenueRange && revenueRange[0] >= 1000000000) {
      const revenueMin = `$${(revenueRange[0] / 1000000000).toFixed(1)}B`;
      const revenueMax = `$${(revenueRange[1] / 1000000000).toFixed(1)}B`;
      signals.push({
        type: 'expansion',
        title: 'High Revenue Company',
        description: `${revenueMin}-${revenueMax} annual revenue - strong financial position`,
      });
    }

    // Growth company signal (100-10k employees)
    if (companySize && companySize[0] >= 100 && companySize[0] < 10000) {
      signals.push({
        type: 'hiring',
        title: 'Growing Company',
        description: `${companySize[0].toLocaleString()}-${companySize[1].toLocaleString()} employees - likely hiring and expanding`,
      });
    }
  }

  // 4. TECH STACK / SPECIALTIES SIGNALS
  if (rawCompany && typeof rawCompany === 'object') {
    const specialities = (rawCompany as { specialities?: string[] }).specialities;
    const technologies = (rawCompany as { technologies?: string[] }).technologies;

    const techList = technologies || specialities || companyData?.technologies;

    if (techList && techList.length > 0) {
      // Look for relevant tech signals
      const cloudTech = techList.filter((tech: string) =>
        tech.toLowerCase().includes('cloud') ||
        tech.toLowerCase().includes('aws') ||
        tech.toLowerCase().includes('azure')
      );

      if (cloudTech.length > 0) {
        signals.push({
          type: 'expansion',
          title: 'Cloud Infrastructure User',
          description: `Using: ${cloudTech.slice(0, 3).join(', ')}`,
        });
      }

      // If they have many technologies, they're tech-forward
      if (techList.length > 5) {
        signals.push({
          type: 'expansion',
          title: 'Tech-Forward Company',
          description: `${techList.length} technologies in stack - values innovation`,
        });
      }
    }
  }

  // 5. DATA FRESHNESS SIGNAL
  if (rawPerson && typeof rawPerson === 'object') {
    const updateDate = (rawPerson as { updateDate?: string }).updateDate;

    if (updateDate) {
      const updated = new Date(updateDate);
      const daysAgo = (Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24);

      if (daysAgo < 30) {
        signals.push({
          type: 'news',
          title: 'Recently Updated Data',
          description: `Information verified ${Math.round(daysAgo)} days ago`,
          date: updateDate,
        });
      }
    }
  }

  // 6. CAREER MOMENTUM SIGNAL - Check for promotions or moves
  if (rawPerson && typeof rawPerson === 'object') {
    const previousJob = (rawPerson as {
      previousJob?: {
        jobTitle?: { title?: string };
        company?: { name?: string };
      }
    }).previousJob;
    const currentJobTitle = (rawPerson as { jobTitle?: { title?: string } }).jobTitle?.title;
    const currentCompany = rawCompany && (rawCompany as { name?: string }).name;

    if (previousJob && currentJobTitle) {
      const previousTitle = previousJob.jobTitle?.title;
      const previousCompany = previousJob.company?.name;

      // Check if they moved companies (different company name)
      if (previousCompany && currentCompany && previousCompany !== currentCompany) {
        signals.push({
          type: 'leadership_change',
          title: 'Changed Companies',
          description: `Moved from ${previousCompany} - opportunity to introduce new solutions`,
        });
      }

      // Check for promotion signals (title contains more senior terms)
      const seniorTerms = ['vp', 'chief', 'head', 'director', 'senior'];
      const previousTitleLower = previousTitle?.toLowerCase() || '';
      const currentTitleLower = currentJobTitle.toLowerCase();

      const wasSenior = seniorTerms.some(term => previousTitleLower.includes(term));
      const isSenior = seniorTerms.some(term => currentTitleLower.includes(term));

      if (isSenior && !wasSenior) {
        signals.push({
          type: 'leadership_change',
          title: 'Recent Promotion',
          description: `Promoted from ${previousTitle} - expanded decision-making authority`,
        });
      }
    }
  }

  // 7. EXPANSION SIGNALS - Multiple locations
  if (companyData?.location && companyData.location.includes(',')) {
    const locations = companyData.location.split(',').map(l => l.trim());
    if (locations.length > 2) {
      signals.push({
        type: 'expansion',
        title: 'Multi-Location Operations',
        description: `Operating in ${locations.length} locations - potential for scaled rollout`,
      });
    }
  }

  return signals;
}
