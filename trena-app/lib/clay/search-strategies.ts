import {
  ClaySearchParams,
  ClaySearchStrategy,
  ClayProgressiveResult,
  UserPreferences
} from './types';

// Forward declaration for ClayClient (will be imported after client is created)
interface ClayClientInterface {
  searchPeople(params: ClaySearchParams): Promise<{ success: boolean; data?: any; error?: string }>;
}

/**
 * Clay.com Search Strategies
 * Implements progressive search with fallback strategies for optimal lead generation
 */
export class ClaySearchStrategies {
  /**
   * Generate progressive search strategies based on user preferences
   * Strategies are ordered from most specific to most general
   */
  static generateStrategies(
    industries: string[],
    roles: string[],
    region?: string
  ): ClaySearchStrategy[] {
    const strategies: ClaySearchStrategy[] = [];

    // Strategy 1: Exact Match - All filters applied
    strategies.push({
      name: 'exact-match',
      description: 'Precise match with all your criteria',
      priority: 1,
      params: {
        industries,
        job_titles: roles,
        regions: region ? [region] : [],
        seniority: ['executive', 'director', 'manager', 'senior'],
        limit: 10
      },
      filters: {
        strict_match: true,
        require_all_criteria: true
      }
    });

    // Strategy 2: Industry & Role Focus - Seniority broadened
    strategies.push({
      name: 'industry-role-focus',
      description: 'Focus on target industries and roles with broader seniority',
      priority: 2,
      params: {
        industries,
        job_titles: roles,
        seniority: ['executive', 'director', 'manager', 'senior', 'junior'],
        limit: 15
      },
      filters: {
        require_industry_match: true,
        require_role_match: true
      }
    });

    // Strategy 3: Industry Focus - Broad role search
    if (industries.length > 0) {
      strategies.push({
        name: 'industry-focused',
        description: 'Focus on target industries with broader roles',
        priority: 3,
        params: {
          industries,
          seniority: ['executive', 'director', 'manager', 'senior'],
          limit: 15
        },
        filters: {
          require_industry_match: true
        }
      });
    }

    // Strategy 4: Role Focus - Cross-industry search
    if (roles.length > 0) {
      strategies.push({
        name: 'role-focused',
        description: 'Focus on target roles across industries',
        priority: 4,
        params: {
          job_titles: roles,
          seniority: ['executive', 'director', 'manager', 'senior'],
          limit: 15
        },
        filters: {
          require_role_match: true
        }
      });
    }

    // Strategy 5: Seniority Focus - High-level decision makers
    strategies.push({
      name: 'seniority-focused',
      description: 'Focus on seniority levels across all criteria',
      priority: 5,
      params: {
        seniority: ['executive', 'director'],
        limit: 20
      },
      filters: {
        seniority_only: true
      }
    });

    // Strategy 6: Regional Focus - Geographic targeting
    if (region) {
      strategies.push({
        name: 'regional-focus',
        description: `Focus on ${region} region with broad criteria`,
        priority: 6,
        params: {
          regions: [region],
          seniority: ['executive', 'director', 'manager'],
          limit: 20
        },
        filters: {
          geographic_focus: true
        }
      });
    }

    // Strategy 7: Broad Search - Minimal filters
    strategies.push({
      name: 'broad-search',
      description: 'Wider search with minimal criteria for maximum results',
      priority: 7,
      params: {
        seniority: ['executive', 'director', 'manager'],
        limit: 25
      },
      filters: {
        minimal_filters: true
      }
    });

    return strategies;
  }

  /**
   * Execute progressive search with fallback strategies
   * Tries each strategy until finding sufficient results
   */
  static async executeProgressiveSearch(
    client: ClayClient,
    params: ClaySearchParams,
    strategies: ClaySearchStrategy[],
    minimumResults: number = 3
  ): Promise<ClayProgressiveResult> {
    console.log('🔍 Starting progressive Clay.com search with strategies:', 
      strategies.map(s => s.name));

    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i];
      console.log(`\n🎯 Strategy ${i + 1}/${strategies.length}: ${strategy.name} - ${strategy.description}`);

      try {
        // Execute search with current strategy
        const searchResult = await this.executeStrategy(client, strategy, params);
        
        if (searchResult.success && searchResult.data && searchResult.data.length > 0) {
          console.log(`✅ SUCCESS: Strategy "${strategy.name}" found ${searchResult.data.length} leads`);
          
          // Return results with strategy information
          return {
            success: true,
            data: searchResult.data,
            strategy,
            total_results: searchResult.data.length
          };
        } else {
          console.log(`❌ Strategy "${strategy.name}" failed: ${searchResult.error || 'No results'}`);
          
          // If this is the last strategy, return the last attempt's result
          if (i === strategies.length - 1) {
            return {
              success: false,
              error: `All search strategies failed. Last strategy "${strategy.name}" returned: ${searchResult.error || 'No results'}`,
              strategy,
              total_results: 0
            };
          }
        }
      } catch (error) {
        console.error(`❌ Strategy "${strategy.name}" threw error:`, error);
        
        // Continue to next strategy unless this is the last one
        if (i === strategies.length - 1) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during search',
            strategy,
            total_results: 0
          };
        }
      }
    }

    // Should never reach here, but just in case
    return {
      success: false,
      error: 'No search strategies were available',
      total_results: 0
    };
  }

  /**
   * Execute a single search strategy
   */
  private static async executeStrategy(
    client: ClayClientInterface,
    strategy: ClaySearchStrategy,
    originalParams: ClaySearchParams
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Merge strategy params with original params
      const searchParams: ClaySearchParams = {
        ...originalParams,
        ...strategy.params,
        // Ensure limit is respected
        limit: Math.min(originalParams.limit || 10, strategy.params?.limit || 10)
      };

      // Execute search
      const result = await client.searchPeople(searchParams);
      
      if (result.success && result.data && result.data.length > 0) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          error: result.error || 'No results found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get strategy recommendations based on search results
   */
  static getStrategyRecommendations(
    lastStrategy: ClaySearchStrategy,
    resultsCount: number
  ): string[] {
    const recommendations: string[] = [];

    if (resultsCount === 0) {
      switch (lastStrategy.name) {
        case 'exact-match':
          recommendations.push('Try broadening your search criteria');
          recommendations.push('Consider removing some filters');
          break;
        case 'industry-focused':
          recommendations.push('Try searching across different industries');
          recommendations.push('Focus on specific roles instead');
          break;
        case 'role-focused':
          recommendations.push('Try different job titles or seniority levels');
          recommendations.push('Consider industry-specific searches');
          break;
        case 'seniority-focused':
          recommendations.push('Try including all seniority levels');
          recommendations.push('Consider specific job functions');
          break;
        case 'broad-search':
          recommendations.push('Try different keywords or companies');
          recommendations.push('Consider changing geographic focus');
          break;
        default:
          recommendations.push('Try completely different search parameters');
          recommendations.push('Contact support for assistance');
      }
    } else if (resultsCount < 3) {
      recommendations.push('Fewer results than expected - try broader criteria');
      recommendations.push('Consider removing specific filters');
    }

    return recommendations;
  }

  /**
   * Optimize search parameters based on previous results
   */
  static optimizeSearchParams(
    originalParams: ClaySearchParams,
    lastStrategy: ClaySearchStrategy,
    resultsCount: number
  ): ClaySearchParams {
    const optimizedParams = { ...originalParams };

    // If no results, broaden the search
    if (resultsCount === 0) {
      // Remove some filters based on the strategy used
      switch (lastStrategy.name) {
        case 'exact-match':
          // Remove some specific criteria
          delete optimizedParams.seniority;
          break;
        case 'industry-focused':
          // Add more industries or remove industry filter
          delete optimizedParams.industries;
          break;
        case 'role-focused':
          // Add more roles or remove role filter
          delete optimizedParams.job_titles;
          break;
        case 'seniority-focused':
          // Include all seniority levels
          optimizedParams.seniority = ['executive', 'director', 'manager', 'senior', 'junior'];
          break;
      }
    }

    // If very few results, increase limit
    if (resultsCount > 0 && resultsCount < 3) {
      optimizedParams.limit = Math.min((optimizedParams.limit || 10) * 2, 50);
    }

    return optimizedParams;
  }

  /**
   * Create a fallback strategy when all others fail
   */
  static createFallbackStrategy(): ClaySearchStrategy {
    return {
      name: 'fallback-broad',
      description: 'Maximum broad search as last resort',
      priority: 999,
      params: {
        limit: 30
      },
      filters: {
        fallback_mode: true
      }
    };
  }
}

/**
 * Search strategy performance tracking
 */
export interface StrategyPerformance {
  strategy: ClaySearchStrategy;
  executionTime: number;
  resultsCount: number;
  success: boolean;
  error?: string;
}

export class SearchStrategyTracker {
  private performances: StrategyPerformance[] = [];

  /**
   * Track strategy execution performance
   */
  trackPerformance(
    strategy: ClaySearchStrategy,
    executionTime: number,
    resultsCount: number,
    success: boolean,
    error?: string
  ): void {
    this.performances.push({
      strategy,
      executionTime,
      resultsCount,
      success,
      error
    });
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalStrategies: number;
    successfulStrategies: number;
    averageExecutionTime: number;
    bestStrategy?: StrategyPerformance;
    worstStrategy?: StrategyPerformance;
  } {
    const successful = this.performances.filter(p => p.success);
    const avgTime = this.performances.reduce((sum, p) => sum + p.executionTime, 0) / this.performances.length;
    
    const bestStrategy = successful.length > 0 
      ? successful.reduce((best, current) => current.resultsCount > best.resultsCount ? current : best)
      : undefined;
    
    const worstStrategy = this.performances.length > 0
      ? this.performances.reduce((worst, current) => current.executionTime > worst.executionTime ? current : worst)
      : undefined;

    return {
      totalStrategies: this.performances.length,
      successfulStrategies: successful.length,
      averageExecutionTime: avgTime,
      bestStrategy,
      worstStrategy
    };
  }

  /**
   * Clear performance tracking
   */
  clear(): void {
    this.performances = [];
  }
}