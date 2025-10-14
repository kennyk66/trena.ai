# Task List: PRD #0002 - Onboarding & Profile Learning

## Relevant Files

### Database & Migrations
- `trena-app/supabase-schema-onboarding.sql` - SQL migration for onboarding tables
- `trena-app/types/database.ts` - Update with new user profile fields
- `trena-app/types/onboarding.ts` - Onboarding-specific TypeScript types

### API & Services
- `trena-app/.env.local` - Add LUSHA_API_KEY
- `trena-app/lib/lusha/client.ts` - Lusha API client
- `trena-app/lib/onboarding/onboarding-service.ts` - Onboarding logic and data persistence
- `trena-app/app/api/leads/generate/route.ts` - API route for lead generation

### Onboarding Pages & Components
- `trena-app/app/(onboarding)/layout.tsx` - Onboarding layout with progress bar
- `trena-app/app/(onboarding)/welcome/page.tsx` - Step 1: Welcome screen
- `trena-app/app/(onboarding)/personal/page.tsx` - Step 2: Personal & Role setup
- `trena-app/app/(onboarding)/motivators/page.tsx` - Step 3: Motivators & Selling Style
- `trena-app/app/(onboarding)/target-buyer/page.tsx` - Step 4: Target Buyer
- `trena-app/app/(onboarding)/connect-tools/page.tsx` - Step 5: Connect Tools (placeholder)
- `trena-app/app/(onboarding)/summary/page.tsx` - Step 6: AI Training Summary
- `trena-app/app/(onboarding)/quick-win/page.tsx` - Step 7: Quick Win leads
- `trena-app/components/onboarding/progress-bar.tsx` - Progress indicator component
- `trena-app/components/onboarding/onboarding-nav.tsx` - Back/Next navigation
- `trena-app/components/onboarding/lead-card.tsx` - Lead display card
- `trena-app/components/onboarding/multi-select.tsx` - Multi-select component for checkboxes

### Updated Files
- `trena-app/app/(auth)/signup/page.tsx` - Redirect to onboarding after signup
- `trena-app/app/(dashboard)/layout.tsx` - Check onboarding completion, redirect if needed
- `trena-app/app/(dashboard)/home/page.tsx` - Show personalized data from profile

### Utilities & Hooks
- `trena-app/lib/hooks/use-onboarding.ts` - React hook for onboarding state
- `trena-app/lib/constants/onboarding-options.ts` - Dropdown/multi-select options

### Notes
- Install shadcn/ui components: `npx shadcn@latest add checkbox select progress`
- Lusha API documentation: https://www.lusha.com/docs/api/
- Use React Hook Form for form state management
- JSONB fields in Postgres for arrays (motivators, industries, roles)

## Tasks

- [ ] 1.0 Database Schema Updates & API Setup
  - [ ] 1.1 Create `supabase-schema-onboarding.sql` with ALTER TABLE for user_profiles (add: name, job_title, company_name, sales_quota, experience_level, motivators JSONB, selling_style, target_industries JSONB, target_roles JSONB, target_region, sales_motion, onboarding_completed BOOLEAN, onboarding_completed_at TIMESTAMPTZ)
  - [ ] 1.2 Create `quick_win_leads` table in SQL migration (id UUID PK, user_id UUID FK, lead_name TEXT, job_title TEXT, company_name TEXT, email TEXT, phone TEXT, linkedin_url TEXT, company_size TEXT, industry TEXT, source TEXT, created_at TIMESTAMPTZ)
  - [ ] 1.3 Create placeholder tables: `api_credentials`, `email_accounts`, `crm_accounts` (basic structure only, not fully implemented)
  - [ ] 1.4 Run SQL migration in Supabase SQL Editor to update schema
  - [ ] 1.5 Update `types/database.ts` with new UserProfile interface including all onboarding fields
  - [ ] 1.6 Create `types/onboarding.ts` with types for OnboardingStep, OnboardingData, LeadData, FormData for each step
  - [ ] 1.7 Add `LUSHA_API_KEY` to `.env.local` (placeholder value for now)
  - [ ] 1.8 Create `lib/lusha/client.ts` with Lusha API client functions: searchPeople(), enrichLead()
  - [ ] 1.9 Test Lusha API connection with a simple test call (if key is available)

- [ ] 2.0 Onboarding Flow Infrastructure
  - [ ] 2.1 Install required shadcn components: `npx shadcn@latest add checkbox select progress textarea`
  - [ ] 2.2 Create `lib/constants/onboarding-options.ts` with all dropdown options (experience levels, industries, roles, regions, sales motions, motivators, selling styles)
  - [ ] 2.3 Create `lib/onboarding/onboarding-service.ts` with functions: saveOnboardingStep(), getOnboardingProgress(), markOnboardingComplete(), getOnboardingData()
  - [ ] 2.4 Create `lib/hooks/use-onboarding.ts` - custom hook for managing onboarding state and navigation
  - [ ] 2.5 Create `app/(onboarding)/layout.tsx` - layout with progress bar, no sidebar, centered content
  - [ ] 2.6 Create `components/onboarding/progress-bar.tsx` - visual progress indicator showing "Step X of 7"
  - [ ] 2.7 Create `components/onboarding/onboarding-nav.tsx` - reusable Back/Next button component with loading states
  - [ ] 2.8 Create `components/onboarding/multi-select.tsx` - reusable checkbox group component
  - [ ] 2.9 Test navigation infrastructure: ensure layout renders correctly, progress bar updates

- [ ] 3.0 Onboarding Steps 1-3 (Welcome, Personal, Motivators)
  - [ ] 3.1 Create `app/(onboarding)/welcome/page.tsx` - Step 1 welcome screen with Trena branding, intro text, "Get Started" button
  - [ ] 3.2 Style welcome screen: hero section, engaging copy, mobile-friendly
  - [ ] 3.3 Create `app/(onboarding)/personal/page.tsx` - Step 2 with form for name, job_title, company_name, sales_quota, experience_level (dropdown)
  - [ ] 3.4 Add form validation to personal step: all fields required, helpful error messages
  - [ ] 3.5 Implement save functionality: call saveOnboardingStep() on Next button click
  - [ ] 3.6 Create `app/(onboarding)/motivators/page.tsx` - Step 3 with multi-select for motivators and radio buttons for selling_style
  - [ ] 3.7 Add motivators options: "Hitting quota/bonus", "Getting promoted", "Proving myself", "Building my career", "Financial security", "Recognition/respect", "Other (free text)"
  - [ ] 3.8 Add selling style options: "Formal and professional", "Casual and friendly", "Direct and concise", "Consultative and educational", "Enthusiastic and energetic"
  - [ ] 3.9 Implement save functionality for motivators step
  - [ ] 3.10 Test Steps 1-3: complete flow from welcome to motivators, verify data saves correctly to database
  - [ ] 3.11 Test back navigation: ensure users can go back and edit previous steps
  - [ ] 3.12 Test form validation: try submitting with empty fields, verify error messages

- [ ] 4.0 Onboarding Steps 4-5 (Target Buyer, Connect Tools)
  - [ ] 4.1 Create `app/(onboarding)/target-buyer/page.tsx` - Step 4 with multi-selects for industries, roles, and dropdowns for region and sales_motion
  - [ ] 4.2 Add industry options: "Technology/SaaS", "Healthcare", "Financial Services", "Retail/E-commerce", "Manufacturing", "Professional Services", "Education", "Real Estate", "Other (free text)"
  - [ ] 4.3 Add role options: "CEO", "CTO", "VP Sales", "VP Marketing", "Director of Operations", "CFO", "Head of HR", "Other (free text)"
  - [ ] 4.4 Add region options: "North America", "Europe", "Asia-Pacific", "Latin America", "Global/Multiple regions"
  - [ ] 4.5 Add sales motion options: "Outbound prospecting", "Inbound lead follow-up", "Account-based (ABM)", "Mix of outbound and inbound"
  - [ ] 4.6 Implement save functionality for target-buyer step
  - [ ] 4.7 Create `app/(onboarding)/connect-tools/page.tsx` - Step 5 with placeholder UI for Email, CRM, LinkedIn integrations
  - [ ] 4.8 Add "Connect" buttons for each integration with "Coming Soon" tooltips or modals
  - [ ] 4.9 Add "Skip for now" / "Continue" button to proceed without connecting
  - [ ] 4.10 Test Steps 4-5: complete target-buyer and connect-tools, verify data persistence
  - [ ] 4.11 Test multi-select functionality: select/deselect multiple items, verify state updates
  - [ ] 4.12 Test "Other" free text inputs: add custom industry/role, verify saves correctly

- [ ] 5.0 Onboarding Step 6 (AI Training Summary)
  - [ ] 5.1 Create `app/(onboarding)/summary/page.tsx` - Step 6 displaying all collected data in organized sections
  - [ ] 5.2 Fetch all onboarding data from database using getOnboardingData()
  - [ ] 5.3 Display Personal section: name, title, company, quota, experience
  - [ ] 5.4 Display Motivators section: selected motivators and selling style
  - [ ] 5.5 Display Target Buyer section: industries, roles, region, sales motion
  - [ ] 5.6 Add "Edit" button next to each section that navigates back to relevant step
  - [ ] 5.7 Add encouraging messaging: "Your AI sales assistant is learning your style!"
  - [ ] 5.8 Add "Looks Good" or "Confirm & Continue" button to proceed to Quick Win
  - [ ] 5.9 Style summary page: clean cards, good spacing, readable typography
  - [ ] 5.10 Test summary page: verify all data displays correctly
  - [ ] 5.11 Test edit functionality: click Edit button, navigate to step, make changes, return to summary
  - [ ] 5.12 Test mobile responsiveness: ensure summary is readable and editable on mobile

- [ ] 6.0 Onboarding Step 7 & Lusha Integration (Quick Win)
  - [ ] 6.1 Create `app/api/leads/generate/route.ts` - API route that calls Lusha API
  - [ ] 6.2 Implement Lusha API integration: map user profile (industries, roles, region) to Lusha search parameters
  - [ ] 6.3 Implement error handling: if Lusha fails, show friendly message or fallback mock data
  - [ ] 6.4 Implement lead enrichment: call Lusha API to get 3 leads with name, title, company, email, phone, LinkedIn, company size
  - [ ] 6.5 Save leads to `quick_win_leads` table after successful API call
  - [ ] 6.6 Create `components/onboarding/lead-card.tsx` - component to display individual lead with enriched data
  - [ ] 6.7 Create `app/(onboarding)/quick-win/page.tsx` - Step 7 displaying 3 lead cards with "🎉 Your First Leads!" messaging
  - [ ] 6.8 Add loading state while fetching leads from API
  - [ ] 6.9 Add "Start Using Trena" button that marks onboarding complete and redirects to dashboard
  - [ ] 6.10 Style lead cards: professional, clear hierarchy, mobile-friendly
  - [ ] 6.11 Test Lusha API: verify leads are fetched and enriched correctly (if API key available)
  - [ ] 6.12 Test error handling: simulate API failure, verify graceful error message displays
  - [ ] 6.13 Test lead display: verify all lead data (name, title, company, email, phone, LinkedIn) renders correctly

- [ ] 7.0 Onboarding Flow Completion & Testing
  - [ ] 7.1 Update `app/(auth)/signup/page.tsx` (or signup form): redirect to /onboarding/welcome after successful signup instead of /home
  - [ ] 7.2 Update `app/(dashboard)/layout.tsx`: check if onboarding_completed is false, redirect to /onboarding/welcome if not complete
  - [ ] 7.3 Implement markOnboardingComplete() in onboarding-service.ts: set onboarding_completed = true, onboarding_completed_at = NOW()
  - [ ] 7.4 Update "Start Using Trena" button in quick-win page: call markOnboardingComplete() then redirect to /home
  - [ ] 7.5 Update `app/(dashboard)/home/page.tsx`: display personalized welcome using user profile data (name, selling style, motivators)
  - [ ] 7.6 Test full onboarding flow: signup → welcome → all steps → quick win → dashboard
  - [ ] 7.7 Test progress persistence: close browser mid-onboarding, reopen, verify resumes at correct step
  - [ ] 7.8 Test completion gating: try accessing /home before onboarding complete, verify redirects to onboarding
  - [ ] 7.9 Test data integrity: complete onboarding, check database to verify all fields populated correctly
  - [ ] 7.10 Test mobile experience: complete onboarding on mobile viewport, verify all steps are usable
  - [ ] 7.11 Test edge cases: try invalid inputs, try skipping required fields, verify validation works
  - [ ] 7.12 Run production build: `npm run build`, verify no errors
  - [ ] 7.13 Test performance: measure time to complete onboarding, aim for <5 minutes
  - [ ] 7.14 Review user experience: ensure conversational tone, clear instructions, encouraging messaging throughout
