# Changelog

All notable changes to Trena.ai will be documented in this file.

## [Unreleased]

## [0.7.0] - 2025-10-10 - PRD #0007: Light Gamification

### Added

**Complete Gamification System**
- Points system with 7 event types and dynamic point values
- 7 progression levels: Prospector → Explorer → Achiever → Champion → Elite → Master → Legend
- 13 achievements across 3 tiers (Beginner, Intermediate, Advanced)
- Login streak tracking with daily bonus points (+5 per day)
- Weekly goals for leads researched and messages sent
- Automatic achievement unlocking with condition checking
- Level-up system with points-to-next-level tracking
- Lifetime stats tracking across all gamification events

**Points System**
- Lead researched: 10 points (20 for high priority)
- Message generated: 15 points
- Message sent: 25 points
- Reply received: 50 points
- Focus completed: 100 points
- Daily login: 5 points
- Automatic point awards integrated into research workflow

**Achievement System**
- **Beginner Tier** (4 achievements):
  - First Steps (20 pts) - Research your first lead
  - Hello World (50 pts) - Generate your first message
  - First Contact (100 pts) - Send your first message
  - Conversation Starter (200 pts) - Get your first reply
- **Intermediate Tier** (5 achievements):
  - Researcher (150 pts) - Research 10 leads
  - Outreach Master (300 pts) - Send 20 messages
  - Priority Hunter (250 pts) - Research 5 high-priority leads
  - Focus Champion (400 pts) - Complete 3 daily focus sessions
  - Week Warrior (500 pts) - Hit both weekly goals in one week
- **Advanced Tier** (4 achievements):
  - Century Club (1000 pts) - Research 100 leads
  - High Flyer (750 pts) - Research 25 high-priority leads
  - Consistency King (800 pts) - Maintain a 7-day login streak
  - Master Closer (1500 pts) - Receive 10 replies

**Database Schema**
- Created `user_gamification` table with comprehensive stats tracking:
  - Points (total, weekly), level, streak, weekly goals
  - 6 lifetime counters: leads, high-priority, messages, sent, replies, focus
- Created `user_achievements` table for unlocked achievements
- Created `gamification_events` table for detailed activity logging
- RLS policies for all tables
- Trigger function for auto-creating gamification profiles
- Performance indexes for fast queries

**Gamification Service**
- `awardPoints()` - Award points for events with achievement checking
- `updateLoginStreak()` - Track daily login with streak rewards
- `checkAchievements()` - Automatic achievement unlocking
- `calculateLevel()` - Dynamic level calculation with titles
- `getGamificationSummary()` - Dashboard widget data with weekly progress
- `getGamificationStats()` - Full stats for gamification page
- `resetWeeklyGoals()` - Weekly goal reset logic

**API Routes**
- `GET /api/gamification/stats` - Full gamification statistics
- `GET /api/gamification/summary` - Summary data for dashboard widget
- `GET /api/gamification/achievements` - All achievements with unlock status

**UI Components**
- `gamification-widget.tsx` - Dashboard widget showing:
  - Current level and progress to next level
  - Total points and points this week
  - Login streak display
  - Weekly goals progress bars (leads and messages)
  - Recent achievements display
- Full gamification page (`/gamification`) with:
  - Level card with progress bar and next level info
  - Points card with weekly breakdown
  - Streak card with longest streak tracking
  - Weekly goals section with progress bars
  - Achievement cards grouped by tier (Beginner, Intermediate, Advanced)
  - Locked vs unlocked achievement display
  - Lifetime stats summary (6 metrics)

**Integration**
- Automatic point awards in research workflow
- Login streak tracking on home page load
- Gamification widget added to dashboard
- "Progress" navigation link added to sidebar (🏆 icon)
- Point awards integrated with metadata tracking

### Changed

**Home Page** (`app/(dashboard)/home/page.tsx`)
- Added gamification widget to dashboard layout
- Integrated login streak tracking on page load
- Parallel data fetching includes gamification summary

**Sidebar Navigation** (`components/sidebar.tsx`)
- Added "Progress" link with trophy icon
- Updated navigation order

**Research Service** (`lib/research/research-service.ts`)
- Integrated automatic point awards after lead research
- Awards 10 points for regular leads, 20 for high-priority
- Includes metadata (lead_id, priority_level, priority_score)

### Technical Details

**Gamification Service** (`lib/gamification/gamification-service.ts`)
- 583 lines of comprehensive gamification logic
- Level progression system with exponential point requirements:
  - Level 1: Prospector (0 pts required)
  - Level 2: Explorer (100 pts)
  - Level 3: Achiever (300 pts)
  - Level 4: Champion (700 pts)
  - Level 5: Elite (1500 pts)
  - Level 6: Master (3000 pts)
  - Level 7: Legend (6000 pts)
- Achievement checking with complex condition logic
- Weekly goal tracking with automatic reset
- Streak calculation with day-over-day comparison

**Database Schema** (`supabase-schema-gamification.sql`)
- 3 tables with comprehensive RLS policies
- Auto-increment trigger for gamification profiles
- Weekly goal defaults: 10 leads, 20 messages
- JSON metadata storage for event details

**Type Definitions** (`types/gamification.ts`)
- Complete TypeScript interfaces for all gamification entities
- Event type enum (7 event types)
- Achievement tiers and conditions
- Level definitions with titles and point requirements

**Files Created**
- 1 database schema file
- 1 type definitions file
- 1 gamification service file (583 lines)
- 3 API route files
- 1 UI widget component
- 1 full gamification page
- Updated 3 existing files (home page, sidebar, research service)

**Build Status**
- ✅ 42 routes generated (+4 new routes)
- ✅ 0 TypeScript errors
- ✅ Minor ESLint warnings (unused imports)
- ✅ Production build successful

### Performance

- Efficient database queries with indexes
- Parallel data fetching for dashboard
- Optimistic UI updates for point awards
- Weekly counter reset logic (no cron needed)

### Security

- Row Level Security (RLS) on all gamification tables
- User ID verification on all API endpoints
- Achievement unlocking server-side only
- No client-side point manipulation possible

### User Experience

- Automatic point awards (no manual claiming)
- Visual feedback for achievements
- Progress tracking across multiple dimensions
- Motivational level titles and milestones
- Weekly goals for consistent engagement
- Login streak encourages daily use

---

## [0.6.0] - 2025-10-10 - PRD #0006: Dashboard & Analytics

### Added

**Comprehensive Dashboard Analytics**
- Real-time dashboard metrics and statistics
- Lead metrics: total leads, high/medium/low priority breakdown, leads this week/month
- Outreach metrics: total messages, drafts vs sent, messages by time period
- Engagement metrics: reply rate, open rate, click rate with percentages
- Activity metrics: leads contacted, leads contacted this week, focus completion rate
- Automatic metric calculation with parallel data fetching

**Dashboard Widgets**
- Today's Focus widget with completion rate progress bar
- Recent Activity feed with timestamped events
- Multiple stat cards with color-coded variants
- Responsive grid layout (1/2/3/4 column based on screen size)

**Analytics Service**
- `getDashboardStats()` - Calculates comprehensive metrics across leads, messages, and actions
- `getRecentActivity()` - Aggregates recent user activity (research, messages, contacts)
- `getPriorityDistribution()` - Returns lead counts by priority level for charts
- Parallel Promise.all execution for optimal performance
- Date range calculations (week ago, month ago)

**Dashboard API Routes**
- `GET /api/dashboard/stats` - Returns all dashboard statistics
- `GET /api/dashboard/activity?limit=10` - Returns recent activity feed

**UI Components**
- `StatCard` component - Reusable metric display with icon, value, description, trend
- `FocusWidget` component - Today's Focus preview with completion tracking
- `ActivityWidget` component - Recent activity feed with color-coded event types
- 4 visual variants: default (blue), primary (purple), success (green), warning (orange)

**Home Page Dashboard**
- Personalized welcome with user's name
- 3-tier metrics display:
  - Primary stats: Total Leads, This Week, Messages Sent, Reply Rate
  - Secondary stats: High Priority Leads, Leads Contacted, Total Messages
  - Engagement stats: Opened, Clicked, Replied (with percentages)
- Side-by-side Today's Focus and Recent Activity widgets
- Conditional rendering based on data availability

### Technical Details

**Analytics Service** (`lib/analytics/analytics-service.ts`)
- Fetches data from 4 tables in parallel (leads, messages, actions, focus)
- Calculates 17 distinct metrics
- Recent activity aggregation from multiple sources
- Efficient date filtering with ISO timestamp comparisons
- Type-safe return interfaces

**Dashboard Components** (`components/dashboard/`)
- `stat-card.tsx` - Flexible metric card with icon, title, value, description
- `focus-widget.tsx` - Focus leads preview with completion progress
- `activity-widget.tsx` - Activity feed with date-fns relative timestamps
- All components use shadcn/ui Card base
- Fully responsive with Tailwind CSS grid

**Home Page** (`app/(dashboard)/home/page.tsx`)
- Server-side rendering with async data fetching
- Parallel data loading for stats, activity, and focus
- Profile name fetching for personalization
- Conditional display for engagement metrics (only if messages sent)

**Files Created**
- 1 analytics service file
- 2 API route files
- 3 UI component files
- 1 updated page file (home)

**Build Status**
- ✅ 38 routes generated (+2 new dashboard API routes)
- ✅ 0 TypeScript errors
- ✅ 3 ESLint warnings (unused imports in other files)
- ✅ Production build successful

### Performance

- Parallel data fetching with Promise.all reduces load time
- Efficient Supabase queries with proper indexing
- Server-side rendering for instant dashboard display
- Minimal client-side JavaScript for stat cards

### Security

- All API routes require authentication
- User ID verification on all dashboard queries
- Row Level Security (RLS) enforced on all data access
- No sensitive data exposed in client components

---

## [0.5.0] - 2025-10-10 - PRD #0005: Outreach Generation Agent

### Added

**AI-Powered Message Generation**
- OpenAI GPT-4 and Anthropic Claude integration for message generation
- Personalized outreach based on lead data, AI persona, and buying signals
- 3 message types: Email, LinkedIn messages, Call scripts
- 4 tone options: Warm, Direct, Formal, Casual
- Context-aware generation using user profile and selling style
- Mock content fallback for testing without API keys

**Intelligent Coaching System**
- Real-time message analysis with quality scoring (0-100)
- Detection of 13+ weak phrases with alternatives
  - "just checking in", "touching base", "circle back", etc.
  - Confidence-undermining phrases like "sorry to bother"
  - Passive CTAs like "let me know if"
- Actionable improvement suggestions
- Strength identification in messaging
- Length validation (200 words for email, 150 for LinkedIn)
- Subject line optimization (under 60 chars)
- CTA strength analysis

**Message Management**
- `/outreach` page - List all outreach messages with filtering
- `/outreach/compose` page - Generate and edit messages
- Advanced filtering: status, message type, search query
- Sort by created date (newest/oldest)
- Draft, edit, and regenerate functionality
- Message preview with coaching highlights
- Copy to clipboard functionality
- Auto-save every 30 seconds

**Database Schema**
- Created `outreach_messages` table with RLS policies
  - Fields: message_type, subject, generated_content, edited_content
  - Status tracking: draft, sent, opened, clicked, replied
  - Coaching score and tone tracking
- Created `message_events` table for tracking
  - Event types: sent, opened, clicked, replied, bounced
  - Metadata storage for analytics
- Performance indexes for fast queries

**API Routes**
- `POST /api/outreach/generate` - Generate new personalized message
- `GET /api/outreach/messages` - List user's messages with filters
- `GET /api/outreach/[id]` - Get single message details
- `PUT /api/outreach/[id]` - Update message content
- `DELETE /api/outreach/[id]` - Delete draft message
- `POST /api/outreach/[id]/regenerate` - Regenerate message with new AI output

**UI Components**
- Message composer with subject/body editing
- Tone selector component
- Coaching highlight cards with impact indicators
- Message preview modal
- Context sidebar showing lead info, signals, and persona
- Message cards for list view
- Word/character counters with recommendations

**Navigation & Integration**
- Added "Outreach" link to sidebar navigation (📧 icon)
- "Generate Outreach" button on lead detail pages
- Seamless flow from research → outreach generation

### Technical Details

**Generation Service** (`lib/outreach/generation-service.ts`)
- Dual AI provider support (OpenAI and Anthropic)
- Structured prompt building with context
- Personalization using:
  - Lead name, title, company, industry
  - AI persona insights (pain points, goals, talk tracks)
  - Buying signals (funding, hiring, leadership changes)
  - User profile (name, company, selling style)
- Custom instructions support
- Graceful fallback to mock content

**Coaching Service** (`lib/outreach/coaching-service.ts`)
- Pattern matching for weak phrases
- Scoring algorithm based on best practices
- Contextual suggestions with examples
- Impact ratings (high, medium, low)
- Strength identification logic

**Files Created**
- 1 database schema file (`supabase-schema-outreach.sql`)
- 2 service files (generation, coaching)
- 5 API route files
- 6 UI component files
- 2 page files
- Type definitions (`types/outreach.ts`)
- Constants (`lib/constants/outreach-options.ts`)

### Changed

**Supabase Schema**
- Extended database with outreach tables
- Added RLS policies for message security
- Created indexes for performance

**Navigation**
- Added Outreach section to sidebar

### Performance

- Efficient AI generation with caching
- Database indexes for fast message queries
- Optimistic UI updates for better UX

### Security

- Row Level Security (RLS) on all outreach tables
- User ID verification on all API endpoints
- API key protection (server-side only)

---

## [0.4.0] - 2025-10-09 - PRD #0004: Lead Prioritization

### Added

**Priority Scoring System**
- Automatic priority scoring for all researched leads
- Smart scoring algorithm (0-14 points total)
  - Buying signals score (0-10 points): funding +2, leadership changes +2, growth +1, news +1
  - Target buyer fit score (0-4 points): industry match +2, title match +2
- Priority levels: high (6+), medium (3-5), low (0-2)
- Special rule: 2+ buying signals with any fit = high priority
- Priority calculation integrated into research flow

**Priority Display**
- Priority badges in lead list view with color coding (red/yellow/gray)
- Priority score display (e.g., "8/14")
- Priority filter dropdown in list view
- Priority sorting options (high to low, low to high)
- Comprehensive priority breakdown in lead detail view
  - Total score display
  - Buying signals score breakdown
  - Target buyer fit score breakdown
  - Signal-by-signal point analysis

**Today's Focus Feature**
- Daily curated list of top 5 priority leads
- New `/focus` page with dedicated UI
- Smart focus generation algorithm:
  - Selects high-priority leads
  - Excludes leads contacted in last 7 days
  - Excludes yesterday's focus leads
  - Applies diversity logic (different companies/industries)
  - Falls back to medium-priority if <5 high-priority leads available
- Focus card component with:
  - Priority badge and score
  - Top 2 buying signals display
  - Contact info indicators
  - Action buttons (Mark Contacted, View Details, Generate Outreach)
- Mark as contacted functionality with optimistic UI updates
- Empty state with helpful tips and CTAs

**Lead Action Tracking**
- New `lead_actions` database table
- Track user actions: contacted, viewed, added_to_focus, generated_outreach
- Action tracking API endpoint (`POST /api/priority/actions`)
- Integration with focus generation algorithm

**Database Schema Updates**
- Added priority fields to `researched_leads` table:
  - `priority_score` (INTEGER)
  - `priority_level` (TEXT: high/medium/low)
  - `buying_signal_score` (INTEGER)
  - `fit_score` (INTEGER)
  - `signal_breakdown` (JSONB)
  - `last_scored_at` (TIMESTAMPTZ)
  - `last_rescored_at` (TIMESTAMPTZ)
- Created `daily_focus` table with RLS policies
- Created `lead_actions` table with RLS policies
- Added performance indexes for priority queries

**New API Routes**
- `POST /api/priority/calculate` - Calculate/recalculate priority score
- `GET /api/priority/focus` - Get today's focus list
- `POST /api/priority/actions` - Track lead actions

**New UI Components**
- `priority-badge.tsx` - Reusable priority badge with variants
- `priority-breakdown.tsx` - Detailed score breakdown display
- `focus-card.tsx` - Individual focus lead card
- Focus page with empty states and loading states

**Navigation Updates**
- Added "Focus" link to sidebar navigation (🎯 icon)

### Changed

**Research Service**
- Integrated automatic priority scoring into `researchLead()` function
- Priority calculated immediately after lead is saved
- Extended `getResearchedLeads()` to support priority filtering and sorting

**Type Definitions**
- Extended `ResearchedLead` interface with priority fields
- Added new `priority.ts` types file with comprehensive interfaces
- Updated `ResearchFilters` to include priority_level
- Updated `ResearchSortOption` to include priority sorting

**Constants**
- Added priority level options to research-options.ts
- Added priority sort options (highest to lowest scores)

### Technical Details

**Priority Scoring Algorithm** (`lib/priority/scoring-service.ts`)
- `calculatePriorityScore()` - Main scoring function
- `savePriorityScore()` - Database persistence
- `recalculatePriorityScore()` - Force recalculation
- Scoring logic:
  - Buying signals: funding (+2), leadership change (+2), hiring/expansion (+1), news/product (+1)
  - Fit score: industry match (+2 exact, +1 partial), title match (+2 exact, +1 partial)
  - Priority levels: high (6+), medium (3-5), low (0-2)
  - Special rule: 2+ signals with any fit = high priority

**Focus Service** (`lib/priority/focus-service.ts`)
- `generateDailyFocus()` - Smart focus list generation
- `getDailyFocus()` - Retrieve existing or generate new focus
- `markLeadContacted()` - Track contacted action
- `trackLeadAction()` - Generic action tracking
- Diversity algorithm: prefer different companies and industries

**Files Created**
- 1 database schema file
- 2 type definition files (priority.ts updates)
- 2 service files (scoring, focus)
- 3 API route files
- 3 UI component files
- 1 page file
- Task breakdown file (146 subtasks)

**Build Status**
- ✅ 29 routes generated (26 existing + 3 new APIs + 1 new page)
- ✅ 0 TypeScript errors
- ✅ 0 ESLint warnings
- ✅ Production build successful

### Performance

- Database indexes added for fast priority queries
- Efficient focus generation algorithm with smart exclusions
- Optimistic UI updates for better UX

### Security

- Row Level Security (RLS) policies on daily_focus and lead_actions tables
- User ID verification on all API endpoints
- Data isolation per user

### Future Enhancements (Not Yet Implemented)

- Daily background job for re-scoring leads
- Daily background job for focus generation at midnight
- Vercel cron job configuration

---

## [0.3.0] - 2025-10-09 - PRD #0003: Buyer Research Agent

### Added

**Manual Prospect Research**
- Research prospects by person name, company, email, or LinkedIn URL
- Comprehensive data enrichment via Lusha API
- 30-day intelligent caching (saves API costs)
- Multiple matching strategies (email > LinkedIn > name+company)

**AI-Powered Buyer Personas**
- GPT-4 or Claude-generated personas
- Role summary, pain points, goals, talk tracks
- Personalized conversation starters
- Buying signal context integration
- Regenerate persona functionality

**Buying Signals Detection**
- Funding rounds, leadership changes, rapid hiring
- Company expansion indicators
- Visual badges and detailed descriptions
- Automatic extraction from enrichment data

**Researched Leads Management**
- List view with advanced filtering and sorting
- Search by name or company
- Filter by industry, company size, has email, has signals
- Pagination for large datasets (20 per page)

**Lead Detail View**
- Contact information with copy-to-clipboard
- Company overview with tech stack
- Work history timeline
- Collapsible sections for clean UI
- AI persona display

**Database Schema**
- Created `researched_leads` table with RLS policies
- 4 performance indexes for fast queries
- Auto-updating timestamps

**API Routes**
- `POST /api/research/manual` - Manual prospect research
- `GET /api/research/leads` - List researched leads
- `GET /api/research/[id]` - Get single lead
- `POST /api/research/[id]/regenerate-persona` - Regenerate AI persona

**UI Components**
- Search form with validation
- Filters component with 5 filter types
- Lead list item cards
- Buying signals badges (compact and detailed variants)
- Contact info with clipboard functionality
- AI persona display
- Collapsible components

**Pages**
- `/research` - Main research hub with tabs
- `/research/leads` - List view with filters
- `/research/leads/[id]` - Detailed lead view

### Changed

**Lusha API Client**
- Extended with 4 new functions:
  - `companySearch()` - Find companies
  - `personEnrich()` - Get person details
  - `companyEnrich()` - Get company details
  - `extractBuyingSignals()` - Extract signals

**Navigation**
- Added Research link to sidebar (🔍 icon)

### Technical Details

**Research Service** (`lib/research/research-service.ts`)
- 7-step research pipeline
- Intelligent caching with multiple matching strategies
- Error handling and graceful degradation
- Mock data fallback for testing

**AI Persona Generator** (`lib/ai/persona-generator.ts`)
- Dual provider support (OpenAI GPT-4 and Anthropic Claude)
- Structured output parsing
- Context-aware generation using user profile
- Mock persona fallback

---

## [0.2.0] - 2025-10-08 - PRD #0002: Onboarding & Profile Learning

### Added

**7-Step Onboarding Flow**
- Welcome screen with value propositions
- Personal & role setup
- Motivators & selling style selection
- Target buyer configuration
- Integration connections (placeholders)
- Profile summary with edit capabilities
- Quick Win: AI-generated sample leads

**Lusha API Integration**
- Lead enrichment and generation
- Mock data fallback for testing

**Database Schema**
- Extended `user_profiles` with onboarding fields
- Created `quick_win_leads` table
- Created placeholder integration tables

---

## [0.1.0] - 2025-10-08 - PRD #0001: Foundation, Authentication & App Shell

### Added

**Authentication System**
- Email/Password authentication via Supabase
- Protected routes with middleware
- Auto-redirect unauthenticated users
- Session persistence

**App Shell**
- Responsive sidebar navigation
- Collapsible sidebar (desktop)
- Mobile sheet navigation
- Light/Dark theme toggle with persistence

**Core Pages**
- Home/Dashboard
- Profile page
- Settings page with password change

**Infrastructure**
- Next.js 15.5.4 with App Router
- TypeScript configuration
- shadcn/ui component library
- Tailwind CSS styling
- Supabase integration

---

## Development Notes

### Version Numbering
- Major version (X.0.0): Complete PRD implementation
- Minor version (0.X.0): Significant feature additions
- Patch version (0.0.X): Bug fixes and minor improvements

### PRD Progress
- ✅ PRD #0001 - Foundation (100%)
- ✅ PRD #0002 - Onboarding (100%)
- ✅ PRD #0003 - Buyer Research Agent (85% - CSV & CRM pending)
- ✅ PRD #0004 - Lead Prioritization (100%)
- ✅ PRD #0005 - Outreach Generation Agent (100%)
- ✅ PRD #0006 - Dashboard & Analytics (100%)
- ✅ PRD #0007 - Light Gamification (100%)
