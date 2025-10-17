# Clay.com Integration Architecture

## System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Components"
        A[Home Page] --> B[RecommendedLeadsWidget]
        C[Onboarding Quick Win] --> D[Lead Generation]
        E[Research Page] --> F[Lead Details]
    end

    subgraph "API Layer"
        G[/api/leads/recommended] --> H[ClayClient]
        I[/api/leads/generate] --> H
        J[/api/research/leads] --> H
    end

    subgraph "Clay.com Integration"
        H --> K[Search Strategies]
        H --> L[Data Mapper]
        H --> M[Error Handler]
        H --> N[Rate Limiter]
        H --> O[Cache Manager]
    end

    subgraph "External Services"
        P[Clay.com API]
        Q[Supabase Database]
        R[Mock Data Service]
    end

    subgraph "Data Flow"
        K --> P
        L --> Q
        M --> R
        N --> P
        O --> Q
    end

    B --> G
    D --> I
    F --> J
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Layer
    participant C as ClayClient
    participant CL as Clay.com API
    participant DB as Supabase
    participant M as Mock Data

    U->>F: Request leads
    F->>A: GET /api/leads/recommended
    A->>C: searchPeopleWithFallback()
    
    loop Progressive Search Strategies
        C->>CL: Search request
        alt Success
            CL-->>C: Results
        else Failure
            C->>C: Try next strategy
        end
    end
    
    alt All strategies fail
        C->>M: Fallback to mock data
        M-->>C: Mock results
    end
    
    C->>C: Map to LeadData format
    C->>DB: Cache results
    C-->>A: Formatted leads
    A-->>F: Lead data
    F-->>U: Display leads
```

## Component Interaction Diagram

```mermaid
graph LR
    subgraph "User Interface Layer"
        UI1[Home Page]
        UI2[Onboarding]
        UI3[Research]
    end

    subgraph "API Gateway"
        API1[Recommended Leads API]
        API2[Generate Leads API]
        API3[Research API]
    end

    subgraph "Business Logic Layer"
        BL1[ClayClient Core]
        BL2[Search Strategy Engine]
        BL3[Data Transformation]
        BL4[Error Management]
    end

    subgraph "Data Layer"
        DL1[Clay.com API]
        DL2[Supabase Cache]
        DL3[Mock Data Store]
    end

    UI1 --> API1
    UI2 --> API2
    UI3 --> API3
    
    API1 --> BL1
    API2 --> BL1
    API3 --> BL1
    
    BL1 --> BL2
    BL1 --> BL3
    BL1 --> BL4
    
    BL2 --> DL1
    BL3 --> DL2
    BL4 --> DL3
```

## Search Strategy Flow

```mermaid
flowchart TD
    A[Start Search] --> B[Generate Strategies]
    B --> C[Strategy 1: Exact Match]
    C --> D{Results found?}
    D -->|Yes| E[Map to LeadData]
    D -->|No| F[Strategy 2: Industry Focus]
    F --> G{Results found?}
    G -->|Yes| E
    G -->|No| H[Strategy 3: Role Focus]
    H --> I{Results found?}
    I -->|Yes| E
    I -->|No| J[Strategy 4: Seniority Focus]
    J --> K{Results found?}
    K -->|Yes| E
    K -->|No| L[Strategy 5: Broad Search]
    L --> M{Results found?}
    M -->|Yes| E
    M -->|No| N[Use Mock Data]
    N --> E
    E --> O[Return Results]
```

## Error Handling Flow

```mermaid
flowchart TD
    A[API Request] --> B{Success?}
    B -->|Yes| C[Return Results]
    B -->|No| D[Error Classification]
    D --> E{Error Type}
    E -->|Rate Limit| F[Wait & Retry]
    E -->|Auth Error| G[Return Auth Error]
    E -->|Invalid Request| H[Return Validation Error]
    E -->|Quota Exceeded| I[Return Quota Error]
    E -->|Unknown| J[Return Generic Error]
    F --> K{Retry Limit Reached?}
    K -->|No| A
    K -->|Yes| L[Fallback to Mock Data]
    L --> M[Return Mock Results]
    G --> N[Log Error]
    H --> N
    I --> N
    J --> N
    N --> O[Return Error Response]
```

## Caching Strategy

```mermaid
graph TB
    subgraph "Cache Layers"
        A[Memory Cache] --> B[TTL: 1 hour]
        C[Database Cache] --> D[TTL: 24 hours]
        E[Mock Data Cache] --> F[Persistent]
    end

    subgraph "Cache invalidation"
        G[Time-based expiry]
        H[Manual clear]
        I[User preference change]
    end

    subgraph "Cache flow"
        J[Request] --> K{Check Memory Cache}
        K -->|Hit| L[Return cached]
        K -->|Miss| M{Check DB Cache}
        M -->|Hit| N[Update Memory Cache]
        M -->|Miss| O[Call Clay.com API]
        O --> P{Success?}
        P -->|Yes| Q[Update all caches]
        P -->|No| R[Use Mock Data]
        Q --> S[Return results]
        R --> S
        N --> S
    end
```

## Migration Strategy Timeline

```mermaid
gantt
    title Clay.com Migration Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1: Foundation
    Type Definitions     :done, p1a, 2024-01-15, 2d
    Client Architecture  :done, p1b, 2024-01-17, 3d
    Error Handling       :done, p1c, 2024-01-20, 2d
    
    section Phase 2: Core Implementation
    Search Strategies     :active, p2a, 2024-01-22, 3d
    Data Mapping          :p2b, 2024-01-25, 2d
    API Integration       :p2c, 2024-01-27, 3d
    
    section Phase 3: Testing
    Unit Tests            :p3a, 2024-01-30, 2d
    Integration Tests     :p3b, 2024-02-01, 3d
    End-to-End Tests      :p3c, 2024-02-04, 2d
    
    section Phase 4: Deployment
    Staging Deployment    :p4a, 2024-02-06, 2d
    Production Rollout    :p4b, 2024-02-08, 3d
    Monitoring & Optimization :p4c, 2024-02-11, 2d
```

## Technology Stack

### Frontend Components
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend Services
- **Next.js API Routes** - Server-side logic
- **Supabase** - Database and caching
- **Clay.com API** - Lead generation service

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Mermaid** - Diagram generation

## Performance Considerations

### Response Time Targets
- **API Response**: < 2 seconds
- **Cache Hit**: < 100ms
- **Mock Data**: < 50ms
- **Error Response**: < 500ms

### Rate Limiting Strategy
- **Clay.com API**: 60 requests/minute
- **User Rate Limit**: 1 request/30 seconds
- **Burst Handling**: 5 requests max

### Caching Strategy
- **Memory Cache**: 1 hour TTL
- **Database Cache**: 24 hour TTL
- **Cache Invalidation**: Manual + Time-based

## Security Considerations

### API Key Management
- Environment variable storage
- Server-side only access
- Regular key rotation

### Data Privacy
- No PII in logs
- Secure data transmission
- GDPR compliance

### Error Handling
- No sensitive data in error messages
- Graceful degradation
- User-friendly error messages

## Monitoring & Observability

### Key Metrics
- API response times
- Error rates by type
- Cache hit ratios
- User satisfaction scores

### Logging Strategy
- Structured logging
- Error correlation IDs
- Performance metrics
- User interaction tracking

### Alerting
- High error rate alerts
- Performance degradation
- API quota warnings
- Service availability

---

This architecture provides a robust foundation for integrating Clay.com API while maintaining high performance, reliability, and user experience standards.