import { ClayPersonData, ClayCompanyData, ClaySearchParams } from './types';

/**
 * Mock data for Clay.com API development and testing
 * Provides realistic sample data when API is unavailable or for development
 */

/**
 * Mock Clay.com person data
 */
export const mockClayPeople: ClayPersonData[] = [
  {
    id: 'clay_person_1',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1-555-0123',
    job_title: 'VP Sales',
    seniority: 'executive',
    company: {
      id: 'clay_company_1',
      name: 'TechCorp Inc.',
      domain: 'techcorp.com',
      industry: 'Technology/SaaS',
      size: '500-1000',
      location: {
        country: 'US',
        state: 'CA',
        city: 'San Francisco'
      }
    },
    location: {
      country: 'US',
      state: 'CA',
      city: 'San Francisco'
    },
    linkedin_url: 'https://linkedin.com/in/sarahjohnson',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'clay_person_2',
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'm.chen@healthtech.com',
    phone: '+1-555-0124',
    job_title: 'Director of Marketing',
    seniority: 'director',
    company: {
      id: 'clay_company_2',
      name: 'HealthTech Solutions',
      domain: 'healthtech.com',
      industry: 'Healthcare',
      size: '1000-5000',
      location: {
        country: 'US',
        state: 'NY',
        city: 'New York'
      }
    },
    location: {
      country: 'US',
      state: 'NY',
      city: 'New York'
    },
    linkedin_url: 'https://linkedin.com/in/michaelchen',
    created_at: '2024-01-16T14:30:00Z',
    updated_at: '2024-01-16T14:30:00Z'
  },
  {
    id: 'clay_person_3',
    first_name: 'Emily',
    last_name: 'Rodriguez',
    email: 'emily@financeflow.com',
    phone: '+1-555-0125',
    job_title: 'CEO',
    seniority: 'executive',
    company: {
      id: 'clay_company_3',
      name: 'FinanceFlow',
      domain: 'financeflow.com',
      industry: 'Financial Services',
      size: '50-100',
      location: {
        country: 'US',
        state: 'TX',
        city: 'Austin'
      }
    },
    location: {
      country: 'US',
      state: 'TX',
      city: 'Austin'
    },
    linkedin_url: 'https://linkedin.com/in/emilyrodriguez',
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z'
  },
  {
    id: 'clay_person_4',
    first_name: 'David',
    last_name: 'Kim',
    email: 'd.kim@retailinnovations.com',
    phone: '+1-555-0126',
    job_title: 'CTO',
    seniority: 'executive',
    company: {
      id: 'clay_company_4',
      name: 'Retail Innovations',
      domain: 'retailinnovations.com',
      industry: 'Retail/E-commerce',
      size: '100-500',
      location: {
        country: 'US',
        state: 'WA',
        city: 'Seattle'
      }
    },
    location: {
      country: 'US',
      state: 'WA',
      city: 'Seattle'
    },
    linkedin_url: 'https://linkedin.com/in/davidkim',
    created_at: '2024-01-18T16:45:00Z',
    updated_at: '2024-01-18T16:45:00Z'
  },
  {
    id: 'clay_person_5',
    first_name: 'Jennifer',
    last_name: 'Wilson',
    email: 'j.wilson@manufacturingpro.com',
    phone: '+1-555-0127',
    job_title: 'COO',
    seniority: 'executive',
    company: {
      id: 'clay_company_5',
      name: 'Manufacturing Pro',
      domain: 'manufacturingpro.com',
      industry: 'Manufacturing',
      size: '1000-5000',
      location: {
        country: 'US',
        state: 'IL',
        city: 'Chicago'
      }
    },
    location: {
      country: 'US',
      state: 'IL',
      city: 'Chicago'
    },
    linkedin_url: 'https://linkedin.com/in/jenniferwilson',
    created_at: '2024-01-19T11:20:00Z',
    updated_at: '2024-01-19T11:20:00Z'
  }
];

/**
 * Additional mock people for more comprehensive testing
 */
export const additionalMockPeople: ClayPersonData[] = [
  {
    id: 'clay_person_6',
    first_name: 'Robert',
    last_name: 'Taylor',
    email: 'r.taylor@edutech.com',
    phone: '+1-555-0128',
    job_title: 'Head of HR',
    seniority: 'director',
    company: {
      id: 'clay_company_6',
      name: 'EduTech Solutions',
      domain: 'edutech.com',
      industry: 'Education',
      size: '200-500',
      location: {
        country: 'US',
        state: 'MA',
        city: 'Boston'
      }
    },
    location: {
      country: 'US',
      state: 'MA',
      city: 'Boston'
    },
    linkedin_url: 'https://linkedin.com/in/roberttaylor',
    created_at: '2024-01-20T13:00:00Z',
    updated_at: '2024-01-20T13:00:00Z'
  },
  {
    id: 'clay_person_7',
    first_name: 'Lisa',
    last_name: 'Anderson',
    email: 'lisa.anderson@realestate.com',
    phone: '+1-555-0129',
    job_title: 'CMO',
    seniority: 'executive',
    company: {
      id: 'clay_company_7',
      name: 'RealEstate Pro',
      domain: 'realestate.com',
      industry: 'Real Estate',
      size: '100-300',
      location: {
        country: 'US',
        state: 'FL',
        city: 'Miami'
      }
    },
    location: {
      country: 'US',
      state: 'FL',
      city: 'Miami'
    },
    linkedin_url: 'https://linkedin.com/in/lisaanderson',
    created_at: '2024-01-21T10:30:00Z',
    updated_at: '2024-01-21T10:30:00Z'
  }
];

/**
 * Mock company data for additional testing
 */
export const mockClayCompanies: ClayCompanyData[] = [
  {
    id: 'clay_company_1',
    name: 'TechCorp Inc.',
    domain: 'techcorp.com',
    industry: 'Technology/SaaS',
    size: '500-1000',
    revenue: '$50M-$100M',
    location: {
      country: 'US',
      state: 'CA',
      city: 'San Francisco'
    },
    description: 'Leading SaaS provider for enterprise solutions',
    founded_year: 2010,
    linkedin_url: 'https://linkedin.com/company/techcorp',
    technologies: ['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes']
  },
  {
    id: 'clay_company_2',
    name: 'HealthTech Solutions',
    domain: 'healthtech.com',
    industry: 'Healthcare',
    size: '1000-5000',
    revenue: '$100M-$500M',
    location: {
      country: 'US',
      state: 'NY',
      city: 'New York'
    },
    description: 'Innovative healthcare technology solutions',
    founded_year: 2015,
    linkedin_url: 'https://linkedin.com/company/healthtech',
    technologies: ['Python', 'TensorFlow', 'HIPAA', 'Medical Devices']
  }
];

/**
 * Generate mock data based on search parameters
 * Simulates realistic API behavior with filtering
 */
export function generateMockClayData(params: ClaySearchParams): ClayPersonData[] {
  console.log('🎭 Generating mock Clay data for params:', params);

  let filteredPeople = [...mockClayPeople, ...additionalMockPeople];

  // Only apply filters if we have enough results to work with
  // This ensures we always have some mock data to return
  
  // Filter by industries (only if we still have results after filtering)
  if (params.industries && params.industries.length > 0 && filteredPeople.length > 2) {
    const industryFiltered = filteredPeople.filter(person =>
      params.industries!.some(industry =>
        person.company?.industry?.toLowerCase().includes(industry.toLowerCase()) ||
        industry.toLowerCase().includes(person.company?.industry?.toLowerCase() || '')
      )
    );
    if (industryFiltered.length > 0) {
      filteredPeople = industryFiltered;
    }
  }

  // Filter by job titles (only if we still have results after filtering)
  if (params.job_titles && params.job_titles.length > 0 && filteredPeople.length > 2) {
    const titleFiltered = filteredPeople.filter(person =>
      params.job_titles!.some(title =>
        person.job_title?.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(person.job_title?.toLowerCase() || '')
      )
    );
    if (titleFiltered.length > 0) {
      filteredPeople = titleFiltered;
    }
  }

  // Filter by seniority (only if we still have results after filtering)
  if (params.seniority && params.seniority.length > 0 && filteredPeople.length > 2) {
    const seniorityFiltered = filteredPeople.filter(person =>
      params.seniority!.some(seniority =>
        person.seniority?.toLowerCase().includes(seniority.toLowerCase())
      )
    );
    if (seniorityFiltered.length > 0) {
      filteredPeople = seniorityFiltered;
    }
  }

  // Filter by company size (only if we still have results after filtering)
  if (params.company_size && params.company_size.length > 0 && filteredPeople.length > 2) {
    const sizeFiltered = filteredPeople.filter(person =>
      params.company_size!.some(size =>
        person.company?.size?.toLowerCase().includes(size.toLowerCase())
      )
    );
    if (sizeFiltered.length > 0) {
      filteredPeople = sizeFiltered;
    }
  }

  // Filter by regions (basic country/state matching, only if we still have results)
  if (params.regions && params.regions.length > 0 && filteredPeople.length > 2) {
    const regionFiltered = filteredPeople.filter(person =>
      params.regions!.some(region =>
        person.location?.country?.toLowerCase().includes(region.toLowerCase()) ||
        person.location?.state?.toLowerCase().includes(region.toLowerCase())
      )
    );
    if (regionFiltered.length > 0) {
      filteredPeople = regionFiltered;
    }
  }

  // If no results after filtering, return at least one mock person
  if (filteredPeople.length === 0 && mockClayPeople.length > 0) {
    filteredPeople = [mockClayPeople[0]];
  }

  // Limit results
  const limitedPeople = filteredPeople.slice(0, params.limit || 3);

  console.log(`🎭 Returning ${limitedPeople.length} mock Clay results`);
  return limitedPeople;
}

/**
 * Get mock company by ID
 */
export function getMockCompanyById(id: string): ClayCompanyData | undefined {
  return mockClayCompanies.find(company => company.id === id);
}

/**
 * Get mock person by ID
 */
export function getMockPersonById(id: string): ClayPersonData | undefined {
  return [...mockClayPeople, ...additionalMockPeople].find(person => person.id === id);
}

/**
 * Check if mock data should be used based on environment settings
 */
export function shouldUseMockData(): boolean {
  return process.env.CLAY_USE_MOCK_DATA === 'true' || 
         process.env.NODE_ENV === 'development';
}

/**
 * Mock API delay to simulate real network latency
 */
export function mockApiDelay(minMs: number = 500, maxMs: number = 1500): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Mock search response structure
 */
export interface MockSearchResponse {
  people: ClayPersonData[];
  total_results: number;
  search_id: string;
  took_ms: number;
}

/**
 * Generate mock search response
 */
export async function generateMockSearchResponse(
  params: ClaySearchParams
): Promise<MockSearchResponse> {
  // Simulate API delay
  await mockApiDelay();

  const people = generateMockClayData(params);
  
  return {
    people,
    total_results: people.length,
    search_id: `mock_search_${Date.now()}`,
    took_ms: Math.floor(Math.random() * 1000) + 200
  };
}