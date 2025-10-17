// Clay.com API Types for Trena Integration

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
  created_at?: string;
  updated_at?: string;
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
    search_id?: string;
    cached?: boolean;
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

/**
 * User preferences for search matching
 */
export interface UserPreferences {
  industries: string[];
  roles: string[];
  region?: string;
}

/**
 * Clay.com client configuration
 */
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

/**
 * Required Clay.com client configuration (with defaults applied)
 */
export interface RequiredClayClientConfig {
  apiKey: string;
  baseUrl: string;
  rateLimit: {
    requests_per_second: number;
    requests_per_minute: number;
    burst_limit: number;
  };
  cache: {
    enabled: boolean;
    ttl_hours: number;
    max_size: number;
  };
  mockData: {
    enabled: boolean;
    fallback_on_error: boolean;
  };
  retry: {
    max_attempts: number;
    backoff_ms: number;
  };
}

/**
 * Clay.com API error types
 */
export type ClayApiErrorType = 
  | 'RATE_LIMIT'
  | 'AUTHENTICATION'
  | 'INVALID_REQUEST'
  | 'QUOTA_EXCEEDED'
  | 'UNKNOWN';

/**
 * Cache entry structure
 */
export interface ClayCacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Rate limiter configuration
 */
export interface ClayRateLimitConfig {
  requests_per_second: number;
  requests_per_minute: number;
  burst_limit: number;
}

/**
 * API request metadata
 */
export interface ClayRequestMetadata {
  request_id: string;
  timestamp: number;
  strategy?: string;
  cached?: boolean;
  response_time?: number;
}

/**
 * Custom error class for Clay.com API errors
 */
export class ClayApiError extends Error {
  constructor(
    message: string,
    public type: ClayApiErrorType,
    public status?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ClayApiError';
  }
}