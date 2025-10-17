# Clay.com Integration Documentation

## Overview

This document provides comprehensive documentation for the Clay.com API integration in the Trena application. The integration replaces the previous Lusha API implementation with Clay.com's lead generation capabilities.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Setup and Configuration](#setup-and-configuration)
3. [API Client Usage](#api-client-usage)
4. [Search Strategies](#search-strategies)
5. [Data Mapping](#data-mapping)
6. [Error Handling](#error-handling)
7. [Testing](#testing)
8. [Migration Guide](#migration-guide)
9. [Troubleshooting](#troubleshooting)

## Architecture Overview

### Core Components

```
lib/clay/
├── client.ts              # Main Clay.com API client
├── types.ts               # TypeScript interfaces
├── search-strategies.ts   # Search strategy implementations
├── data-mapper.ts         # Data transformation utilities
├── error-handler.ts       # Error handling utilities
└── mock-data.ts           # Mock data for development
```

### Integration Points

- **API Endpoints**: `/api/leads/recommended`, `/api/leads/generate`
- **Test Endpoint**: `/api/test/clay` (for development and testing)
- **Frontend Components**: Home page, onboarding flow, research page

## Setup and Configuration

### Environment Variables

Add the following to your `.env.local` file:

```env
# Clay.com API Configuration
CLAY_API_KEY="your-clay-api-key"
CLAY_BASE_URL="https://api.clay.com"

# Clay.com API Rate Limiting
CLAY_REFRESH_COOLDOWN_SECONDS="30"
CLAY_CACHE_HOURS="24"

# Clay.com Development Options
CLAY_USE_MOCK_DATA="false"  # Set to true for development
```

### Required API Key

To obtain a Clay.com API key:

1. Sign up at [clay.com](https://clay.com)
2. Navigate to Settings > API Keys
3. Generate a new API key
4. Add the key to your environment variables

### Client Configuration

```typescript
import { ClayClient } from '@/lib/clay/client';

const clayClient = new ClayClient({
  apiKey: process.env.CLAY_API_KEY!,
  rateLimit: {
    requests_per_second: 1,
    requests_per_minute: 60,
    burst_limit: 5
  },
  cache: {
    enabled: true,
    ttl_hours: 24,
    max_size: 100
  },
  mockData: {
    enabled: false,
    fallback_on_error: true
  }
});
```

## API Client Usage

### Basic People Search

```typescript
const result = await clayClient.searchPeople({
  industries: ['Technology/SaaS'],
  job_titles: ['VP Sales', 'Director of Marketing'],
  regions: ['north-america'],
  limit: 10
});

if (result.success) {
  console.log('Found leads:', result.data);
} else {
  console.error('Search failed:', result.error);
}
```

### Progressive Search with Fallback

```typescript
const result = await clayClient.searchPeopleWithFallback(
  {
    industries: ['Technology/SaaS'],
    job_titles: ['VP Sales'],
    limit: 5
  },
  {
    industries: ['Technology/SaaS'],
    roles: ['VP Sales'],
    region: 'north-america'
  }
);
```

### Person Enrichment

```typescript
const result = await clayClient.enrichPerson({
  email: 'john.doe@company.com'
});

if (result.success) {
  console.log('Enriched data:', result.data);
}
```

### Company Search

```typescript
const result = await clayClient.searchCompanies({
  query: 'TechCorp',
  industry: 'Technology/SaaS',
  size: '500-1000'
});
```

## Search Strategies

The Clay.com integration uses progressive search strategies to maximize lead discovery:

### Available Strategies

1. **Exact Match** - All filters applied strictly
2. **Industry-Role Focus** - Industry and role matching with broader seniority
3. **Industry Focus** - Industry matching with broader roles
4. **Role Focus** - Role matching across industries
5. **Seniority Focus** - Seniority-based filtering
6. **Regional Focus** - Geographic-based filtering
7. **Broad Search** - Minimal criteria for maximum results

### Strategy Execution

The system automatically tries each strategy in order until finding sufficient results:

```typescript
// Strategies are automatically generated based on user preferences
const strategies = ClaySearchStrategies.generateStrategies(
  ['Technology/SaaS', 'Healthcare'],  // industries
  ['VP Sales', 'CEO'],                // roles
  'north-america'                      // region
);

// Execute progressive search
const result = await ClaySearchStrategies.executeProgressiveSearch(
  clayClient,
  searchParams,
  strategies
);
```

## Data Mapping

### Clay.com to Lead Data Transformation

The `ClayDataMapper` class handles transformation from Clay.com format to internal Trena format:

```typescript
// Map Clay person to lead
const lead = ClayDataMapper.toLeadData(clayPerson, {
  include_raw_data: true
});

// Map with match scoring
const enrichedLead = ClayDataMapper.toEnrichedLeadData(
  clayPerson,
  userPreferences,
  searchStrategy,
  {
    match_scoring: {
      industry_weight: 3,
      role_weight: 3,
      seniority_weight: 2,
      location_weight: 1
    }
  }
);
```

### Match Scoring Algorithm

The system calculates match scores based on user preferences:

- **Industry Match**: 3 points
- **Role Match**: 3 points
- **Seniority Match**: 2-5 points (based on level)
- **Location Match**: 1 point

### Lead Data Structure

```typescript
interface MappedLeadData {
  lead_name: string;           // Full name
  job_title?: string;          // Job title
  company_name?: string;       // Company name
  email?: string;              // Email address
  phone?: string;              // Phone number
  linkedin_url?: string;       // LinkedIn URL
  company_size?: string;       // Company size
  industry?: string;           // Industry
  source: 'clay';              // Data source
  match_reasoning?: string;    // Why this lead matches
  match_score?: number;        // Match score (1-20)
  strategy_used?: string;      // Strategy that found this lead
  raw_clay_data?: ClayPersonData; // Original Clay.com data
}
```

## Error Handling

### Error Types

The system handles various error types with appropriate fallbacks:

```typescript
type ClayApiErrorType = 
  | 'RATE_LIMIT'        // Too many requests
  | 'AUTHENTICATION'    // Invalid API key
  | 'INVALID_REQUEST'   // Bad request format
  | 'QUOTA_EXCEEDED'    // API quota exceeded
  | 'UNKNOWN';          // Unexpected error
```

### Error Recovery

```typescript
// Automatic fallback to mock data on API errors
const clayClient = new ClayClient({
  apiKey: process.env.CLAY_API_KEY!,
  mockData: {
    fallback_on_error: true  // Enable fallback
  }
});
```

### Error Suggestions

The system provides helpful suggestions based on error type:

```typescript
const suggestions = ClayErrorHandler.getErrorSuggestions(apiError);
// Example: ["Wait a few minutes before trying again", "Consider upgrading your plan"]
```

## Testing

### Test Endpoint

Use the test endpoint to verify integration:

```bash
# Basic test
curl -X GET http://localhost:3000/api/test/clay

# Custom search test
curl -X POST http://localhost:3000/api/test/clay \
  -H "Content-Type: application/json" \
  -d '{
    "industries": ["Technology/SaaS"],
    "job_titles": ["VP Sales"],
    "limit": 5
  }'
```

### Mock Data Testing

Enable mock data for development:

```env
CLAY_USE_MOCK_DATA="true"
```

### Unit Testing

```typescript
import { ClayClient } from '@/lib/clay/client';

describe('ClayClient', () => {
  let client: ClayClient;

  beforeEach(() => {
    client = new ClayClient({
      apiKey: 'test-key',
      mockData: { enabled: true }
    });
  });

  it('should search for people', async () => {
    const result = await client.searchPeople({
      industries: ['Technology'],
      limit: 5
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(5);
  });
});
```

## Migration Guide

### From Lusha to Clay.com

The migration maintains backward compatibility while adding new features:

1. **API Endpoints**: Same endpoints, different underlying implementation
2. **Data Structure**: Compatible with existing LeadData format
3. **Search Parameters**: Same parameter names and types
4. **Error Handling**: Enhanced error handling with better fallbacks

### Code Changes Required

1. Update imports:
   ```typescript
   // Old
   import { searchPeople } from '@/lib/lusha/client';
   
   // New
   import { ClayClient } from '@/lib/clay/client';
   ```

2. Update API calls:
   ```typescript
   // Old
   const result = await searchPeople(params);
   
   // New
   const clayClient = new ClayClient(config);
   const result = await clayClient.searchPeople(params);
   ```

3. Update environment variables:
   ```env
   # Remove LUSHA_API_KEY
   # Add CLAY_API_KEY
   ```

### Feature Mapping

| Lusha Feature | Clay.com Equivalent | Notes |
|---------------|-------------------|-------|
| `searchPeople` | `searchPeople` | Same interface |
| `enrichLead` | `enrichPerson` | Enhanced data |
| `companySearch` | `searchCompanies` | More detailed |
| Progressive Search | Built-in | 7 strategies |
| Rate Limiting | Built-in | Configurable |
| Caching | Built-in | Multi-layer |

## Troubleshooting

### Common Issues

#### API Key Problems

**Error**: `Authentication failed. Please check your Clay.com API key.`

**Solution**:
1. Verify API key is correct
2. Check key has sufficient permissions
3. Ensure key is not expired

#### Rate Limiting

**Error**: `Rate limit exceeded. Please wait before retrying.`

**Solution**:
1. Implement client-side rate limiting
2. Use caching to reduce API calls
3. Upgrade your Clay.com plan

#### No Results Found

**Error**: `No results found matching your criteria.`

**Solution**:
1. Try broader search criteria
2. Use progressive search strategies
3. Enable mock data for testing

#### Network Issues

**Error**: `Network error. Please check your internet connection.`

**Solution**:
1. Check network connectivity
2. Verify firewall settings
3. Use mock data fallback

### Debug Mode

Enable detailed logging:

```typescript
const clayClient = new ClayClient({
  apiKey: process.env.CLAY_API_KEY!,
  // Add debug logging
});

// Check cache stats
console.log(clayClient.getCacheStats());
```

### Performance Optimization

1. **Enable Caching**: Reduce API calls with intelligent caching
2. **Use Progressive Search**: Start with specific criteria, broaden as needed
3. **Implement Rate Limiting**: Respect API limits
4. **Batch Requests**: Process multiple leads efficiently

### Support Resources

- **Clay.com API Documentation**: [https://docs.clay.com](https://docs.clay.com)
- **Trena Documentation**: Internal documentation
- **GitHub Issues**: Report bugs and feature requests
- **Community Forum**: Get help from other developers

## Best Practices

### API Usage

1. **Respect Rate Limits**: Implement client-side rate limiting
2. **Use Caching**: Cache results to reduce API calls
3. **Handle Errors Gracefully**: Provide fallbacks and user-friendly messages
4. **Monitor Usage**: Track API usage and costs

### Data Management

1. **Validate Input**: Ensure search parameters are valid
2. **Transform Data**: Use the data mapper for consistent formatting
3. **Store Securely**: Protect API keys and sensitive data
4. **Update Regularly**: Keep dependencies and API versions current

### Development

1. **Use Mock Data**: Enable mock data for development and testing
2. **Write Tests**: Cover all scenarios with comprehensive tests
3. **Document Changes**: Keep documentation up to date
4. **Monitor Performance**: Track response times and error rates

---

## Conclusion

The Clay.com integration provides a robust, scalable solution for lead generation in the Trena application. With progressive search strategies, intelligent caching, and comprehensive error handling, it offers significant improvements over the previous Lusha implementation.

For questions or support, refer to the troubleshooting section or contact the development team.