import {
  LushaSearchParams,
  LushaPersonData,
  LushaApiResponse,
  LeadData,
  LushaFilters,
  LushaRawPerson,
  LushaRawResponse,
} from '@/types/onboarding';
import type {
  LushaCompanyData,
  LushaPersonData as EnrichedPersonData,
  BuyingSignal,
} from '@/types/research';

const LUSHA_API_BASE_URL = 'https://api.lusha.com/v2';
const LUSHA_PROSPECTING_URL = 'https://api.lusha.com/prospecting';

/**
 * Lusha API Client
 * Documentation: https://www.lusha.com/docs/api/
 */

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
    return { success: false, error: 'Lusha API key not configured' };
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
      console.warn('SUGGESTION: Your Lusha API key may not have access to the Prospecting API');
      console.warn('SUGGESTION: Contact Lusha support to enable Prospecting API access');
      console.warn('SUGGESTION: Or use mock data for development by setting LUSHA_USE_MOCK_DATA=true');

      return {
        success: false,
        error: 'No prospects found. Your Lusha account may not have Prospecting API access. Please contact Lusha support or use mock data for development.'
      };
    }

    // Step 2: Enrich top N contacts
    const contactIdsToEnrich = searchResult.contactIds.slice(0, params.limit || 3);
    console.log(`Enriching ${contactIdsToEnrich.length} contacts:`, contactIdsToEnrich);

    const enrichResult = await prospectContactEnrich(contactIdsToEnrich);

    if (!enrichResult.success || !enrichResult.contacts) {
      console.log('Enrichment failed');
      return {
        success: false,
        error: enrichResult.error || 'Failed to enrich contact data'
      };
    }

    // Transform enriched contacts to LushaPersonData format
    const people: LushaPersonData[] = enrichResult.contacts.map((contact) => {
      const jobTitle = typeof contact.jobTitle === 'string'
        ? contact.jobTitle
        : contact.jobTitle?.title;

      return {
        name: contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
        jobTitle: jobTitle,
        company: {
          name: contact.company?.name || '',
          industry: contact.company?.industry,
          size: contact.company?.size,
        },
        email: contact.emails?.[0] || contact.email,
        phone: contact.phones?.[0] || contact.phone,
        linkedinUrl: contact.socialLinks?.linkedin || contact.linkedinUrl,
      };
    });

    console.log(`Successfully enriched ${people.length} prospects`);

    return {
      success: true,
      data: people,
    };
  } catch (error) {
    console.error('Lusha prospecting error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
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
}): Promise<{ success: boolean; contactIds?: string[]; error?: string }> {
  const apiKey = process.env.LUSHA_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'API key not configured' };
  }

  try {
    // Build filters for Lusha Prospecting API
    // The API requires filters to be wrapped in "include" and optionally "exclude" objects
    const filters: Record<string, unknown> = {};

    // Company filters (locations only - removing industries as they require numeric IDs)
    const companyInclude: Record<string, unknown> = {};

    if (params.regions && params.regions.length > 0) {
      const countries = mapRegionsToCountries(params.regions);
      if (countries.length > 0) {
        companyInclude.locations = countries.map(country => ({ country }));
      }
    }

    // Add company filters if any exist
    if (Object.keys(companyInclude).length > 0) {
      filters.companies = {
        include: companyInclude
      };
    }

    // Contact filters (seniority levels based on job titles)
    // TESTING: Using minimal filters to debug why we're getting 0 results
    const contactInclude: Record<string, unknown> = {};

    // Start with just seniority level 5 (C-Level) - the most common
    if (params.jobTitles && params.jobTitles.length > 0) {
      contactInclude.seniority = [5]; // Just C-Level for testing
    }

    // Add contact filters if any exist
    if (Object.keys(contactInclude).length > 0) {
      filters.contacts = {
        include: contactInclude
      };
    }

    const requestBody = {
      filters,
      pages: {
        page: 0,
        size: 25  // Request 25 results, we'll take the top N based on params.limit
      }
    };

    console.log('Lusha prospect search request:', JSON.stringify(requestBody, null, 2));

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
      console.error(`Lusha prospect search error: ${response.status} - ${errorBody}`);
      throw new Error(`Lusha API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lusha prospect search response:', JSON.stringify(data, null, 2));

    // Extract contact IDs from response
    // The response has a "data" array at the root level, not "contacts"
    const contactIds = data.data?.map((c: { id: string }) => c.id) ||
                      data.contacts?.map((c: { id: string }) => c.id) || [];

    return {
      success: true,
      contactIds,
    };
  } catch (error) {
    console.error('Prospect search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Type for enriched contact from Lusha Prospecting API
interface LushaEnrichedContact {
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
  contactIds: string[]
): Promise<{ success: boolean; contacts?: LushaEnrichedContact[]; error?: string }> {
  const apiKey = process.env.LUSHA_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'API key not configured' };
  }

  if (contactIds.length === 0) {
    return { success: false, error: 'No contact IDs provided' };
  }

  try {
    const requestBody = {
      contactIds: contactIds.slice(0, 100), // Max 100 per request
    };

    console.log('Lusha enrich request:', JSON.stringify(requestBody, null, 2));

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
      console.error(`Lusha enrich error: ${response.status} - ${errorBody}`);
      throw new Error(`Lusha API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lusha enrich response:', JSON.stringify(data, null, 2));

    return {
      success: true,
      contacts: data.contacts || [],
    };
  } catch (error) {
    console.error('Contact enrich error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
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
 * Map our region names to Lusha country codes
 */
function mapRegionsToCountries(regions: string[]): string[] {
  const mapping: Record<string, string[]> = {
    'north-america': ['US', 'CA', 'MX'],
    'europe': ['GB', 'DE', 'FR', 'ES', 'IT', 'NL'],
    'asia-pacific': ['AU', 'JP', 'SG', 'IN', 'CN'],
    'latin-america': ['BR', 'AR', 'CL', 'CO'],
    'global/multiple-regions': [], // Don't filter by country
  };

  const countries = regions.flatMap((region) => {
    const regionKey = region.toLowerCase();
    return mapping[regionKey] || [];
  });
  return countries.length > 0 ? countries : [];
}

/**
 * Map our job titles to Lusha department filters
 * Based on Lusha's available departments: Engineering & Technical, Marketing, Sales, etc.
 */
function mapJobTitlesToDepartments(jobTitles: string[]): string[] {
  const departments = new Set<string>();

  jobTitles.forEach(title => {
    const titleLower = title.toLowerCase();

    // Sales roles
    if (titleLower.includes('sales') || titleLower.includes('vp sales')) {
      departments.add('Sales');
    }

    // Marketing roles
    if (titleLower.includes('marketing') || titleLower.includes('cmo') || titleLower.includes('vp marketing')) {
      departments.add('Marketing');
    }

    // Operations roles
    if (titleLower.includes('operations') || titleLower.includes('coo') || titleLower.includes('director of operations')) {
      departments.add('Operations');
    }

    // Product roles
    if (titleLower.includes('product')) {
      departments.add('Product Management');
    }

    // Engineering/Technical roles
    if (titleLower.includes('cto') || titleLower.includes('engineering') || titleLower.includes('technical')) {
      departments.add('Engineering & Technical');
    }

    // Executive roles (CEO, etc.)
    if (titleLower.includes('ceo') || titleLower.includes('chief')) {
      departments.add('Executive');
    }

    // Finance roles
    if (titleLower.includes('cfo') || titleLower.includes('finance')) {
      departments.add('Finance');
    }

    // HR roles
    if (titleLower.includes('hr') || titleLower.includes('human resources')) {
      departments.add('Human Resources');
    }
  });

  return Array.from(departments);
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
