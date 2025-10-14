# PRD #0002: Onboarding & Profile Learning

## 1. Introduction/Overview

This PRD defines the comprehensive 7-step onboarding flow for Trena.ai that captures the sales rep's goals, motivators, communication style, target buyers, and provides a "Quick Win" with 3 enriched leads using Lusha API integration.

**Problem it solves:** Sales reps need a personalized experience from day one. Generic tools don't understand their goals, quotas, selling style, or target market. This onboarding captures critical context that enables Trena to deliver hyper-personalized buyer research, outreach, and prioritization.

**Goal:** Create a conversational, mobile-first onboarding experience that collects essential rep data and delivers immediate value through a "Quick Win" of 3 enriched leads.

## 2. Goals

1. Capture comprehensive user profile data (goals, quotas, motivators, style, target buyers)
2. Create a smooth, conversational onboarding experience that feels natural and quick
3. Demonstrate immediate value by generating 3 real enriched leads via Lusha API
4. Store all profile data securely in Supabase for use across all Trena features
5. Ensure onboarding is fully responsive and mobile-friendly
6. Set up foundation for future tool integrations (email, CRM, LinkedIn)
7. Complete onboarding in under 5 minutes

## 3. User Stories

**As a sales rep**, I want to:
- Tell Trena about my sales goals and quota so it understands what success means for me
- Share my motivators (promotion, bonus, proving myself) so Trena can align with my "need behind the need"
- Define my selling style so outreach feels authentic to my voice
- Specify my target buyer personas so Trena researches the right prospects
- See immediate value (3 enriched leads) so I trust the platform can help me
- Navigate back and forth through onboarding if I need to change answers
- Complete setup quickly on my phone since I'm always on the go

**As a product owner**, I want to:
- Collect structured data that powers personalization across all features
- Demonstrate ROI immediately with real Lusha data
- Track onboarding completion rates and drop-off points
- Ensure data quality by making all steps required

## 4. Functional Requirements

### Overall Onboarding Flow (FR-FLOW)
1. The system must trigger onboarding immediately after user signup (before dashboard access)
2. The system must enforce completion of all 7 steps (no skipping allowed)
3. The system must show a progress bar indicating current step (e.g., "Step 2 of 7")
4. The system must allow users to navigate back to previous steps to edit answers
5. The system must allow users to navigate forward if they've already completed a step
6. The system must auto-save progress as users complete each step
7. The system must mark onboarding as complete when all 7 steps are done and user sees 3 enriched leads

### Step 1: Welcome Screen (FR-WELCOME)
8. The system must display a welcome message with Trena.ai branding
9. The system must provide a brief intro (1-2 sentences) about what Trena does
10. The system must include a "Get Started" button to begin onboarding
11. The welcome screen must be visually engaging and mobile-friendly

### Step 2: Personal & Role Setup (FR-PERSONAL)
12. The system must collect the following required fields:
    - Full name (text input)
    - Job title (text input)
    - Company name (text input)
    - Sales quota (single text input, e.g., "$100K/quarter")
    - Years of sales experience (dropdown: "0-1 years", "1-3 years", "3-5 years", "5+ years")
13. The system must validate all fields are completed before allowing "Next"
14. The system must store data in `user_profiles` table

### Step 3: Motivators & Selling Style (FR-MOTIVATORS)
15. The system must ask "What drives you?" and provide multiple-choice options:
    - Hitting quota/bonus
    - Getting promoted
    - Proving myself
    - Building my career
    - Financial security (rent, bills)
    - Recognition/respect
    - Other (with text input for custom answer)
16. The system must allow selection of multiple motivators
17. The system must ask "What's your selling style/tone?" with options:
    - Formal and professional
    - Casual and friendly
    - Direct and concise
    - Consultative and educational
    - Enthusiastic and energetic
18. The system must allow selection of ONE selling style
19. The system must store data in `user_profiles` table

### Step 4: Industry Focus & Target Buyer (FR-TARGET)
20. The system must ask "What industries do you sell to?" with broad categories aligned with Lusha:
    - Technology/SaaS
    - Healthcare
    - Financial Services
    - Retail/E-commerce
    - Manufacturing
    - Professional Services
    - Education
    - Real Estate
    - Other (with text input)
21. The system must allow selection of multiple industries
22. The system must ask "Who are your target buyer roles?" with:
    - Predefined roles (multi-select): CEO, CTO, VP Sales, VP Marketing, Director of Operations, CFO, Head of HR, etc.
    - "Other" option with free text input for custom roles
23. The system must ask "What region do you primarily sell to?" with options:
    - North America
    - Europe
    - Asia-Pacific
    - Latin America
    - Global/Multiple regions
24. The system must ask "What's your sales motion?" with options:
    - Outbound prospecting
    - Inbound lead follow-up
    - Account-based (ABM)
    - Mix of outbound and inbound
25. The system must store all data in `user_profiles` table

### Step 5: Connect Tools (FR-INTEGRATIONS)
26. The system must display three integration options with placeholder UI:
    - Email (Gmail, Outlook) - "Connect" button
    - CRM (Salesforce, HubSpot, Pipedrive) - "Connect" button
    - LinkedIn - "Connect" button
27. The buttons must be visible but display "Coming Soon" tooltip or modal when clicked
28. The system must allow users to skip this step with "Continue" button
29. The system must prepare database structure (`api_credentials`, `email_accounts`, `crm_accounts` tables) for future implementation

### Step 6: AI Training Summary (FR-SUMMARY)
30. The system must display a review screen showing all captured data:
    - Name, title, company
    - Quota, experience level
    - Motivators and selling style
    - Target industries, roles, region, sales motion
31. The system must include "Edit" buttons next to each section that navigate back to relevant step
32. The system must include a "Looks Good" or "Confirm" button to proceed
33. The system must display encouraging messaging like "Your AI sales assistant is ready to learn your style"

### Step 7: Quick Win - Generate First Leads (FR-QUICKWIN)
34. The system must call Lusha API to generate 3 enriched leads based on user's profile
35. The system must use target industries, buyer roles, and region from user profile as search parameters
36. The system must use Trena's shared Lusha API key (stored in environment variables)
37. The system must display 3 leads with enriched data:
    - Full name
    - Job title
    - Company name
    - Email address (if available)
    - Phone number (if available)
    - LinkedIn profile (if available)
    - Company size/industry
38. The system must handle Lusha API errors gracefully (show placeholder data or error message)
39. The system must include a "Start Using Trena" button that completes onboarding and redirects to dashboard
40. The system must mark onboarding as complete in the database when user reaches this step

### Database Schema (FR-DB)
41. The system must update `user_profiles` table to include:
    - name (text)
    - job_title (text)
    - company_name (text)
    - sales_quota (text)
    - experience_level (text)
    - motivators (jsonb array)
    - selling_style (text)
    - target_industries (jsonb array)
    - target_roles (jsonb array)
    - target_region (text)
    - sales_motion (text)
    - onboarding_completed (boolean, default false)
    - onboarding_completed_at (timestamp, nullable)
42. The system must create placeholder tables (to be implemented later):
    - `api_credentials` (id, user_id, provider, credentials_encrypted, created_at)
    - `email_accounts` (id, user_id, email_provider, email_address, connected_at)
    - `crm_accounts` (id, user_id, crm_provider, account_id, connected_at)
43. The system must create a `quick_win_leads` table:
    - id (UUID, primary key)
    - user_id (UUID, foreign key to user_profiles)
    - lead_name (text)
    - job_title (text)
    - company_name (text)
    - email (text, nullable)
    - phone (text, nullable)
    - linkedin_url (text, nullable)
    - company_size (text, nullable)
    - industry (text, nullable)
    - source (text, default 'lusha')
    - created_at (timestamp)

### UX Requirements (FR-UX)
44. The system must use a conversational tone throughout (friendly, encouraging)
45. The system must show a progress indicator (e.g., "Step 3 of 7" or progress bar)
46. The system must be fully mobile-responsive
47. The system must use clear, large touch targets for mobile (min 44x44px)
48. The system must provide helpful placeholder text in input fields
49. The system must show validation errors inline (e.g., "Please enter your quota")
50. The system must celebrate completion with positive messaging (e.g., "🎉 You're all set!")

## 5. Non-Goals (Out of Scope)

The following are explicitly **not** included in this PRD:

- Actual OAuth integration flows for email/CRM/LinkedIn (placeholder UI only)
- Email verification during onboarding
- Ability to skip onboarding entirely
- Admin/manager onboarding flows (sales rep only)
- Video tutorials or guided tours within onboarding
- A/B testing different onboarding flows
- Multi-language support
- Importing contacts during onboarding
- Team/organization setup
- Payment/billing information collection

## 6. Design Considerations

### Visual Design
- Use Trena.ai brand colors and typography (from PRD #0001)
- Clean, minimal design with generous white space
- Large, readable fonts optimized for mobile
- Progress bar at top of each step
- Consistent "Back" and "Next" button placement

### Conversational Copy Examples
- **Welcome**: "Hey there! 👋 Let's get Trena set up to be your ultimate sales sidekick."
- **Personal**: "First things first—tell us about your role and goals."
- **Motivators**: "What gets you fired up? What are you working toward?"
- **Target Buyer**: "Who are you trying to reach? The more specific, the better."
- **Summary**: "Here's what we learned about you. Look good?"
- **Quick Win**: "🎉 Check out these 3 hot leads we found just for you!"

### Flow Diagram
```
Signup → Welcome → Personal & Role → Motivators & Style →
Target Buyer → Connect Tools (placeholder) → Summary →
Quick Win (Lusha) → Dashboard
```

### Mobile-First Considerations
- Single-column layout
- One question per screen on mobile when possible
- Auto-focus on first input field
- Use native mobile inputs (dropdowns, multi-select)
- Minimize typing with smart defaults and selections

## 7. Technical Considerations

### Lusha API Integration
- **Endpoint**: Use Lusha People Search API
- **Authentication**: API key stored in environment variable `LUSHA_API_KEY`
- **Rate Limits**: Be aware of Lusha rate limits (cache results if needed)
- **Search Parameters**: Map user profile data to Lusha filters:
  - Industry → `company.industry`
  - Job titles → `person.jobTitle`
  - Region → `person.location.country` or `person.location.region`
- **Error Handling**:
  - If API fails, show friendly message: "We're having trouble fetching leads right now. You can explore your dashboard and we'll have leads ready soon!"
  - Log errors for debugging
  - Consider showing mock data as fallback

### Data Storage
- Store all user profile data in Supabase `user_profiles` table
- Use JSONB for arrays (motivators, industries, roles) for flexibility
- Encrypt sensitive data if API credentials are stored (future)

### State Management
- Use React state or form library (React Hook Form, Formik) to manage onboarding state
- Persist progress to database after each step completion
- Allow users to resume onboarding if they close browser mid-flow

### Performance
- Lazy load Lusha API call only on Step 7
- Optimize form validation for instant feedback
- Preload next step while user is on current step

### Functions to Implement
From @onboarding.md reference:
- `init_user_profile()` - Initialize user profile on signup
- `save_onboarding_step(step_number, step_data)` - Save progress after each step
- `connect_provider(provider_type)` - Placeholder for future integrations
- `generate_first_leads(user_profile)` - Call Lusha API and return 3 leads

## 8. Success Metrics

**Functional Success:**
1. ✅ User completes all 7 onboarding steps
2. ✅ User sees 3 enriched leads from Lusha
3. ✅ User profile data is correctly saved to database
4. ✅ User can navigate back/forward between steps
5. ✅ Onboarding is marked complete and user lands on dashboard

**Business Success:**
- 90%+ onboarding completion rate (users who start Step 1 reach Step 7)
- Average completion time < 5 minutes
- User perceives value from Quick Win leads (measured via future surveys)

**Technical Success:**
- Lusha API calls succeed with <2s response time
- Zero data loss (all user inputs saved correctly)
- Mobile responsive (works on iOS/Android browsers)
- No console errors during onboarding flow

## 9. Open Questions

1. **Lusha API Limits**: What's our Lusha plan and monthly credit limit? Should we cap Quick Win to 3 leads to manage costs?
2. **Data Privacy**: Do we need explicit consent checkboxes for storing user data (GDPR compliance)?
3. **Onboarding Re-access**: Can users re-take onboarding later to update their profile, or is it one-time only?
4. **Lead Quality**: If Lusha returns low-quality leads (no emails), should we fetch more until we have 3 good ones?
5. **Progress Persistence**: If user closes browser mid-onboarding, should we auto-resume or ask if they want to continue?
6. **Analytics**: Which analytics events should we track? (step_completed, step_abandoned, onboarding_completed, etc.)
7. **Quota Format**: Should we parse quota input to extract amount and time period, or keep as free text?
8. **Integration Placeholders**: Should we collect "coming soon" email signups for integrations, or just show static UI?

---

## Next Steps After Implementation

Once onboarding is complete:
1. Users will have rich profiles that power all future features
2. Implement PRD #0003: Buyer Research Agent (will use target buyer data)
3. Implement PRD #0004: Lead Prioritization (will use motivators and sales motion)
4. Implement PRD #0005: Outreach Generation (will use selling style and motivators)
5. Eventually replace placeholder integrations with real OAuth flows
