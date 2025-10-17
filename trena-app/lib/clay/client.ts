import {
  ClayClientConfig,
  ClaySearchParams,
  ClayApiResponse,
  ClaySearchResponse,
  ClayPersonData,
  ClayCompanyData,
  ClayEnrichResponse,
  ClayProgressiveResult,
  ClaySearchStrategy,
  UserPreferences,
  ClayRequestMetadata,
  ClayCacheEntry,
  ClayApiError
} from './types';
import { ClayErrorHandler } from './error-handler';
import { RequiredClayClientConfig } from './types';
import { ClaySearchStrategies } from './search-strategies';
import { ClayDataMapper } from './data-mapper';
import { 
  generateMockSearchResponse, 
  shouldUseMockData, 
  mockApiDelay 
} from './mock-data';

/**
 * Clay.com API Client
 * Main client for interacting with Clay.com API for lead generation
 */
export class ClayClient {
  private apiKey: string;
  private baseUrl: string;
  private config: RequiredClayClientConfig;
  private cache: Map<string, ClayCacheEntry<any>> = new Map();
  private rateLimitTracker: Map<string, number[]> = new Map();

  constructor(config: ClayClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.clay.com';
    
    // Set default configuration values
    this.config = {
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      rateLimit: {
        requests_per_second: 1,
        requests_per_minute: 60,
        burst_limit: 5,
        ...config.rateLimit
      },
      cache: {
        enabled: true,
        ttl_hours: 24,
        max_size: 100,
        ...config.cache
      },
      mockData: {
        enabled: shouldUseMockData(),
        fallback_on_error: true,
        ...config.mockData
      },
      retry: {
        max_attempts: 3,
        backoff_ms: 1000,
        ...config.retry
      }
    };

    console.log('🔧 Clay.com client initialized with config:', {
      baseUrl: this.baseUrl,
      rateLimit: this.config.rateLimit,
      cacheEnabled: this.config.cache.enabled,
      mockDataEnabled: this.config.mockData.enabled
    });
  }

  /**
   * Search for people with progressive fallback strategies
   */
  async searchPeopleWithFallback(
    params: ClaySearchParams,
    userPreferences?: UserPreferences
  ): Promise<ClayProgressiveResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    console.log(`🔍 [${requestId}] Starting progressive Clay.com search with params:`, params);

    try {
      // Generate search strategies
      const strategies = userPreferences
        ? ClaySearchStrategies.generateStrategies(
            userPreferences.industries,
            userPreferences.roles,
            userPreferences.region
          )
        : ClaySearchStrategies.generateStrategies(
            params.industries || [],
            params.job_titles || [],
            params.regions?.[0]
          );

      console.log(`📋 [${requestId}] Generated ${strategies.length} search strategies`);

      // Execute progressive search
      const result = await ClaySearchStrategies.executeProgressiveSearch(
        this,
        params,
        strategies
      );

      const executionTime = Date.now() - startTime;
      console.log(`✅ [${requestId}] Progressive search completed in ${executionTime}ms`);

      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ [${requestId}] Progressive search failed after ${executionTime}ms:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during progressive search',
        total_results: 0
      };
    }
  }

  /**
   * Basic people search
   */
  async searchPeople(params: ClaySearchParams): Promise<ClayApiResponse<ClayPersonData[]>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    console.log(`🔍 [${requestId}] Starting Clay.com people search:`, params);

    try {
      // Check if we should use mock data
      if (this.config.mockData.enabled) {
        console.log(`🎭 [${requestId}] Using mock data for search`);
        const mockResponse = await generateMockSearchResponse(params);
        
        return {
          success: true,
          data: mockResponse.people,
          metadata: {
            total_results: mockResponse.total_results,
            search_id: mockResponse.search_id
          }
        };
      }

      // Check cache first
      const cacheKey = this.generateCacheKey('people', params);
      const cachedResult = this.getFromCache<ClayPersonData[]>(cacheKey);
      if (cachedResult) {
        console.log(`📦 [${requestId}] Returning cached results`);
        return {
          success: true,
          data: cachedResult.data,
          metadata: {
            total_results: cachedResult.data.length,
            cached: true
          }
        };
      }

      // Check rate limits
      await this.checkRateLimit(requestId);

      // Make API request
      const response = await this.makeApiRequest<ClaySearchResponse>(
        '/people/search',
        'POST',
        params,
        requestId
      );

      if (response.success && response.data) {
        // Cache the results
        this.setCache(cacheKey, response.data.people || []);
        
        console.log(`✅ [${requestId}] Search completed successfully`);
        return {
          success: true,
          data: response.data.people || [],
          metadata: {
            total_results: response.data.total_results,
            search_id: response.data.search_id
          }
        };
      } else {
        // If API fails and mock fallback is enabled, try mock data
        if (this.config.mockData.fallback_on_error) {
          console.log(`🎭 [${requestId}] API failed, falling back to mock data`);
          const mockResponse = await generateMockSearchResponse(params);
          
          return {
            success: true,
            data: mockResponse.people,
            metadata: {
              total_results: mockResponse.total_results,
              search_id: mockResponse.search_id
            }
          };
        }

        // Transform the response to match expected type
        return {
          success: response.success,
          data: response.data?.people || [],
          error: response.error,
          metadata: response.metadata
        };
      }

    } catch (error) {
      console.error(`❌ [${requestId}] Search failed:`, error);
      
      // Fall back to mock data if enabled
      if (this.config.mockData.fallback_on_error) {
        console.log(`🎭 [${requestId}] Error occurred, falling back to mock data`);
        const mockResponse = await generateMockSearchResponse(params);
        
        return {
          success: true,
          data: mockResponse.people,
          metadata: {
            total_results: mockResponse.total_results,
            search_id: mockResponse.search_id
          }
        };
      }

      return ClayErrorHandler.prototype.handleError(error, 'searchPeople');
    }
  }

  /**
   * Enrich person data with additional information
   */
  async enrichPerson(
    identifier: string | { email?: string; linkedin_url?: string }
  ): Promise<ClayApiResponse<ClayEnrichResponse>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    console.log(`🔍 [${requestId}] Starting person enrichment:`, identifier);

    try {
      // Check if we should use mock data
      if (this.config.mockData.enabled) {
        console.log(`🎭 [${requestId}] Using mock data for enrichment`);
        return {
          success: true,
          data: {
            person: await this.getMockPerson(identifier)
          }
        };
      }

      // Make API request
      const response = await this.makeApiRequest<ClayEnrichResponse>(
        '/people/enrich',
        'POST',
        identifier,
        requestId
      );

      console.log(`✅ [${requestId}] Enrichment completed successfully`);
      return response;

    } catch (error) {
      console.error(`❌ [${requestId}] Enrichment failed:`, error);
      return ClayErrorHandler.prototype.handleError(error, 'enrichPerson');
    }
  }

  /**
   * Search for companies
   */
  async searchCompanies(params: {
    query?: string;
    industry?: string;
    size?: string;
    location?: string;
  }): Promise<ClayApiResponse<ClayCompanyData[]>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    console.log(`🔍 [${requestId}] Starting company search:`, params);

    try {
      // Check if we should use mock data
      if (this.config.mockData.enabled) {
        console.log(`🎭 [${requestId}] Using mock data for company search`);
        return {
          success: true,
          data: await this.getMockCompanies(params)
        };
      }

      // Make API request
      const response = await this.makeApiRequest<ClayCompanyData[]>(
        '/v1/companies/search',
        'POST',
        params,
        requestId
      );

      console.log(`✅ [${requestId}] Company search completed successfully`);
      return response;

    } catch (error) {
      console.error(`❌ [${requestId}] Company search failed:`, error);
      return ClayErrorHandler.prototype.handleError(error, 'searchCompanies');
    }
  }

  /**
   * Make authenticated API request
   */
  private async makeApiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    data?: any,
    requestId?: string
  ): Promise<ClayApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Request-ID': requestId || this.generateRequestId()
    };

    console.log(`🌐 [${requestId}] Making ${method} request to ${endpoint}`);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        const apiError = ClayErrorHandler.createFromResponse(response.status, errorText);
        throw apiError;
      }

      const responseData = await response.json();
      
      console.log(`✅ [${requestId}] API request successful`);
      return {
        success: true,
        data: responseData
      };

    } catch (error) {
      if (error instanceof ClayApiError) {
        throw error;
      }

      console.error(`❌ [${requestId}] API request failed:`, error);
      throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check rate limits
   */
  private async checkRateLimit(requestId?: string): Promise<void> {
    const now = Date.now();
    const minuteKey = Math.floor(now / 60000); // Current minute
    const secondKey = Math.floor(now / 1000); // Current second

    // Check per-minute limit
    const minuteRequests = this.rateLimitTracker.get(`minute:${minuteKey}`) || [];
    if (minuteRequests.length >= this.config.rateLimit.requests_per_minute!) {
      const waitTime = 60000 - (now - minuteRequests[0]);
      console.log(`⏱️ [${requestId}] Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Check per-second limit
    const secondRequests = this.rateLimitTracker.get(`second:${secondKey}`) || [];
    if (secondRequests.length >= this.config.rateLimit.requests_per_second!) {
      const waitTime = 1000 - (now - secondRequests[0]);
      console.log(`⏱️ [${requestId}] Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Record this request
    minuteRequests.push(now);
    secondRequests.push(now);
    this.rateLimitTracker.set(`minute:${minuteKey}`, minuteRequests);
    this.rateLimitTracker.set(`second:${secondKey}`, secondRequests);

    // Clean old entries
    this.cleanRateLimitTracker();
  }

  /**
   * Clean old rate limit entries
   */
  private cleanRateLimitTracker(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneSecondAgo = now - 1000;

    for (const [key, timestamps] of this.rateLimitTracker.entries()) {
      const cutoff = key.startsWith('minute:') ? oneMinuteAgo : oneSecondAgo;
      const filtered = timestamps.filter(timestamp => timestamp > cutoff);
      
      if (filtered.length === 0) {
        this.rateLimitTracker.delete(key);
      } else {
        this.rateLimitTracker.set(key, filtered);
      }
    }
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(type: string, params: any): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): ClayCacheEntry<T> | null {
    if (!this.config.cache.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * Set data in cache
   */
  private setCache<T>(key: string, data: T): void {
    if (!this.config.cache.enabled) return;

    // Check cache size limit
    if (this.cache.size >= this.config.cache.max_size!) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const ttl = this.config.cache.ttl_hours! * 60 * 60 * 1000; // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Generate request ID
   */
  private generateRequestId(): string {
    return `clay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get mock person data
   */
  private async getMockPerson(
    identifier: string | { email?: string; linkedin_url?: string }
  ): Promise<ClayPersonData | undefined> {
    // Simulate API delay
    await mockApiDelay(300, 800);
    
    // Return mock person (simplified for now)
    return {
      id: 'mock_person_1',
      first_name: 'Mock',
      last_name: 'Person',
      email: typeof identifier === 'string' ? identifier : identifier.email,
      job_title: 'Mock Role',
      seniority: 'senior',
      company: {
        id: 'mock_company_1',
        name: 'Mock Company',
        industry: 'Technology'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Get mock company data
   */
  private async getMockCompanies(params: any): Promise<ClayCompanyData[]> {
    // Simulate API delay
    await mockApiDelay(300, 800);
    
    // Return mock companies (simplified for now)
    return [
      {
        id: 'mock_company_1',
        name: 'Mock Company',
        industry: 'Technology',
        size: '100-500',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Clay.com client cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    enabled: boolean;
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.cache.max_size!,
      enabled: this.config.cache.enabled!
    };
  }
}

// Export a singleton instance for convenience
let clayClientInstance: ClayClient | null = null;

export function getClayClient(config?: ClayClientConfig): ClayClient {
  if (!clayClientInstance) {
    if (!config) {
      throw new Error('ClayClient configuration required for first initialization');
    }
    clayClientInstance = new ClayClient(config);
  }
  return clayClientInstance;
}