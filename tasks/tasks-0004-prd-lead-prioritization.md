# Task List: PRD #0004 - Lead Prioritization

## Relevant Files

### Database & Migrations
- `trena-app/supabase-schema-prioritization.sql` - SQL migration for priority tables
- `trena-app/types/priority.ts` - Priority-specific TypeScript types
- `trena-app/types/database.ts` - Update with priority types

### Services & Logic
- `trena-app/lib/priority/scoring-service.ts` - Priority scoring algorithm
- `trena-app/lib/priority/focus-service.ts` - Today's Focus generation logic
- `trena-app/lib/priority/rescoring-service.ts` - Daily re-scoring logic

### API Routes
- `trena-app/app/api/priority/calculate/route.ts` - Calculate priority for leads
- `trena-app/app/api/priority/focus/route.ts` - Get today's focus list
- `trena-app/app/api/priority/actions/route.ts` - Track lead actions (contacted, etc.)

### UI Components
- `trena-app/components/priority/priority-badge.tsx` - Priority level badge (high/med/low)
- `trena-app/components/priority/priority-breakdown.tsx` - Score breakdown display
- `trena-app/components/priority/focus-card.tsx` - Focus lead card
- `trena-app/components/priority/empty-focus.tsx` - Empty state for focus list

### Pages
- `trena-app/app/(dashboard)/focus/page.tsx` - Today's Focus page
- Update `app/(dashboard)/research/leads/page.tsx` - Add priority filters
- Update `app/(dashboard)/research/leads/[id]/page.tsx` - Add priority breakdown

### Background Jobs
- `trena-app/lib/cron/daily-rescoring.ts` - Daily re-scoring job
- `trena-app/lib/cron/daily-focus-generation.ts` - Daily focus generation

### Notes
- Priority scoring runs automatically when lead is researched
- Re-scoring happens daily at 2am (background job)
- Focus list generates daily at midnight
- Use Vercel Cron Jobs or Supabase Edge Functions for scheduling

## Tasks

- [ ] 1.0 Database Schema & Type Definitions
  - [ ] 1.1 Create `supabase-schema-prioritization.sql` with ALTER TABLE for researched_leads (add: priority_score, priority_level, buying_signal_score, fit_score, signal_breakdown JSONB, last_scored_at, last_rescored_at)
  - [ ] 1.2 Add index on priority fields (idx_priority on user_id, priority_level, priority_score DESC)
  - [ ] 1.3 Create `daily_focus` table (id, user_id, focus_date, lead_ids JSONB, generated_at)
  - [ ] 1.4 Add UNIQUE constraint on daily_focus (user_id, focus_date)
  - [ ] 1.5 Create `lead_actions` table (id, user_id, lead_id, action_type, action_date)
  - [ ] 1.6 Add index on lead_actions (lead_id, action_type)
  - [ ] 1.7 Run SQL migration in Supabase SQL Editor
  - [ ] 1.8 Create `types/priority.ts` with interfaces: PriorityScore, PriorityLevel, SignalBreakdown, DailyFocus, LeadAction
  - [ ] 1.9 Update `types/database.ts` with priority table types
  - [ ] 1.10 Update `types/research.ts` to include priority fields in ResearchedLead interface
  - [ ] 1.11 Test schema by running migrations

- [ ] 2.0 Priority Scoring Algorithm
  - [ ] 2.1 Create `lib/priority/scoring-service.ts` with calculatePriorityScore() function
  - [ ] 2.2 Implement buying signals score calculation (funding +2, leadership +2, growth +1, news +1, tech +1)
  - [ ] 2.3 Implement fit score calculation (industry match +2, title match +2)
  - [ ] 2.4 Implement industry matching logic (exact match +2, partial match +1)
  - [ ] 2.5 Implement job title matching logic (exact +2, partial/contains +1)
  - [ ] 2.6 Implement signal breakdown generation (list of signals with point values)
  - [ ] 2.7 Implement priority level categorization (high: 6+, medium: 3-5, low: 0-2)
  - [ ] 2.8 Add special rule: 2+ signals with any fit = high priority
  - [ ] 2.9 Create savePriorityScore() function to update researched_leads with calculated score
  - [ ] 2.10 Add error handling and logging
  - [ ] 2.11 Test scoring algorithm with various lead combinations
  - [ ] 2.12 Verify priority levels are categorized correctly

- [ ] 3.0 Integrate Scoring with Research Flow
  - [ ] 3.1 Update `lib/research/research-service.ts` researchLead() to call calculatePriorityScore() after saving lead
  - [ ] 3.2 Update researchLead() to save priority scores to database
  - [ ] 3.3 Update getResearchedLeads() to return priority fields
  - [ ] 3.4 Update getResearchedLead() to return priority fields
  - [ ] 3.5 Create POST /api/priority/calculate endpoint for manual recalculation
  - [ ] 3.6 Test that new researched leads automatically get scored
  - [ ] 3.7 Verify priority data is saved correctly to database

- [ ] 4.0 Priority Display in List View
  - [ ] 4.1 Create `components/priority/priority-badge.tsx` with variants (high/medium/low)
  - [ ] 4.2 Style badges with correct colors (red #DC2626, yellow #F59E0B, gray #9CA3AF)
  - [ ] 4.3 Update `components/research/lead-list-item.tsx` to display priority badge
  - [ ] 4.4 Update `components/research/lead-list-item.tsx` to show priority score (e.g., "8/14")
  - [ ] 4.5 Update `components/research/filters.tsx` to add priority level filter dropdown
  - [ ] 4.6 Update GET /api/research/leads to support priority filter
  - [ ] 4.7 Update `app/(dashboard)/research/leads/page.tsx` to support priority filtering
  - [ ] 4.8 Update default sort to prioritize high → medium → low
  - [ ] 4.9 Add "Sort by Priority" option to sort dropdown
  - [ ] 4.10 Test priority badges display correctly
  - [ ] 4.11 Test priority filtering (show only high, only medium, only low)
  - [ ] 4.12 Test sorting by priority level

- [ ] 5.0 Priority Breakdown in Detail View
  - [ ] 5.1 Create `components/priority/priority-breakdown.tsx` component
  - [ ] 5.2 Display total score (e.g., "Priority Score: 8/14")
  - [ ] 5.3 Display buying signals score and fit score separately
  - [ ] 5.4 Display signal breakdown table (signal name, type, points)
  - [ ] 5.5 Display fit breakdown (industry match, title match with points)
  - [ ] 5.6 Update `app/(dashboard)/research/leads/[id]/page.tsx` to include priority breakdown card
  - [ ] 5.7 Style priority breakdown with clear visual hierarchy
  - [ ] 5.8 Test priority breakdown displays correctly with full data
  - [ ] 5.9 Test with leads that have different priority levels

- [ ] 6.0 Today's Focus Service
  - [ ] 6.1 Create `lib/priority/focus-service.ts` with generateDailyFocus() function
  - [ ] 6.2 Implement focus selection algorithm: fetch high-priority leads → exclude contacted (7 days) → exclude yesterday's focus → sort by score → take top 5
  - [ ] 6.3 Implement fallback: if <5 high-priority, include top medium-priority leads
  - [ ] 6.4 Implement diversity logic: prefer different companies/industries
  - [ ] 6.5 Create saveDailyFocus() to save focus list to daily_focus table
  - [ ] 6.6 Create getDailyFocus() to retrieve today's focus list
  - [ ] 6.7 Create markLeadContacted() to track contacted action
  - [ ] 6.8 Create GET /api/priority/focus endpoint
  - [ ] 6.9 Create POST /api/priority/actions endpoint for tracking actions
  - [ ] 6.10 Test focus generation with various lead scenarios
  - [ ] 6.11 Verify focus list updates daily
  - [ ] 6.12 Test "mark as contacted" functionality

- [ ] 7.0 Today's Focus UI
  - [ ] 7.1 Create `components/priority/focus-card.tsx` for individual focus lead
  - [ ] 7.2 Display lead name, title, company in focus card
  - [ ] 7.3 Display priority badge and top 1-2 buying signals
  - [ ] 7.4 Add action buttons: "Generate Outreach" (placeholder) | "View Details" | "Mark Contacted"
  - [ ] 7.5 Create `components/priority/empty-focus.tsx` for empty state
  - [ ] 7.6 Include "Research New Leads" button and suggestions in empty state
  - [ ] 7.7 Create `app/(dashboard)/focus/page.tsx` - Today's Focus page
  - [ ] 7.8 Display count of focus leads (e.g., "5 leads")
  - [ ] 7.9 Render all focus cards
  - [ ] 7.10 Handle empty state (no high-priority leads)
  - [ ] 7.11 Add loading state while fetching focus
  - [ ] 7.12 Update sidebar navigation to include "Focus" link
  - [ ] 7.13 Style focus page with prominent CTA layout
  - [ ] 7.14 Test focus page displays correctly
  - [ ] 7.15 Test "Mark Contacted" removes lead from focus
  - [ ] 7.16 Test empty state displays when no leads
  - [ ] 7.17 Verify mobile responsiveness

- [ ] 8.0 Daily Re-Scoring (Background Job)
  - [ ] 8.1 Create `lib/cron/daily-rescoring.ts` with reSco reAllLeads() function
  - [ ] 8.2 Implement logic: fetch all leads not scored in last 24 hours → recalculate scores → update database
  - [ ] 8.3 Implement Lusha API call for new signals (optional, may skip to save API costs)
  - [ ] 8.4 Batch process 50 leads at a time to avoid timeouts
  - [ ] 8.5 Log re-scoring activity (timestamp, leads updated)
  - [ ] 8.6 Handle errors gracefully (retry next day)
  - [ ] 8.7 Create Vercel cron job API route: `app/api/cron/rescore/route.ts`
  - [ ] 8.8 Set up Vercel cron schedule (runs at 2am daily)
  - [ ] 8.9 Test re-scoring manually by calling API route
  - [ ] 8.10 Verify leads are re-scored correctly

- [ ] 9.0 Daily Focus Generation (Background Job)
  - [ ] 9.1 Create `lib/cron/daily-focus-generation.ts` with generateFocusForAllUsers() function
  - [ ] 9.2 Implement logic: fetch all users → generate focus for each → save to daily_focus table
  - [ ] 9.3 Handle users with no high-priority leads
  - [ ] 9.4 Log focus generation activity
  - [ ] 9.5 Create Vercel cron job API route: `app/api/cron/generate-focus/route.ts`
  - [ ] 9.6 Set up Vercel cron schedule (runs at midnight daily)
  - [ ] 9.7 Test focus generation manually
  - [ ] 9.8 Verify new focus lists are created daily

- [ ] 10.0 Testing & Polish
  - [ ] 10.1 Test full flow: research lead → auto-scored → appears in list with badge
  - [ ] 10.2 Test priority filtering in list view
  - [ ] 10.3 Test priority sorting
  - [ ] 10.4 Test focus page with 5 leads
  - [ ] 10.5 Test focus page empty state
  - [ ] 10.6 Test "mark as contacted" functionality
  - [ ] 10.7 Test priority breakdown in detail view
  - [ ] 10.8 Test manual priority recalculation
  - [ ] 10.9 Test re-scoring job (simulate daily run)
  - [ ] 10.10 Test focus generation job (simulate midnight run)
  - [ ] 10.11 Verify mobile responsiveness on all new pages
  - [ ] 10.12 Run production build and verify 0 errors
  - [ ] 10.13 Update CHANGELOG.md with PRD #0004 deliverables
  - [ ] 10.14 Update README.md with priority features
  - [ ] 10.15 Update COMPLETION_STATUS.md
  - [ ] 10.16 Create session summary for PRD #0004

## Estimated Complexity

**Total Estimated Time:** 50-60 hours

**Breakdown:**
- Database & Types: 4-5 hours
- Scoring Algorithm: 8-10 hours
- Integration with Research: 4-5 hours
- Priority Display in List: 6-8 hours
- Priority Breakdown: 4-5 hours
- Focus Service: 8-10 hours
- Focus UI: 8-10 hours
- Background Jobs: 6-8 hours
- Testing & Documentation: 4-5 hours

**Challenges:**
- Scoring algorithm tuning and testing
- Cron job setup on Vercel (may need configuration)
- Focus selection algorithm (ensuring diversity and freshness)
- Handling edge cases (no high-priority leads, all leads contacted)
