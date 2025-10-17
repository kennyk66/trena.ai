# Clay.com Client Interface and Types Design

## Architecture Overview

### Component Structure
```
lib/clay/
├── client.ts              # Main Clay.com API client
├── types.ts               # TypeScript interfaces
├── search-strategies.ts   # Search strategy implementations
├── data-mapper.ts         # Data transformation utilities
├── error-handler.ts       # Error handling utilities
└── mock-data.ts           # Mock data for development
```

## Type Definitions

### Core Types

```typescript
// lib/clay/types.ts

/**
 * Clay.com API search parameters
 */
export interface ClaySearchParams {
  industries?: string[];
  job_titles?: string[];
  regions?: string[];
  limit?: number;
  seniority?: string[];
  company_size?: string[];
  include_contacts?: boolean;
  include_companies?: boolean;
}

/**
 * Clay.com person data structure
 */
export interface ClayPersonData {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  job_title?: string;
  seniority?: string;
  company?: ClayCompanyData;
  location?: ClayLocationData;
  linkedin_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Clay.com company data structure
 */
export interface ClayCompanyData {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  revenue?: string;
  location?: ClayLocationData;
  description?: string;
  founded_year?: number;
  linkedin_url?: string;
  technologies?: string[];
}

/**
 * Clay.com location data structure
 */
export interface ClayLocationData {
  country?: string;
  state?: string;
  city?: string;
  postal_code?: string;
  raw?: string;
}

/**
 * Clay.com API response wrapper
 */
export interface ClayApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    total_results?: number;
    page?: number;
    limit?: number;
    has_more?: boolean;
  };
}

/**
 * Clay.com search response
 */
export interface ClaySearchResponse {
  people?: ClayPersonData[];
  companies?: ClayCompanyData[];
  total_results: number;
  search_id?: string;
}

/**
 * Clay.com enrichment response
 */
export interface ClayEnrichResponse {
  person?: ClayPersonData;
  company?: ClayCompanyData;
  signals?: ClayBuyingSignal[];
}

/**
 * Clay.com buying signals
 */
export interface ClayBuyingSignal {
  type: 'funding' | 'hiring' | 'expansion' | 'leadership_change' | 'news' | 'technology';
  title: string;
  description: string;
  date?: string;
  confidence?: number;
}

/**
 * Search strategy configuration
 */
export interface ClaySearchStrategy {
  name: string;
  description: string;
  priority: number;
  params: Partial<ClaySearchParams>;
  filters?: Record<string, unknown>;
}

/**
 * Progressive search result with strategy information
 */
export interface ClayProgressiveResult {
  success: boolean;
  data?: ClayPersonData[];
  strategy?: ClaySearchStrategy;
  error?: string;
  total_results?: number;
}
```

### Data Mapping Types

```typescript
/**
 * Internal lead data format (maintains compatibility with existing LeadData)
 */
export interface MappedLeadData {
  id?: string;
  lead_name: string;
  job_title?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  company_size?: string;
  industry?: string;
  source: 'clay';
  match_reasoning?: string;
  match_score?: number;
  strategy_used?: string;
  raw_clay_data?: ClayPersonData;
}

/**
 * Mapping configuration for transforming Clay.com data
 */
export interface ClayMappingConfig {
  include_raw_data?: boolean;
  match_scoring?: {
    industry_weight?: number;
    role_weight?: number;
    seniority_weight?: number;
    location_weight?: number;
  };
  enrichment?: {
    include_signals?: boolean;
    include_company_data?: boolean;
  };
}
```

## Client Interface Design

### Main Client Class

```typescript
// lib/clay/client.ts

export class ClayClient {
  private apiKey: string;
  private baseUrl: string;
  private rateLimiter: ClayRateLimiter;
  private cache: ClayCache;
  private errorHandler: ClayErrorHandler;

  constructor(config: ClayClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.clay.com/v1';
    this.rateLimiter = new ClayRateLimiter(config.rateLimit);
    this.cache = new ClayCache(config.cache);
    this.errorHandler = new ClayErrorHandler();
  }

  /**
   * Search for people with progressive fallback strategies
   */
  async searchPeopleWithFallback(
    params: ClaySearchParams,
    userPreferences?: UserPreferences
  ): Promise<ClayProgressiveResult>;

  /**
   * Basic people search
   */
  async searchPeople(params: ClaySearchParams): Promise<ClayApiResponse<ClayPersonData[]>>;

  /**
   * Enrich person data with additional information
   */
  async enrichPerson(
    identifier: string | { email?: string; linkedin_url?: string }
  ): Promise<ClayApiResponse<ClayEnrichResponse>>;

  /**
   * Search for companies
   */
  async searchCompanies(params: {
    query?: string;
    industry?: string;
    size?: string;
    location?: string;
  }): Promise<ClayApiResponse<ClayCompanyData[]>>;

  /**
   * Get buying signals for a person or company
   */
  async getBuyingSignals(
    personId?: string,
    companyId?: string
  ): Promise<ClayApiResponse<ClayBuyingSignal[]>>;
}
```

### Configuration Interface

```typescript
export interface ClayClientConfig {
  apiKey: string;
  baseUrl?: string;
  rateLimit?: {
    requests_per_second?: number;
    requests_per_minute?: number;
    burst_limit?: number;
  };
  cache?: {
    enabled?: boolean;
    ttl_hours?: number;
    max_size?: number;
  };
  mockData?: {
    enabled?: boolean;
    fallback_on_error?: boolean;
  };
  retry?: {
    max_attempts?: number;
    backoff_ms?: number;
  };
}
```

## Search Strategies

### Strategy Implementation

```typescript
// lib/clay/search-strategies.ts

export class ClaySearchStrategies {
  /**
   * Generate progressive search strategies based on user preferences
   */
  static generateStrategies(
    industries: string[],
    roles: string[],
    region?: string
  ): ClaySearchStrategy[] {
    return [
      // Strategy 1: Exact match with all filters
      {
        name: 'exact-match',
        description: 'Precise match with all your criteria',
        priority: 1,
        params: {
          industries,
          job_titles: roles,
          regions: region ? [region] : [],
          seniority: ['executive', 'director', 'manager'],
          limit: 10
        }
      },
      
      // Strategy 2: Industry-focused search
      {
        name: 'industry-focused',
        description: 'Focus on target industries with broader roles',
        priority: 2,
        params: {
          industries,
          seniority: ['executive', 'director', 'manager'],
          limit: 15
        }
      },
      
      // Strategy 3: Role-focused search
      {
        name: 'role-focused',
        description: 'Focus on target roles across industries',
        priority: 3,
        params: {
          job_titles: roles,
          seniority: ['executive', 'director', 'manager'],
          limit: 15
        }
      },
      
      // Strategy 4: Seniority-focused search
      {
        name: 'seniority-focused',
        description: 'Focus on seniority levels across all criteria',
        priority: 4,
        params: {
          seniority: ['executive', 'director', 'manager'],
          limit: 20
        }
      },
      
      // Strategy 5: Broad search with minimal filters
      {
        name: 'broad-search',
        description: 'Wider search with minimal criteria',
        priority: 5,
        params: {
          limit: 25
        }
      }
    ];
  }

  /**
   * Execute progressive search with fallback strategies
   */
  static async executeProgressiveSearch(
    client: ClayClient,
    params: ClaySearchParams,
    strategies: ClaySearchStrategy[]
  ): Promise<ClayProgressiveResult> {
    // Implementation details...
  }
}
```

## Data Mapping

### Transformation Utilities

```typescript
// lib/clay/data-mapper.ts

export class ClayDataMapper {
  /**
   * Convert Clay.com person data to internal lead format
   */
  static toLeadData(
    person: ClayPersonData,
    config: ClayMappingConfig = {}
  ): MappedLeadData {
    const lead: MappedLeadData = {
      lead_name: `${person.first_name} ${person.last_name}`,
      job_title: person.job_title,
      company_name: person.company?.name,
      email: person.email,
      phone: person.phone,
      linkedin_url: person.linkedin_url,
      company_size: person.company?.size,
      industry: person.company?.industry,
      source: 'clay'
    };

    if (config.include_raw_data) {
      lead.raw_clay_data = person;
    }

    return lead;
  }

  /**
   * Calculate match score based on user preferences
   */
  static calculateMatchScore(
    person: ClayPersonData,
    preferences: UserPreferences,
    config: ClayMappingConfig = {}
  ): number {
    const weights = config.match_scoring || {
      industry_weight: 3,
      role_weight: 3,
      seniority_weight: 2,
      location_weight: 1
    };

    let score = 0;

    // Industry matching
    if (person.company?.industry && preferences.industries.length > 0) {
      const industryMatch = preferences.industries.some(industry =>
        person.company?.industry?.toLowerCase().includes(industry.toLowerCase())
      );
      if (industryMatch) score += weights.industry_weight;
    }

    // Role matching
    if (person.job_title && preferences.roles.length > 0) {
      const roleMatch = preferences.roles.some(role =>
        person.job_title?.toLowerCase().includes(role.toLowerCase())
      );
      if (roleMatch) score += weights.role_weight;
    }

    // Seniority bonus
    if (person.seniority) {
      const seniorityLevels = ['executive', 'director', 'manager', 'senior'];
      const levelIndex = seniorityLevels.indexOf(person.seniority.toLowerCase());
      if (levelIndex !== -1) {
        score += weights.seniority_weight * (seniorityLevels.length - levelIndex);
      }
    }

    return Math.max(score, 1);
  }

  /**
   * Generate match reasoning text
   */
  static generateMatchReasoning(
    person: ClayPersonData,
    preferences: UserPreferences,
    strategy: ClaySearchStrategy
  ): string {
    const reasons = [];

    if (person.company?.industry && preferences.industries.includes(person.company.industry)) {
      reasons.push(`Industry match: ${person.company.industry}`);
    }

    if (person.job_title && preferences.roles.some(role => 
      person.job_title?.toLowerCase().includes(role.toLowerCase())
    )) {
      reasons.push(`Role match: ${person.job_title}`);
    }

    if (person.seniority) {
      reasons.push(`Seniority: ${person.seniority}`);
    }

    return reasons.length > 0 
      ? `${reasons.join(' • ')} (${strategy.description})`
      : `Match via ${strategy.description}`;
  }
}
```

## Error Handling

### Error Types and Handling

```typescript
// lib/clay/error-handler.ts

export class ClayErrorHandler {
  /**
   * Handle API errors with appropriate fallbacks
   */
  handleError(error: unknown, context: string): ClayApiResponse<never> {
    if (error instanceof ClayApiError) {
      return this.handleApiError(error, context);
    } else if (error instanceof Error) {
      return this.handleGenericError(error, context);
    } else {
      return this.handleUnknownError(error, context);
    }
  }

  private handleApiError(error: ClayApiError, context: string): ClayApiResponse<never> {
    switch (error.type) {
      case 'RATE_LIMIT':
        return {
          success: false,
          error: `Rate limit exceeded. Please wait before retrying. (${context})`
        };
      case 'AUTHENTICATION':
        return {
          success: false,
          error: 'Authentication failed. Please check your API key.'
        };
      case 'INVALID_REQUEST':
        return {
          success: false,
          error: `Invalid request: ${error.message}`
        };
      case 'QUOTA_EXCEEDED':
        return {
          success: false,
          error: 'API quota exceeded. Please upgrade your plan or try again later.'
        };
      default:
        return {
          success: false,
          error: `API error: ${error.message}`
        };
    }
  }

  // Additional error handling methods...
}

export class ClayApiError extends Error {
  constructor(
    message: string,
    public type: 'RATE_LIMIT' | 'AUTHENTICATION' | 'INVALID_REQUEST' | 'QUOTA_EXCEEDED' | 'UNKNOWN',
    public status?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ClayApiError';
  }
}
```

## Integration Points

### API Endpoint Updates

```typescript
// Updated API endpoints with Clay.com integration

// app/api/leads/recommended/route.ts
export async function GET(request: Request) {
  // Replace Lusha client with Clay.com client
  const clayClient = new ClayClient({
    apiKey: process.env.CLAY_API_KEY!,
    rateLimit: { requests_per_minute: 60 },
    cache: { ttl_hours: 24 }
  });

  // Use Clay.com search with fallback strategies
  const result = await clayClient.searchPeopleWithFallback(params, userPreferences);
  
  // Map results to existing LeadData format
  const leads = result.data?.map(person => 
    ClayDataMapper.toLeadData(person, {
      match_scoring: { industry_weight: 3, role_weight: 3, seniority_weight: 2 },
      include_raw_data: false
    })
  );

  return NextResponse.json({
    success: result.success,
    leads,
    strategy: result.strategy,
    cached: false, // Implement caching logic
    preferences: {
      industries: profile.target_industries,
      roles: profile.target_roles,
      region: profile.target_region,
    },
  });
}
```

## Testing Strategy

### Mock Data Structure

```typescript
// lib/clay/mock-data.ts

export const mockClayPeople: ClayPersonData[] = [
  {
    id: 'clay_1',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@techcorp.com',
    job_title: 'VP Sales',
    seniority: 'executive',
    company: {
      id: 'company_1',
      name: 'TechCorp Inc.',
      industry: 'Technology/SaaS',
      size: '500-1000',
      domain: 'techcorp.com'
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
  // Additional mock entries...
];
```

## Migration Checklist

### Development Phase
- [ ] Create TypeScript interfaces
- [ ] Implement ClayClient class
- [ ] Add search strategies
- [ ] Create data mapping utilities
- [ ] Implement error handling
- [ ] Add mock data system

### Integration Phase
- [ ] Update `/api/leads/recommended` endpoint
- [ ] Update `/api/leads/generate` endpoint
- [ ] Test with real Clay.com API
- [ ] Verify data transformation
- [ ] Test error scenarios

### Testing Phase
- [ ] Unit tests for all components
- [ ] Integration tests for API endpoints
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Error handling validation

---

This design provides a comprehensive foundation for integrating Clay.com API while maintaining compatibility with the existing Trena application architecture.