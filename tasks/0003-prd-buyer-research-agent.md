# PRD #0003: Buyer Research Agent

## 1. Introduction/Overview

This PRD defines the Buyer Research Agent - a core feature that pulls company and individual prospect data from Lusha, enriches it with buying signals, and builds dynamic AI-powered personas to help sales reps deeply understand their buyers before reaching out.

**Problem it solves:** Sales reps waste hours manually researching prospects across multiple platforms (LinkedIn, company websites, news, tech stack tools). Research is often incomplete, inconsistent, and doesn't surface the buyer's real pain points or motivations. This leads to generic outreach that gets ignored.

**Goal:** Automate comprehensive buyer research by pulling rich data from Lusha, identifying buying signals, and generating AI-powered personas that reveal the buyer's needs, challenges, and conversation starters - all in under 30 seconds per prospect.

## 2. Goals

1. Enable reps to research prospects via multiple input methods (manual entry, CSV upload, CRM sync)
2. Pull comprehensive company and individual data from Lusha API
3. Generate AI-powered buyer personas with pain points, goals, talk tracks, and conversation starters
4. Surface buying signals (funding, job changes, company growth) to prioritize outreach
5. Save researched leads to a "Researched Leads" list for future reference
6. Deliver research results in under 30 seconds per prospect
7. Display results in an intuitive list + detail view optimized for mobile

## 3. User Stories

**As a sales rep**, I want to:
- Quickly research a company or individual prospect by name so I can understand them before reaching out
- Upload a CSV of leads and have them all researched automatically
- Connect my CRM (Salesforce/HubSpot) and auto-research my pipeline leads
- See comprehensive data (contact info, company insights, tech stack) in one place
- Understand the buyer's likely pain points and goals so I can personalize my pitch
- Get conversation starters and talk tracks based on the buyer's profile
- See buying signals (recent funding, new hires, growth) so I know who to prioritize
- Save researched leads so I can revisit them later without re-searching
- Access research results quickly on my phone while on the go

**As a product owner**, I want to:
- Reduce time reps spend on manual research from hours to seconds
- Increase outreach personalization by providing rich buyer context
- Drive engagement with the platform by delivering immediate research value
- Track which research methods are most used (manual, CSV, CRM)

## 4. Functional Requirements

### Research Input Methods (FR-INPUT)

**Manual Entry:**
1. The system must provide a search interface where users can enter:
   - Company name only (to find people at that company), OR
   - Person name + Company name (to research specific individual), OR
   - Person name only (system searches across companies)
2. The system must auto-suggest companies as user types (if Lusha supports autocomplete)
3. The system must validate that at least company OR person name is provided
4. The system must initiate research when user clicks "Research" or presses Enter

**CSV Upload:**
5. The system must allow users to upload CSV files with prospect data
6. The system must support flexible CSV columns (any combination of):
   - Company name
   - Person first name
   - Person last name
   - Email address
   - LinkedIn URL
   - Job title
   - Other custom fields (ignored but preserved)
7. The system must validate CSV format and show preview before processing
8. The system must show upload progress (e.g., "Processing 5 of 20 leads...")
9. The system must handle errors gracefully (e.g., "3 leads failed - invalid data")
10. The system must process CSV uploads one lead at a time in MVP (no parallel processing)

**CRM Auto-Research:**
11. The system must support Salesforce integration:
    - OAuth connection to Salesforce account
    - Pull contacts/leads from Salesforce
    - Display list of contacts with "Research" button
12. The system must support HubSpot integration:
    - OAuth connection to HubSpot account
    - Pull contacts from HubSpot
    - Display list of contacts with "Research" button
13. The system must allow users to select which CRM contacts to research (batch select)
14. The system must show CRM sync status (last synced time, number of contacts)
15. The system must research CRM contacts one at a time (sequential processing)

### Lusha API Integration (FR-LUSHA)

**Company Research:**
16. The system must call Lusha Company API to retrieve:
    - Company name, domain, industry
    - Company size (employee count)
    - Revenue range
    - Location (HQ address, city, country)
    - Founded year
    - Company description
    - Technologies used (tech stack)
    - Social media profiles (LinkedIn, Twitter, Facebook)
    - Recent news/updates (if available)
17. The system must handle cases where company is not found in Lusha (show partial data or "Not Found")

**Individual/People Research:**
18. The system must call Lusha People API to retrieve:
    - Full name, job title, seniority level
    - Email addresses (personal, work)
    - Phone numbers (direct, mobile)
    - LinkedIn profile URL
    - Current company and tenure
    - Previous companies/roles (work history)
    - Education background
    - Location (city, country)
    - Social media profiles
19. The system must handle cases where individual is not found (show error message)
20. The system must prioritize work email over personal email in display

**Buying Signals:**
21. The system must identify and highlight buying signals:
    - Recent funding rounds (Series A/B/C, amount, date)
    - Executive/leadership changes (new hires in C-suite)
    - Company growth indicators (rapid hiring, expansion)
    - Recent news mentions (product launches, partnerships)
22. The system must display buying signals prominently with visual indicators (badges, icons)
23. The system must sort leads by signal strength (leads with more signals ranked higher)

### AI Persona Generation (FR-PERSONA)

24. The system must generate an AI-powered buyer persona using GPT-4 or Claude that includes:
    - **Role Summary**: 2-3 sentence overview of their role and responsibilities
    - **Likely Pain Points**: 3-5 challenges they face based on role, industry, company size
    - **Goals & Motivations**: What they're trying to achieve (career, business outcomes)
    - **Talk Tracks**: 2-3 suggested conversation angles tailored to their context
    - **Conversation Starters**: 3-4 specific questions or opening lines for outreach
    - **Buying Signals**: Highlighted signals with context (e.g., "Just raised $10M - likely investing in growth tools")
25. The system must use the following data as AI inputs:
    - Job title, seniority, industry, company size
    - User's selling style and target value prop (from onboarding profile)
    - Lusha company and individual data
    - Buying signals identified
26. The system must generate persona in under 10 seconds
27. The system must display persona in a structured, scannable format (not just a wall of text)
28. The system must allow users to regenerate persona with different tone or focus

### Data Storage (FR-STORAGE)

29. The system must create a `researched_leads` table with fields:
    - id (UUID, primary key)
    - user_id (foreign key to user_profiles)
    - research_method (enum: 'manual', 'csv', 'crm')
    - source (enum: 'lusha')
    - person_name, person_email, person_phone, person_linkedin
    - person_title, person_seniority, person_location
    - company_name, company_domain, company_industry
    - company_size, company_revenue, company_location
    - tech_stack (jsonb array)
    - work_history (jsonb array)
    - buying_signals (jsonb array)
    - ai_persona (jsonb with structured fields)
    - researched_at (timestamp)
    - last_viewed_at (timestamp)
30. The system must save all researched leads to this table
31. The system must update `last_viewed_at` when user views a lead
32. The system must prevent duplicate research (if same lead researched within 30 days, show cached data)

### Research Results Display (FR-DISPLAY)

**List View:**
33. The system must display researched leads in a list view with:
    - Person name and title
    - Company name and industry
    - Buying signal badges (if present)
    - Last researched date
    - "View Details" button/link
34. The system must allow sorting by: Most Recent, Company Name, Buying Signals
35. The system must allow filtering by: Industry, Company Size, Has Email, Has Buying Signal
36. The system must show empty state when no leads researched yet ("Let's find your first lead!")

**Detail View (Expandable):**
37. The system must show comprehensive prospect details:
    - **Contact Info Section**: Email, phone, LinkedIn (with copy buttons)
    - **Company Overview**: Name, industry, size, revenue, location, description
    - **Role & Background**: Title, seniority, work history, education
    - **Tech Stack**: List of technologies the company uses
    - **Buying Signals**: Highlighted with icons and context
    - **AI Persona**: Structured sections (role summary, pain points, goals, talk tracks, conversation starters)
38. The system must make the detail view mobile-friendly (single column, collapsible sections)
39. The system must include action buttons:
    - "Generate Outreach" (links to PRD #0005 feature when built)
    - "Add to Priority List" (links to PRD #0004 feature)
    - "Export as PDF" (optional, nice-to-have)
40. The system must allow users to collapse/expand sections to reduce clutter

### Performance & Error Handling (FR-PERF)

41. The system must complete research for one prospect in under 30 seconds
42. The system must show loading states during research ("Researching [Name]...")
43. The system must handle Lusha API errors:
    - Rate limit exceeded → show "Too many requests, try again in 1 minute"
    - Lead not found → show "We couldn't find data for this prospect"
    - API down → show "Research unavailable, please try again later"
44. The system must log all API errors for debugging
45. The system must retry failed API calls once before showing error

## 5. Non-Goals (Out of Scope)

The following are explicitly **not** included in this PRD:

- Parallel/bulk research (processing multiple leads simultaneously) - one at a time only in MVP
- Manual editing of research data (data is read-only from Lusha)
- Integrating additional data sources beyond Lusha (no ZoomInfo, Apollo, etc.)
- Email validation or phone number verification
- Real-time alerts for new buying signals
- Chrome extension for LinkedIn research
- Exporting researched leads to CRM
- Sharing researched leads with team members
- Custom persona templates or persona editing
- Lead scoring algorithm (covered in PRD #0004)

## 6. Design Considerations

### Visual Design

**List View:**
```
┌─────────────────────────────────────────┐
│ 🔍 Search or upload leads               │
├─────────────────────────────────────────┤
│ [Filters: Industry ▼ | Signals ▼]      │
├─────────────────────────────────────────┤
│ 📊 John Smith - VP of Sales             │
│    Acme Corp • SaaS • 500 employees     │
│    🎯 Recent funding  📈 Hiring         │
│    [View Details →]                     │
├─────────────────────────────────────────┤
│ 📊 Sarah Johnson - CTO                  │
│    TechCo • Technology • 200 employees  │
│    [View Details →]                     │
└─────────────────────────────────────────┘
```

**Detail View (Expanded):**
```
┌─────────────────────────────────────────┐
│ ← Back to List                          │
├─────────────────────────────────────────┤
│ 👤 John Smith                           │
│    VP of Sales at Acme Corp             │
│                                         │
│ 📞 Contact Info                         │
│    ✉️ john.smith@acme.com [Copy]       │
│    📱 +1-555-0123 [Copy]                │
│    🔗 LinkedIn [Open]                   │
│                                         │
│ 🏢 Company Overview                     │
│    Acme Corp • SaaS • 500 employees     │
│    $50M-$100M revenue • San Francisco   │
│                                         │
│ 🎯 Buying Signals                       │
│    💰 Raised $20M Series B (2 mo ago)   │
│    📈 Hiring 15+ sales roles            │
│                                         │
│ 🤖 AI Persona                           │
│    [Role Summary]                       │
│    [Pain Points]                        │
│    [Talk Tracks]                        │
│    [Conversation Starters]              │
│                                         │
│ [Generate Outreach] [Add to Priorities] │
└─────────────────────────────────────────┘
```

### UX Flow
1. User enters prospect name or uploads CSV
2. System shows loading state ("Researching...")
3. Results appear in list view
4. User clicks "View Details" to see full research
5. User can generate outreach or add to priorities from detail view

### Mobile Optimization
- Single-column layout
- Swipeable cards for list view
- Collapsible sections in detail view
- Large touch targets for "Copy" buttons
- Bottom sheet or modal for detail view on mobile

## 7. Technical Considerations

### Lusha API
- **Authentication**: API key in environment variable `LUSHA_API_KEY`
- **Endpoints**:
  - `/person/search` - Find people by name, company, email, LinkedIn
  - `/company/search` - Find company by name or domain
  - `/person/enrich` - Get full contact details
  - `/company/enrich` - Get full company details
- **Rate Limits**: Monitor usage, implement exponential backoff if rate limited
- **Cost**: Track API credits consumed per research (log for analytics)

### AI Persona Generation
- **Model**: GPT-4 or Claude Sonnet 3.5
- **Prompt Template**:
```
You are a sales intelligence assistant. Generate a buyer persona for:
- Name: {person_name}
- Title: {person_title}
- Company: {company_name}
- Industry: {industry}
- Company Size: {company_size}

User's selling context:
- Selling style: {user_selling_style}
- Target value prop: {user_value_prop}

Include:
1. Role Summary (2-3 sentences)
2. Likely Pain Points (3-5 bullets)
3. Goals & Motivations (2-3 bullets)
4. Talk Tracks (2-3 angles)
5. Conversation Starters (3-4 questions/openers)
6. Buying Signal Context (if signals present: {buying_signals})

Format as structured JSON.
```
- **Caching**: Cache AI personas for 30 days to reduce API costs
- **Error Handling**: If AI fails, show Lusha data without persona layer

### CRM Integrations
- **Salesforce**: Use OAuth 2.0, REST API to fetch Contacts and Leads
- **HubSpot**: Use OAuth 2.0, Contacts API
- **Storage**: Save CRM connection tokens in `crm_accounts` table (encrypted)
- **Sync**: Manual sync initially (user clicks "Sync CRM"), auto-sync post-MVP

### Database Schema

**researched_leads table:**
```sql
CREATE TABLE researched_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  research_method TEXT CHECK (research_method IN ('manual', 'csv', 'crm')),
  source TEXT DEFAULT 'lusha',

  -- Person data
  person_name TEXT,
  person_email TEXT,
  person_phone TEXT,
  person_linkedin TEXT,
  person_title TEXT,
  person_seniority TEXT,
  person_location TEXT,

  -- Company data
  company_name TEXT,
  company_domain TEXT,
  company_industry TEXT,
  company_size TEXT,
  company_revenue TEXT,
  company_location TEXT,
  company_description TEXT,

  -- Rich data (JSONB)
  tech_stack JSONB DEFAULT '[]',
  work_history JSONB DEFAULT '[]',
  buying_signals JSONB DEFAULT '[]',
  ai_persona JSONB,

  -- Metadata
  researched_at TIMESTAMP DEFAULT NOW(),
  last_viewed_at TIMESTAMP,

  -- Indexes
  INDEX idx_user_researched (user_id, researched_at DESC),
  INDEX idx_company (company_name),
  INDEX idx_person (person_name)
);
```

### Performance Optimization
- Use server-side rendering for list view (Next.js SSR)
- Paginate list view (show 20 leads per page)
- Lazy load detail view data when expanded
- Cache Lusha responses for 30 days to avoid duplicate API calls

## 8. Success Metrics

**Functional Success:**
1. ✅ User can research a prospect via manual entry and see results in <30s
2. ✅ User can upload CSV and all valid leads are researched
3. ✅ User can connect Salesforce/HubSpot and research CRM contacts
4. ✅ AI persona is generated with all required fields
5. ✅ Buying signals are correctly identified and displayed
6. ✅ Researched leads are saved and viewable in list

**Business Success:**
- 80%+ of users research at least 5 prospects in first week
- Average research time per prospect <30s
- User satisfaction with persona quality >4/5 stars
- 50%+ of researched leads lead to outreach generation (measured in PRD #0005)

**Technical Success:**
- Lusha API success rate >95%
- AI persona generation success rate >98%
- Page load time <2s for list view
- Zero data loss (all researched leads correctly saved)

## 9. Open Questions

1. **Lusha Plan**: What's our Lusha subscription tier and monthly credit limit? Should we cap research per user?
2. **Duplicate Prevention**: If user researches same lead twice, should we charge Lusha credits again or show cached data?
3. **CRM Priority**: Should we launch with both Salesforce AND HubSpot, or prioritize one for MVP?
4. **AI Model Choice**: GPT-4 (more expensive, better quality) vs GPT-4o-mini (cheaper, faster) for personas?
5. **Buying Signals Source**: Does Lusha provide funding/hiring data, or do we need a separate data source?
6. **Export Format**: If we add "Export as PDF", what should the format look like?
7. **Lead Limit**: Should we limit number of researched leads per user (e.g., 100/month) to control costs?
8. **Privacy**: Do we need consent checkboxes for storing contact data (GDPR/privacy compliance)?

---

## Next Steps After Implementation

Once buyer research is complete:
1. Researched leads will populate PRD #0004: Lead Prioritization
2. Researched leads + AI personas will feed PRD #0005: Outreach Generation
3. Research activity will be tracked in PRD #0007: Light Gamification
4. Consider adding more data sources (ZoomInfo, Apollo) post-MVP
