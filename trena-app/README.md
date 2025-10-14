# Trena.ai - Sales Enablement Platform

AI-powered sales enablement platform for personalized outreach and lead prioritization.

**Status:** Foundation & Onboarding Complete (PRDs #0001 & #0002) ✅

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (https://supabase.com)

### Setup Instructions

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 3. Configure Lusha API (Optional for Lead Generation)

Add your Lusha API key to `.env.local`:

```env
LUSHA_API_KEY=your-lusha-api-key
```

Get your API key from [Lusha API](https://www.lusha.com/api/). If not configured, the app will use mock data.

#### 4. Set Up Database

Run the SQL migrations in your Supabase SQL Editor:

**Migration 1: Foundation Schema (`supabase-schema.sql`)**

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Migration 2: Onboarding Schema (`supabase-schema-onboarding.sql`)**

```sql
-- See supabase-schema-onboarding.sql in the project root for the complete schema
-- This adds onboarding fields to user_profiles and creates the quick_win_leads table
```

Run both schema files in order to set up the complete database.

#### 5. Enable Email Authentication

1. Go to Authentication > Providers in Supabase dashboard
2. Enable the Email provider
3. Configure email templates if needed

#### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
trena-app/
├── app/
│   ├── (auth)/              # Auth pages (login, signup)
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── home/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── (onboarding)/        # 7-step onboarding flow
│   │   ├── welcome/
│   │   ├── personal/
│   │   ├── motivators/
│   │   ├── target-buyer/
│   │   ├── connect-tools/
│   │   ├── summary/
│   │   ├── quick-win/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── onboarding/      # Onboarding API routes
│   │   └── leads/           # Lead generation routes
│   ├── layout.tsx           # Root layout with theme provider
│   ├── page.tsx             # Root page (redirects to login)
│   └── globals.css          # Global styles & theme variables
├── components/
│   ├── auth/                # Auth-related components
│   ├── navigation/          # Navigation components
│   ├── onboarding/          # Onboarding UI components
│   ├── ui/                  # shadcn/ui components
│   ├── sidebar.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── auth/                # Auth helper functions
│   ├── constants/           # App constants and options
│   ├── hooks/               # React hooks
│   ├── lusha/               # Lusha API client
│   ├── onboarding/          # Onboarding services
│   ├── supabase/            # Supabase client configuration
│   └── utils.ts
├── types/
│   ├── auth.ts              # Auth TypeScript types
│   ├── database.ts          # Database TypeScript types
│   └── onboarding.ts        # Onboarding TypeScript types
├── supabase-schema.sql      # Foundation database schema
├── supabase-schema-onboarding.sql  # Onboarding database schema
└── middleware.ts            # Next.js middleware for auth
```

## ✨ Features

### Implemented ✅

**PRD #0001 - Foundation, Authentication & App Shell**
- ✅ Email/Password Authentication (Supabase Auth)
- ✅ Responsive Sidebar Navigation (collapsible on desktop, sheet on mobile)
- ✅ Protected Routes (dashboard requires authentication)
- ✅ Home/Dashboard Page
- ✅ Profile Page (displays user info)
- ✅ Settings Page (password change, theme toggle)
- ✅ Light/Dark Theme Toggle (persistent)
- ✅ Mobile-First Responsive Design
- ✅ TypeScript Support
- ✅ shadcn/ui Component Library

**PRD #0002 - Onboarding & Profile Learning**
- ✅ 7-Step Onboarding Flow
  - Welcome screen with value propositions
  - Personal & role setup (name, title, company, quota, experience)
  - Motivators & selling style selection
  - Target buyer configuration (industries, roles, region, sales motion)
  - Integration connections (Email, CRM, LinkedIn - placeholders)
  - Profile summary with edit capabilities
  - Quick Win: AI-generated sample leads
- ✅ Lusha API Integration (with mock data fallback)
- ✅ Lead Enrichment & Generation
- ✅ Progress Tracking & Auto-save
- ✅ Form Validation on All Steps
- ✅ Mobile-Responsive Onboarding UI

**PRD #0003 - Buyer Research Agent**
- ✅ Manual Prospect Research
  - Search by person name, company, email, or LinkedIn URL
  - Comprehensive data enrichment via Lusha API
  - 30-day intelligent caching (saves API costs)
- ✅ AI-Powered Buyer Personas
  - GPT-4 or Claude-generated personas
  - Role summary, pain points, goals, talk tracks
  - Personalized conversation starters
  - Buying signal context integration
- ✅ Buying Signals Detection
  - Funding rounds, leadership changes, rapid hiring
  - Company expansion indicators
  - Visual badges and detailed descriptions
- ✅ Researched Leads Management
  - List view with advanced filtering and sorting
  - Search by name or company
  - Filter by industry, company size, has email, has signals
  - Pagination for large datasets
- ✅ Lead Detail View
  - Contact information with copy-to-clipboard
  - Company overview with tech stack
  - Work history timeline
  - Collapsible sections for clean UI
  - AI persona regeneration
- 🔜 CSV Upload (bulk research)
- 🔜 CRM Integrations (Salesforce, HubSpot)

**PRD #0004 - Lead Prioritization**
- ✅ Automatic Priority Scoring
  - Smart scoring algorithm (0-14 points)
  - Buying signals score (0-10 points)
  - Target buyer fit score (0-4 points)
  - Priority levels: high, medium, low
- ✅ Priority Display in Lists
  - Priority badges with color coding
  - Score display (e.g., "8/14")
  - Priority filtering and sorting
- ✅ Priority Breakdown in Detail View
  - Detailed score breakdown
  - Signal-by-signal point analysis
  - Fit score components
- ✅ Today's Focus
  - Daily list of top 5 priority leads
  - Smart exclusion (contacted leads, yesterday's focus)
  - Diversity logic (different companies/industries)
  - Mark as contacted functionality
- ✅ Lead Action Tracking
  - Track contacted, viewed, and other actions
  - Integration with focus generation
- ✅ Daily Background Jobs
  - Automatic lead re-scoring (runs at 2 AM UTC)
  - Daily focus generation (runs at midnight UTC)
  - Vercel Cron integration

**PRD #0005 - Outreach Generation Agent**
- ✅ AI-Powered Message Generation
  - OpenAI GPT-4 and Anthropic Claude support
  - Personalized content based on lead data, persona, and signals
  - 3 message types: Email, LinkedIn, Call Scripts
  - 4 tone options: Warm, Direct, Formal, Casual
  - Mock content fallback for testing
- ✅ Intelligent Coaching System
  - Detects 13+ weak phrases ("just checking in", "touching base", etc.)
  - Message quality score (0-100)
  - Actionable improvement suggestions
  - Strength identification
  - Length and CTA validation
- ✅ Message Management
  - List view with filtering (status, type, search)
  - Draft, edit, and regenerate messages
  - Message preview and copy functionality
  - Coaching tips integrated into composer
- ✅ Seamless Integration
  - "Generate Outreach" button on lead detail pages
  - Context sidebar with lead info, signals, and persona
  - Auto-save and version tracking
  - Message events tracking (sent, opened, clicked, replied)

**PRD #0006 - Dashboard & Analytics**
- ✅ Comprehensive Dashboard Metrics
  - Lead metrics (total, by priority, by time period)
  - Outreach metrics (messages by status, time period)
  - Engagement metrics (reply rate, open rate, click rate)
  - Activity metrics (leads contacted, focus completion rate)
- ✅ Dashboard Widgets
  - Today's Focus widget with completion tracking
  - Recent Activity feed with timestamped events
  - Stat cards with color-coded visual variants
- ✅ Analytics Service
  - Real-time metric calculation
  - Parallel data fetching for performance
  - Recent activity aggregation
  - Priority distribution for charts
- ✅ Dashboard API Routes
  - Stats API endpoint
  - Activity feed API endpoint
- ✅ Responsive Home Page
  - Personalized welcome
  - 3-tier metrics display (11 stat cards)
  - Side-by-side Focus and Activity widgets
  - Conditional rendering based on data

**PRD #0007 - Light Gamification**
- ✅ Points System
  - 7 event types with dynamic point values
  - Automatic point awards integrated into workflows
  - Weekly point tracking
- ✅ Level Progression
  - 7 levels: Prospector → Explorer → Achiever → Champion → Elite → Master → Legend
  - Exponential point requirements (100 → 6000 points)
  - Progress tracking with points-to-next-level
- ✅ Achievement System
  - 13 achievements across 3 tiers (Beginner, Intermediate, Advanced)
  - Automatic unlocking with condition checking
  - Bonus points for achievement unlocks
  - Visual locked/unlocked states
- ✅ Login Streak
  - Daily login tracking with streak counter
  - Streak continuation logic
  - Longest streak tracking
  - +5 points per daily login
- ✅ Weekly Goals
  - Leads researched goal (default: 10)
  - Messages sent goal (default: 20)
  - Progress bars with percentage tracking
  - Automatic weekly reset
- ✅ Gamification Dashboard Widget
  - Level and points display
  - Login streak counter
  - Weekly goals progress
  - Recent achievements showcase
- ✅ Full Gamification Page (`/gamification`)
  - Comprehensive stats overview
  - All achievements grouped by tier
  - Weekly goals tracking
  - Lifetime stats summary
- ✅ Navigation Integration
  - "Progress" link in sidebar with trophy icon

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Theme**: next-themes
- **Lead Enrichment**: Lusha API
- **AI**: OpenAI GPT-4 / Anthropic Claude
- **Deployment**: Vercel (recommended)

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## ⏰ Background Jobs (Vercel Cron)

The app includes two daily background jobs that run automatically on Vercel:

### 1. Lead Re-scoring (`/api/cron/rescore-leads`)
- **Schedule**: Daily at 2:00 AM UTC
- **Purpose**: Recalculates priority scores for all researched leads
- **Why**: Ensures scores stay current as user profiles and buying signals change
- **Endpoint**: `GET /api/cron/rescore-leads`

### 2. Daily Focus Generation (`/api/cron/generate-focus`)
- **Schedule**: Daily at 12:00 AM UTC (midnight)
- **Purpose**: Generates Today's Focus list for all users
- **Why**: Ensures users have fresh focus lists when they start their day
- **Endpoint**: `GET /api/cron/generate-focus`

### Cron Configuration

The cron jobs are configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/rescore-leads",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/generate-focus",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Security

Both cron endpoints are protected by the `CRON_SECRET` environment variable. Requests must include:

```
Authorization: Bearer <CRON_SECRET>
```

**Important**: Set `CRON_SECRET` in your Vercel project environment variables before deploying.

### Testing Cron Jobs Locally

You can test the cron jobs locally using curl:

```bash
# Test lead re-scoring
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron/rescore-leads

# Test focus generation
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron/generate-focus
```

## 🔐 Environment Variables

Required environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Lusha API (Optional - uses mock data if not provided)
LUSHA_API_KEY=your-lusha-api-key

# AI API (Required for AI persona generation - use ONE of these)
OPENAI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key

# Cron Job Security (Required for Vercel Cron Jobs)
# Generate a secure random string: openssl rand -base64 32
CRON_SECRET=your-secure-random-string
```

## 📄 License

This project is part of the Trena.ai MVP development.

## 🤝 Contributing

This is an MVP project. Follow the PRD-based task list for implementation guidance.

## 📊 Development Progress

- ✅ **PRD #0001** - Foundation, Auth & App Shell (100%)
- ✅ **PRD #0002** - Onboarding & Profile Learning (100%)
- ✅ **PRD #0003** - Buyer Research Agent (85% - Manual search complete, CSV & CRM pending)
- ✅ **PRD #0004** - Lead Prioritization (100%)
- ✅ **PRD #0005** - Outreach Generation Agent (100%)
- ✅ **PRD #0006** - Dashboard & Analytics (100%)
- ✅ **PRD #0007** - Light Gamification (100%)

**Overall Progress:** 100% complete! 🎉 All 7 PRDs implemented

## 📋 Documentation

- `CHANGELOG.md` - Detailed changelog of all features and changes
- `tasks/COMPLETION_STATUS.md` - Complete task completion tracking
- `tasks/tasks-0001-*.md` - PRD #0001 task breakdown
- `tasks/tasks-0002-*.md` - PRD #0002 task breakdown
- `Trena_PRD.md` - Full product requirements document
