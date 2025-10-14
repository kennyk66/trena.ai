# Task List: PRD #0003 - Buyer Research Agent

## Relevant Files

### Database & Migrations
- `trena-app/supabase-schema-research.sql` - SQL migration for research tables
- `trena-app/types/research.ts` - Research-specific TypeScript types
- `trena-app/types/database.ts` - Update with researched_leads types

### API & Services
- `trena-app/.env.local` - Add OPENAI_API_KEY or ANTHROPIC_API_KEY for AI personas
- `trena-app/lib/lusha/client.ts` - Extend with company search, enrichment, buying signals
- `trena-app/lib/ai/persona-generator.ts` - AI persona generation service
- `trena-app/lib/research/research-service.ts` - Core research logic and orchestration
- `trena-app/lib/crm/salesforce-client.ts` - Salesforce OAuth and API client
- `trena-app/lib/crm/hubspot-client.ts` - HubSpot OAuth and API client
- `trena-app/lib/utils/csv-parser.ts` - CSV upload and parsing utility

### API Routes
- `trena-app/app/api/research/manual/route.ts` - Manual search endpoint
- `trena-app/app/api/research/csv/route.ts` - CSV upload endpoint
- `trena-app/app/api/research/leads/route.ts` - GET researched leads list
- `trena-app/app/api/research/[id]/route.ts` - GET single lead detail
- `trena-app/app/api/research/[id]/regenerate-persona/route.ts` - Regenerate AI persona
- `trena-app/app/api/crm/salesforce/auth/route.ts` - Salesforce OAuth callback
- `trena-app/app/api/crm/salesforce/contacts/route.ts` - Fetch Salesforce contacts
- `trena-app/app/api/crm/hubspot/auth/route.ts` - HubSpot OAuth callback
- `trena-app/app/api/crm/hubspot/contacts/route.ts` - Fetch HubSpot contacts

### Research Pages & Components
- `trena-app/app/(dashboard)/research/page.tsx` - Main research page with tabs for Manual/CSV/CRM
- `trena-app/app/(dashboard)/research/leads/page.tsx` - Researched leads list view
- `trena-app/app/(dashboard)/research/leads/[id]/page.tsx` - Lead detail view
- `trena-app/components/research/search-form.tsx` - Manual search form component
- `trena-app/components/research/csv-upload.tsx` - CSV upload component
- `trena-app/components/research/crm-connect.tsx` - CRM connection component
- `trena-app/components/research/lead-list-item.tsx` - Lead card for list view
- `trena-app/components/research/lead-detail.tsx` - Expanded lead detail component
- `trena-app/components/research/ai-persona.tsx` - AI persona display component
- `trena-app/components/research/buying-signals.tsx` - Buying signals badge component
- `trena-app/components/research/contact-info.tsx` - Contact info section with copy buttons
- `trena-app/components/research/filters.tsx` - Filters and sorting component

### Utilities & Hooks
- `trena-app/lib/hooks/use-research.ts` - React hook for research state
- `trena-app/lib/constants/research-options.ts` - Filter options, sort options
- `trena-app/lib/utils/clipboard.ts` - Copy-to-clipboard utility

### Notes
- Install shadcn/ui components: `npx shadcn@latest add tabs file-input alert dialog collapsible`
- Lusha API documentation: https://www.lusha.com/docs/api/
- OpenAI API for persona generation (GPT-4) or Anthropic Claude
- Salesforce REST API docs: https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/
- HubSpot API docs: https://developers.hubspot.com/docs/api/overview

## Tasks

- [ ] 1.0 Database Schema & Type Definitions
  - [ ] 1.1 Create `supabase-schema-research.sql` with `researched_leads` table (id UUID PK, user_id UUID FK, research_method TEXT, source TEXT DEFAULT 'lusha')
  - [ ] 1.2 Add person fields to schema: person_name, person_email, person_phone, person_linkedin, person_title, person_seniority, person_location
  - [ ] 1.3 Add company fields to schema: company_name, company_domain, company_industry, company_size, company_revenue, company_location, company_description
  - [ ] 1.4 Add JSONB fields: tech_stack, work_history, buying_signals, ai_persona
  - [ ] 1.5 Add metadata fields: researched_at TIMESTAMPTZ DEFAULT NOW(), last_viewed_at TIMESTAMPTZ
  - [ ] 1.6 Add indexes: idx_user_researched (user_id, researched_at DESC), idx_company (company_name), idx_person (person_name)
  - [ ] 1.7 Add RLS policies: users can only view/insert their own researched_leads
  - [ ] 1.8 Run SQL migration in Supabase SQL Editor
  - [ ] 1.9 Create `types/research.ts` with interfaces: ResearchedLead, BuyingSignal, AIPersona, WorkHistory, TechStack
  - [ ] 1.10 Update `types/database.ts` with ResearchedLead database types
  - [ ] 1.11 Test schema: manually insert a test lead, verify RLS policies work correctly

- [ ] 2.0 Lusha API Enhancement & AI Persona Generation
  - [ ] 2.1 Extend `lib/lusha/client.ts` with companySearch() function for company lookup
  - [ ] 2.2 Extend `lib/lusha/client.ts` with personEnrich() function for detailed person data
  - [ ] 2.3 Extend `lib/lusha/client.ts` with companyEnrich() function for company details, tech stack
  - [ ] 2.4 Add buying signals extraction logic: parse funding, hiring, news from Lusha response
  - [ ] 2.5 Add environment variable OPENAI_API_KEY or ANTHROPIC_API_KEY to `.env.local`
  - [ ] 2.6 Create `lib/ai/persona-generator.ts` with generatePersona() function
  - [ ] 2.7 Design AI prompt template with inputs: person_name, title, company, industry, size, user selling style
  - [ ] 2.8 Implement AI persona generation with structured JSON output (role_summary, pain_points, goals, talk_tracks, conversation_starters)
  - [ ] 2.9 Add error handling: if AI fails, return null persona (show Lusha data only)
  - [ ] 2.10 Add caching logic: check if lead researched in last 30 days, return cached data to save API costs
  - [ ] 2.11 Test Lusha API extensions: call companySearch(), personEnrich(), verify data structure
  - [ ] 2.12 Test AI persona generation: generate persona for sample lead, verify JSON structure and quality

- [ ] 3.0 Core Research Service & Manual Search
  - [ ] 3.1 Create `lib/research/research-service.ts` with researchLead() function (orchestrates Lusha + AI + save)
  - [ ] 3.2 Implement researchLead() logic: call Lusha API → extract buying signals → generate AI persona → save to database
  - [ ] 3.3 Implement duplicate prevention: check if lead researched in last 30 days, return cached if exists
  - [ ] 3.4 Add performance tracking: log time taken for each research operation
  - [ ] 3.5 Create `app/api/research/manual/route.ts` - POST endpoint for manual search
  - [ ] 3.6 Implement manual search: accept person_name, company_name, email, linkedin_url as inputs
  - [ ] 3.7 Add validation: require at least one of company_name OR person_name
  - [ ] 3.8 Create `components/research/search-form.tsx` - form with inputs for person name, company name, email, LinkedIn URL
  - [ ] 3.9 Add auto-suggest for company names (if Lusha supports autocomplete API)
  - [ ] 3.10 Add loading state: "Researching [Name]..." with progress indicator
  - [ ] 3.11 Create `app/(dashboard)/research/page.tsx` - main research page with tabs (Manual, CSV, CRM)
  - [ ] 3.12 Implement Manual tab: render SearchForm component, handle submission, show results
  - [ ] 3.13 Test manual search: search for test person/company, verify lead is researched and saved
  - [ ] 3.14 Test error handling: search for non-existent lead, verify friendly error message
  - [ ] 3.15 Test duplicate prevention: research same lead twice, verify cached data returned

- [ ] 4.0 CSV Upload Functionality
  - [ ] 4.1 Install shadcn file-input component: `npx shadcn@latest add file-input`
  - [ ] 4.2 Create `lib/utils/csv-parser.ts` with parseCSV() function to parse CSV files
  - [ ] 4.3 Implement CSV column mapping: detect columns (first_name, last_name, company_name, email, job_title, linkedin_url)
  - [ ] 4.4 Add CSV validation: check required columns present, validate data format
  - [ ] 4.5 Create `components/research/csv-upload.tsx` - drag-and-drop CSV upload component
  - [ ] 4.6 Add CSV preview: show first 5 rows after upload, allow user to confirm before processing
  - [ ] 4.7 Create `app/api/research/csv/route.ts` - POST endpoint for CSV upload
  - [ ] 4.8 Implement CSV processing: parse CSV → validate → research each lead sequentially → save to database
  - [ ] 4.9 Add progress tracking: return progress updates ("Processing 5 of 20 leads...")
  - [ ] 4.10 Add error handling: log failed leads, return summary ("18 succeeded, 2 failed")
  - [ ] 4.11 Implement CSV tab in research page: render CsvUpload component
  - [ ] 4.12 Test CSV upload: upload test CSV with 5 leads, verify all researched and saved
  - [ ] 4.13 Test error handling: upload CSV with invalid data, verify errors displayed gracefully
  - [ ] 4.14 Test large CSV: upload 50+ leads, verify progress updates work correctly

- [ ] 5.0 CRM Integrations (Salesforce & HubSpot)
  - [ ] 5.1 Create `lib/crm/salesforce-client.ts` with Salesforce OAuth functions
  - [ ] 5.2 Implement Salesforce OAuth flow: getAuthUrl(), handleCallback(), refreshToken()
  - [ ] 5.3 Create `app/api/crm/salesforce/auth/route.ts` - OAuth callback handler
  - [ ] 5.4 Implement Salesforce Contacts API: fetchContacts(), fetchLeads()
  - [ ] 5.5 Create `lib/crm/hubspot-client.ts` with HubSpot OAuth functions
  - [ ] 5.6 Implement HubSpot OAuth flow: getAuthUrl(), handleCallback(), refreshToken()
  - [ ] 5.7 Create `app/api/crm/hubspot/auth/route.ts` - OAuth callback handler
  - [ ] 5.8 Implement HubSpot Contacts API: fetchContacts()
  - [ ] 5.9 Update `crm_accounts` table schema: add fields for access_token (encrypted), refresh_token, expires_at, crm_type
  - [ ] 5.10 Create `app/api/crm/salesforce/contacts/route.ts` - GET endpoint to fetch Salesforce contacts
  - [ ] 5.11 Create `app/api/crm/hubspot/contacts/route.ts` - GET endpoint to fetch HubSpot contacts
  - [ ] 5.12 Create `components/research/crm-connect.tsx` - CRM connection UI with "Connect Salesforce" and "Connect HubSpot" buttons
  - [ ] 5.13 Implement CRM connection flow: click Connect → OAuth redirect → callback → save tokens → show success
  - [ ] 5.14 Display CRM contacts list: show contacts from connected CRM with "Research" button next to each
  - [ ] 5.15 Implement batch research: allow user to select multiple contacts, research all sequentially
  - [ ] 5.16 Test Salesforce OAuth: connect Salesforce account, fetch contacts, verify data displays
  - [ ] 5.17 Test HubSpot OAuth: connect HubSpot account, fetch contacts, verify data displays
  - [ ] 5.18 Test CRM research: select contact from CRM, research it, verify lead saved with research_method='crm'

- [ ] 6.0 Researched Leads List View
  - [ ] 6.1 Create `app/api/research/leads/route.ts` - GET endpoint to fetch user's researched leads
  - [ ] 6.2 Implement pagination: support limit and offset query parameters (20 leads per page)
  - [ ] 6.3 Implement sorting: support sort by researched_at DESC, company_name ASC, buying_signals DESC
  - [ ] 6.4 Implement filtering: support filters for industry, company_size, has_email, has_buying_signals
  - [ ] 6.5 Create `components/research/filters.tsx` - filter and sort controls component
  - [ ] 6.6 Create `components/research/lead-list-item.tsx` - lead card component for list view
  - [ ] 6.7 Display in lead card: person name, title, company name, industry, buying signal badges, "View Details" button
  - [ ] 6.8 Create `components/research/buying-signals.tsx` - badge component for signals (funding, hiring, growth)
  - [ ] 6.9 Create `app/(dashboard)/research/leads/page.tsx` - list view page
  - [ ] 6.10 Implement list view: fetch leads → render LeadListItem for each → show pagination controls
  - [ ] 6.11 Implement empty state: if no leads, show "Let's find your first lead!" with link to research page
  - [ ] 6.12 Add search bar: filter leads by name or company name (client-side or server-side)
  - [ ] 6.13 Style list view: clean cards, good spacing, mobile-responsive grid/list layout
  - [ ] 6.14 Test list view: research 10+ leads, verify all display correctly in list
  - [ ] 6.15 Test pagination: create 30+ leads, verify pagination works
  - [ ] 6.16 Test filters: apply industry filter, verify only matching leads shown
  - [ ] 6.17 Test sorting: sort by buying signals, verify leads with signals appear first

- [ ] 7.0 Lead Detail View & AI Persona Display
  - [ ] 7.1 Create `app/api/research/[id]/route.ts` - GET endpoint to fetch single lead by ID
  - [ ] 7.2 Implement last_viewed_at update: update timestamp when lead is viewed
  - [ ] 7.3 Create `components/research/contact-info.tsx` - contact section with email, phone, LinkedIn, copy buttons
  - [ ] 7.4 Implement copy-to-clipboard: add "Copy" button next to email and phone
  - [ ] 7.5 Create `components/research/ai-persona.tsx` - AI persona display component
  - [ ] 7.6 Structure persona display: role summary, pain points (bullets), goals (bullets), talk tracks, conversation starters
  - [ ] 7.7 Create `components/research/lead-detail.tsx` - comprehensive detail view component
  - [ ] 7.8 Implement detail sections: Contact Info, Company Overview, Role & Background, Tech Stack, Buying Signals, AI Persona
  - [ ] 7.9 Add collapsible sections: allow users to collapse/expand each section
  - [ ] 7.10 Create `app/(dashboard)/research/leads/[id]/page.tsx` - detail page
  - [ ] 7.11 Add action buttons: "Generate Outreach" (placeholder), "Add to Priorities" (placeholder), "Export PDF" (optional)
  - [ ] 7.12 Add "Regenerate Persona" button: allow user to regenerate AI persona with different tone
  - [ ] 7.13 Create `app/api/research/[id]/regenerate-persona/route.ts` - POST endpoint to regenerate persona
  - [ ] 7.14 Style detail view: professional, clean sections, mobile-friendly single-column layout
  - [ ] 7.15 Test detail view: open researched lead, verify all data displays correctly
  - [ ] 7.16 Test copy buttons: click copy email, verify copied to clipboard
  - [ ] 7.17 Test collapsible sections: collapse/expand sections, verify state persists during session
  - [ ] 7.18 Test regenerate persona: click regenerate, verify new persona generated and displayed

- [ ] 8.0 Performance, Error Handling & Polish
  - [ ] 8.1 Implement loading states: add spinners/skeletons for all async operations (research, list view, detail view)
  - [ ] 8.2 Implement error boundaries: catch and display errors gracefully
  - [ ] 8.3 Add toast notifications: success ("Lead researched!"), error ("Research failed, try again")
  - [ ] 8.4 Optimize Lusha API calls: implement request debouncing, retry with exponential backoff
  - [ ] 8.5 Implement rate limit handling: if Lusha rate limited, show "Too many requests, try again in 1 minute"
  - [ ] 8.6 Add API error logging: log all Lusha and AI API errors to console/monitoring service
  - [ ] 8.7 Optimize database queries: add database indexes for common queries
  - [ ] 8.8 Implement server-side rendering for list view: use Next.js SSR for faster initial load
  - [ ] 8.9 Add meta tags: set page titles, descriptions for SEO
  - [ ] 8.10 Test mobile responsiveness: complete all flows on mobile viewport, verify usability
  - [ ] 8.11 Test error scenarios: simulate Lusha API failure, verify error messages display
  - [ ] 8.12 Test performance: measure research time, ensure <30s per lead
  - [ ] 8.13 Test with 100+ leads: create large dataset, verify list view performance
  - [ ] 8.14 Run production build: `npm run build`, verify no errors

- [ ] 9.0 Integration Testing & Documentation
  - [ ] 9.1 Test full manual search flow: search → view list → view detail → copy contact info
  - [ ] 9.2 Test full CSV upload flow: upload CSV → view progress → view researched leads
  - [ ] 9.3 Test full CRM flow: connect CRM → fetch contacts → research → view leads
  - [ ] 9.4 Test duplicate prevention: research same lead multiple times, verify cached data used
  - [ ] 9.5 Test persona quality: review 10+ generated personas, verify they are relevant and useful
  - [ ] 9.6 Test cross-browser: verify works on Chrome, Firefox, Safari, Edge
  - [ ] 9.7 Test navigation: research → leads list → detail → back to list → research new lead
  - [ ] 9.8 Update CHANGELOG.md: document all PRD #0003 deliverables
  - [ ] 9.9 Update README.md: add research features, API setup instructions, new environment variables
  - [ ] 9.10 Update COMPLETION_STATUS.md: mark PRD #0003 tasks complete
  - [ ] 9.11 Create SESSION_SUMMARY.md for PRD #0003 session
  - [ ] 9.12 Review code quality: ensure TypeScript types valid, no ESLint errors
  - [ ] 9.13 Review UI/UX: ensure consistent design, clear user flows, helpful error messages
  - [ ] 9.14 Final production build test: `npm run build && npm run start`, verify all features work in production mode

## Estimated Complexity

**Total Estimated Time:** 80-100 hours

**Breakdown:**
- Database & Types: 4-6 hours
- Lusha API & AI Persona: 12-16 hours
- Manual Search: 8-10 hours
- CSV Upload: 10-12 hours
- CRM Integrations: 20-24 hours (complex OAuth flows)
- List View: 8-10 hours
- Detail View & Persona Display: 12-15 hours
- Performance & Error Handling: 6-8 hours
- Testing & Documentation: 8-10 hours

**Challenges:**
- Salesforce/HubSpot OAuth flows are complex and require testing with real accounts
- AI persona quality depends on prompt engineering and testing
- Handling Lusha API rate limits and errors gracefully
- Ensuring <30s research time requires optimization
- CSV upload with progress tracking needs careful implementation
