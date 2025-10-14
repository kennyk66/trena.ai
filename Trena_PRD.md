# **Trena.ai — Product Requirements Document**

Version 1.0 | MVP Specification

---

## **1. Executive Summary**

### **Product Vision**
Trena.ai is an AI-powered sales acceleration platform that acts as an extension of frontline sales reps. It automates research, generates hyper-personalized outreach, and prioritizes high-intent leads — helping reps hit quota, companies grow revenue, and buyers feel understood.

### **Target Users**
- **Primary**: Frontline B2B sales reps (SDRs, AEs)
- **Secondary**: Sales managers and leaders
- **Buyer Persona**: Decision-makers seeking authentic, need-based solutions

### **Key Differentiators**
- **Needs analysis everywhere**: Goes deeper than surface KPIs to uncover the buyer's "need behind the need"
- **Hyper-personalization**: Every output feels handcrafted, never generic or "AI-written"
- **Voice-first**: Matches the rep's natural tone and communication style
- **Mobile-optimized**: Built for reps who live on their phones
- **Relentless simplicity**: Dead simple UI/UX from day one

---

## **2. Problem Statement & User Context**

### **The Salesperson's Journey**

A frontline salesperson lives under constant pressure:

- **Targets & KPIs** drive their day: quota, pipeline, deals closed
- Behind those KPIs sits the *need behind the need*: paying rent, getting promoted, hitting bonus, proving themselves, building a career

### **Daily Reality**

1. **Research** — Scrambling to understand prospects, often messy and incomplete
2. **Outreach** — Writing generic emails or LinkedIn messages that usually get ignored
3. **Calls/Meetings** — Turning up without truly knowing the buyer's drivers
4. **Pipeline Management** — Constantly asking "who's worth my time?"
5. **Closing Deals** — Success depends on trust, personalization, and timing

### **Pain Points**
- Manual research is time-consuming and incomplete
- Generic outreach gets ignored (low reply rates)
- Difficulty prioritizing which leads deserve attention
- Lack of visibility into what's working
- No coaching or guidance on how to improve
- Tools are desktop-only, not mobile-friendly

### **Consequences**
- **If they fail** → the company misses revenue
- **If they succeed** → the buyer feels understood, the company grows, and the salesperson hits their goals

---

## **3. Product Vision & Principles**

### **Why Trena Matters**

Trena sits in the middle of this journey as the **extension of the rep**:

- Makes research automatic
- Generates outreach that feels personal and human
- Prioritizes where to spend time based on signals
- Closes the gap between buyer and seller by surfacing the buyer's *need behind the need*

Trena doesn't just help a rep hit quota. It helps the **company grow** and helps the **buyer feel understood**.

### **Core Product Principles**

1. **Delight the customer first**
   - Sales rep: tool is an extension of them
   - Sales leader/company: delivers revenue impact, more pipeline, deals, logos
   - Buyer: closes the gap between buyer and seller by surfacing their real needs

2. **Needs analysis everywhere**
   - Always go deeper than surface KPIs

3. **Hyper-personalization**
   - No generic outreach. Every output must feel handcrafted

4. **Relentless simplicity**
   - UI/UX must be dead simple. From day one, anyone should know what to do

5. **Voice-first**
   - Talk to the rep in their tone and style

6. **Mobile optimized**
   - Reps live on their phone. MVP must be mobile-friendly

7. **Cost discipline**
   - Be ruthless with spend. Always question: build vs. buy

---

## **4. MVP Scope & Success Criteria**

### **MVP Must-Haves**

1. ✅ Onboarding & profile learning
2. ✅ Buyer research agent
3. ✅ Outreach generation agent
4. ✅ Lead prioritization
5. ✅ Simple dashboard
6. ✅ Light gamification
7. ✅ Cost-efficient infra
8. ✅ Mobile web first

### **Success Metrics**

**For Sales Reps:**
- Daily active usage (5+ days per week)
- Outreach messages generated per day (avg 10+)
- Reply rate improvement (2x baseline)
- Time saved per lead (50% reduction in research time)

**For Sales Leaders:**
- Pipeline growth (20%+ increase)
- Win rate improvement (10%+ increase)
- Team adoption rate (80%+ within 30 days)

**For Product:**
- User retention (D7: 60%, D30: 40%)
- NPS score: 40+
- Feature engagement: 70%+ using core features daily

### **Out of Scope (Post-MVP)**

- Coaching layer: explain *why* these signals matter and how to angle conversations
- Buyer-seller alignment: show reps where their approach and buyer needs diverge
- Deeper gamification: team leaderboards, competitions, nudges
- Sales leader dashboards: analytics on usage and pipeline impact
- Offline/voice input: dictate notes or outreach on the move

---

## **5. Feature Specifications**

### **5.1 Onboarding & Profile Learning**

#### **Purpose**
Personalize the Trena.ai experience by capturing user goals, motivators, communication style, and integrations.

#### **User Flow**

1. **Welcome Screen**
   - Quick intro to Trena value prop
   - "Let's get started" CTA

2. **Personal & Role Setup**
   - Name, job title, company
   - Current quota and targets
   - Years of sales experience

3. **Motivators & Selling Style**
   - What drives you? (quota, promotion, recognition, etc.)
   - Communication tone (warm, direct, formal, casual)
   - Preferred feedback style (coaching vs. just the facts)

4. **Industry Focus & Target Buyer**
   - Industry verticals (SaaS, Finance, Healthcare, etc.)
   - Target buyer roles (VP Sales, CMO, IT Director, etc.)
   - Geographic region
   - Sales motion (inbound, outbound, hybrid)

5. **Connect Tools**
   - Email account (Gmail, Outlook)
   - CRM (Salesforce, HubSpot, Pipedrive)
   - LinkedIn integration

6. **AI Training Summary**
   - Review captured profile
   - "This is what I know about you" recap
   - Option to edit before confirming

7. **Quick Win: Generate First Leads**
   - "Let's find your first 3 high-quality leads"
   - Show enriched lead cards with insights
   - Generate sample outreach message

#### **Technical Requirements**

**Collections:**
- `user_profiles`
  - user_id, name, email, title, company
  - quota, experience_years
  - motivators[], communication_tone
  - target_industries[], target_roles[], target_regions[]
  - sales_motion, onboarding_completed_at

- `api_credentials`
  - user_id, provider (email/crm/linkedin)
  - encrypted_tokens, refresh_tokens
  - connected_at, last_synced_at

- `email_accounts`
  - user_id, email_address, provider
  - sync_enabled, signature

- `crm_accounts`
  - user_id, crm_type, instance_url
  - sync_enabled, sync_frequency

**Functions:**
- `init_user_profile(user_data)` — Create new user profile
- `save_onboarding_step(user_id, step_data)` — Progressive save
- `connect_provider(user_id, provider, auth_code)` — OAuth integration
- `generate_first_leads(user_id)` — Sample lead generation

#### **UX/UI Guidelines**
- Conversational tone throughout
- Progress bar showing 7 steps
- Skip-friendly (non-critical fields optional)
- Mobile-first: large touch targets, single-column layout
- Auto-save progress (can resume later)

---

### **5.2 Lead Management & Enrichment**

#### **Purpose**
Centralize and prioritize high-quality leads based on enrichment data and AI scoring.

#### **Key Functions**

1. **Lead List View**
   - Filterable by industry, company size, title, region, AI score
   - Sort by: score (high to low), last activity, added date
   - Search by company or contact name

2. **Lead Detail View**
   - Company overview (size, industry, location, tech stack)
   - Contact information (name, title, LinkedIn, email)
   - Intent signals (news, hiring, funding, product launches)
   - Activity timeline (emails sent, opens, clicks, replies)
   - AI-generated persona summary
   - Next-best-action recommendation

3. **AI Enrichment**
   - Pull signals from news, job boards, funding databases, social media
   - Identify buying intent signals (hiring SDRs, recent funding, leadership changes)
   - Build dynamic buyer persona

4. **Lead Scoring**
   - AI-powered prioritization based on:
     - Intent signals strength
     - Fit with ICP (industry, size, role)
     - Engagement level (website visits, content downloads)
     - Timing indicators (budget cycle, hiring, etc.)

#### **Technical Requirements**

**Collections:**
- `leads`
  - lead_id, user_id, contact_id, company_id
  - status (new/contacted/replied/meeting/closed)
  - ai_score (0-100), priority (high/medium/low)
  - added_at, last_contacted_at, next_action

- `companies`
  - company_id, name, domain, industry
  - size, location, tech_stack[]
  - funding_stage, latest_funding_date, funding_amount

- `contacts`
  - contact_id, company_id, name, title
  - email, phone, linkedin_url
  - seniority_level, department

- `enrichment_signals`
  - signal_id, company_id, signal_type
  - signal_source, signal_data (JSON)
  - discovered_at, relevance_score

- `lead_scores`
  - lead_id, score, score_factors (JSON)
  - scored_at, model_version

**Functions:**
- `enrich_lead(lead_id)` — Pull and store enrichment data
- `score_leads(user_id)` — Batch scoring for all user leads
- `summarize_lead(lead_id)` — Generate AI persona summary
- `next_best_action(lead_id)` — Recommend next step

#### **UX/UI Guidelines**
- Mobile-friendly card layout
- Quick action buttons: "Compose Outreach", "Add to Sequence", "Mark as Priority"
- Color-coded scores (green: high, yellow: medium, gray: low)
- Expandable sections for signals and timeline
- Pull-to-refresh for latest data

---

### **5.3 Personalized Outreach Generation**

#### **Purpose**
Enable reps to send tailored messages using AI-generated drafts in their voice and tone.

#### **Key Functions**

1. **Generate Outreach**
   - Email templates
   - LinkedIn messages
   - Call scripts
   - Follow-up sequences

2. **Tone Control**
   - Warm, direct, formal, casual
   - Adjustable formality slider
   - Personal anecdote injection (optional)

3. **Inline Coaching Tips**
   - Highlight weak phrases ("Just checking in")
   - Suggest stronger alternatives
   - Explain why changes improve response rates

4. **Tracking & Analytics**
   - Track opens, clicks, replies
   - A/B test different approaches
   - Learn from what works for each rep

#### **Technical Requirements**

**Collections:**
- `outreach_messages`
  - message_id, user_id, lead_id
  - message_type (email/linkedin/call_script)
  - generated_content, edited_content, final_content
  - tone, coaching_applied
  - sent_at, status (draft/sent/replied)

- `message_events`
  - event_id, message_id, event_type (sent/opened/clicked/replied)
  - timestamp, metadata (JSON)

**Functions:**
- `generate_outreach(lead_id, message_type, tone)` — AI generation
- `send_email(message_id)` — Send via integrated email
- `events_webhook(event_data)` — Track email events

#### **UX/UI Guidelines**
- Email composer with rich text editor
- Contextual insights sidebar (lead signals, persona, talking points)
- Tone selector (radio buttons or slider)
- "Generate", "Regenerate", "Edit", "Send" CTAs
- Preview mode before sending
- Coaching tips as subtle highlights (tooltip on hover)

---

### **5.4 Gamification & Engagement**

#### **Purpose**
Drive daily engagement and motivation through streaks, badges, and leaderboards.

#### **Mechanics**

1. **Daily Streaks**
   - Actions that count: leads contacted, replies received, meetings booked
   - Visual streak counter (🔥 7-day streak!)
   - Reminders: "Keep your streak alive — contact 1 more lead today"

2. **Badges & Achievements**
   - **First Reply**: Earned on first positive response
   - **5 Leads Contacted**: Early momentum
   - **10-Day Streak**: Consistency champion
   - **50 Meetings Booked**: Pipeline builder
   - **Top Performer**: #1 on weekly leaderboard

3. **Leaderboards**
   - Individual vs team
   - Weekly resets
   - Metrics: leads contacted, reply rate, meetings booked

#### **Technical Requirements**

**Collections:**
- `streaks`
  - user_id, current_streak, longest_streak
  - last_activity_date, streak_type

- `badges`
  - badge_id, name, description, icon_url
  - unlock_criteria (JSON)

- `user_badges`
  - user_id, badge_id, earned_at

- `leaderboards`
  - leaderboard_id, period (weekly/monthly)
  - rankings (JSON: user_id, rank, score)

**Functions:**
- `update_streaks(user_id, action)` — Check and update streak
- `assign_badge(user_id, badge_id)` — Award badge
- `update_leaderboard(period)` — Recalculate rankings

#### **UX/UI Guidelines**
- Subtle notifications (toast or banner)
- Reward animations (confetti for badges)
- Dashboard widget showing streak and latest badges
- Leaderboard accessible via tab
- Opt-out option for reps who prefer minimal gamification

---

### **5.5 Analytics & Insights**

#### **Purpose**
Provide reps and managers with actionable performance metrics and gamified motivation.

#### **Rep View: Key Metrics**

- **Meetings Booked** (this week / month)
- **Reply Rate** (%)
- **Win Rate** (opportunities to closed-won)
- **Average Response Time** (hours)
- **Template Effectiveness** (which messages work best)

#### **Manager View**

- **Team Leaderboard** (by rep performance)
- **Pipeline Overview** (total pipeline, weighted pipeline, close rate)
- **Outreach Performance Trends** (weekly activity, reply rates, conversion)
- **Adoption Metrics** (who's using Trena, how often)

#### **Technical Requirements**

**Collections:**
- `activities`
  - activity_id, user_id, lead_id, activity_type
  - timestamp, metadata (JSON)

- `leads` (reused from Lead Management)
- `user_profiles` (reused from Onboarding)
- `leaderboards` (reused from Gamification)
- `streaks` (reused from Gamification)

**Functions:**
- `generate_reports(user_id, period)` — Generate rep or manager reports
- `calculate_kpis(user_id)` — Compute all KPIs for a user

#### **UX/UI Guidelines**
- Dashboard with card-based layout
- Charts: bar, line, pie (mobile-responsive)
- Drill-down from overview to detail
- Export option (CSV for managers)
- Real-time updates (or refresh button)

---

## **6. Technical Architecture**

### **Data Models (Consolidated)**

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `user_profiles` | User account & preferences | user_id, name, email, quota, tone, target_industries[] |
| `api_credentials` | OAuth tokens for integrations | user_id, provider, encrypted_tokens |
| `email_accounts` | Connected email accounts | user_id, email_address, provider |
| `crm_accounts` | CRM integrations | user_id, crm_type, instance_url |
| `leads` | Lead records | lead_id, user_id, company_id, contact_id, ai_score, status |
| `companies` | Company data | company_id, name, domain, industry, size, funding |
| `contacts` | Individual contacts | contact_id, company_id, name, title, email, linkedin_url |
| `enrichment_signals` | Intent & trigger signals | signal_id, company_id, signal_type, signal_data, relevance_score |
| `lead_scores` | AI-generated scores | lead_id, score, score_factors[] |
| `outreach_messages` | Generated/sent messages | message_id, user_id, lead_id, message_type, tone, content, status |
| `message_events` | Email/message tracking | event_id, message_id, event_type, timestamp |
| `activities` | All user actions | activity_id, user_id, activity_type, timestamp |
| `streaks` | Daily activity streaks | user_id, current_streak, longest_streak |
| `badges` | Achievement definitions | badge_id, name, unlock_criteria |
| `user_badges` | Earned achievements | user_id, badge_id, earned_at |
| `leaderboards` | Team rankings | leaderboard_id, period, rankings[] |

### **API Functions (Consolidated)**

**Onboarding:**
- `init_user_profile(user_data)`
- `save_onboarding_step(user_id, step_data)`
- `connect_provider(user_id, provider, auth_code)`
- `generate_first_leads(user_id)`

**Lead Management:**
- `enrich_lead(lead_id)`
- `score_leads(user_id)`
- `summarize_lead(lead_id)`
- `next_best_action(lead_id)`

**Outreach:**
- `generate_outreach(lead_id, message_type, tone)`
- `send_email(message_id)`
- `events_webhook(event_data)`

**Gamification:**
- `update_streaks(user_id, action)`
- `assign_badge(user_id, badge_id)`
- `update_leaderboard(period)`

**Analytics:**
- `generate_reports(user_id, period)`
- `calculate_kpis(user_id)`

### **Integrations**

**Email Providers:**
- Gmail (OAuth 2.0)
- Outlook (Microsoft Graph API)

**CRM Systems:**
- Salesforce (REST API)
- HubSpot (API v3)
- Pipedrive (API v1)

**LinkedIn:**
- LinkedIn OAuth for profile access
- Message sending via API (if available) or manual copy-paste

**Data Enrichment:**
- Use APIs where smart (Clearbit, Apollo, ZoomInfo)
- Plan for in-house where strategic (proprietary scoring, persona generation)

---

## **7. UX/UI Guidelines**

### **Design Principles**

1. **Relentless Simplicity**
   - Dead simple from day one
   - Clear information hierarchy
   - Minimal clicks to complete any action

2. **Mobile-First**
   - Responsive design (mobile web, not native app for MVP)
   - Large touch targets (min 44x44px)
   - Single-column layouts
   - Bottom navigation for thumb-friendly access

3. **Voice-First**
   - Conversational copy throughout
   - Match rep's tone (formal, casual, direct, warm)
   - No jargon or corporate speak

4. **Fast & Responsive**
   - Load times <2 seconds
   - Optimistic UI (instant feedback)
   - Progressive loading for heavy data

### **Visual Design**

- **Color Palette**:
  - **Primary Brand Colors**:
    - Orange/Coral - Main brand color (logo, backgrounds, accent elements)
    - White - Text and contrast elements
    - Black/Dark Gray - Primary text and UI elements
  - **Secondary Colors**:
    - Light Orange/Peach - Gradients and softer background sections
    - Gray tones - Various shades for secondary text and UI elements
  - **Interface Colors**:
    - Green - Positive indicators (checkmarks, success states)
    - Red - Negative indicators (X marks, errors)

- **Typography**: Clean, readable fonts (system fonts for performance)
- **Iconography**: Minimal, consistent icon set
- **Spacing**: Generous white space to avoid clutter

### **Interaction Patterns**

- **Pull-to-refresh**: Update lead data
- **Swipe actions**: Archive, mark priority, delete
- **Toast notifications**: Success/error feedback
- **Modal dialogs**: Confirmations, forms
- **Inline editing**: Edit fields without leaving screen

---

## **8. Success Metrics & KPIs**

### **North Star Metric**
**Weekly Active Users (WAU) with ≥3 outreach messages sent**

### **Engagement Metrics**
- Daily Active Users (DAU)
- Session duration (target: 10+ min/day)
- Feature adoption (% using each core feature)
- Streak retention (% maintaining 7+ day streaks)

### **Business Impact Metrics**
- Reply rate improvement (2x baseline)
- Meetings booked per week (increase 30%+)
- Time saved per lead (50% reduction)
- Pipeline value generated
- Win rate improvement (10%+)

### **Product Health Metrics**
- Onboarding completion rate (target: 80%)
- Retention: D1, D7, D30 (target: 80%, 60%, 40%)
- NPS score (target: 40+)
- Feature usage (target: 70% daily use of core features)
- Churn rate (target: <10% monthly)

---

## **9. Future Roadmap**

### **Phase 2: Coaching & Intelligence**

- **Coaching Layer**: Explain *why* signals matter and how to angle conversations
- **Buyer-Seller Alignment**: Show reps where approach and buyer needs diverge
- **Deal Intelligence**: Predict deal risk and suggest interventions

### **Phase 3: Team Collaboration**

- **Deeper Gamification**: Team competitions, challenges, nudges
- **Sales Leader Dashboards**: Team analytics, coaching insights
- **Peer Learning**: Share winning templates and strategies

### **Phase 4: Advanced Automation**

- **Offline/Voice Input**: Dictate notes or outreach on the move
- **Auto-Sequences**: Multi-touch cadences with AI optimization
- **Real-Time Alerts**: Push notifications for hot leads
- **Slack/Teams Integration**: Alerts and quick actions

### **Extensibility Considerations**

- Modular architecture: new agents slot in without re-platforming
- Plugin system for custom data sources
- API for third-party integrations
- White-label options for enterprise

---

## **10. Additional Recommendations**

### **Core Loop Integrity**
Keep the core loop tight: **company in → insights → outreach → action**

### **Habit Formation**
Must feel natural to check daily:
- Morning: "Here are your top 3 leads for today"
- Afternoon: "You're 1 reply away from your streak goal!"
- Evening: "Great work — 5 meetings booked this week 🎉"

### **Data Freshness**
Reps must trust insights:
- Real-time or near-real-time enrichment
- Clear timestamps ("Updated 2 hours ago")
- Refresh button for manual updates

### **Human, Not AI-Written**
Outreach must feel authentic:
- Train models on rep's actual sent emails
- Avoid buzzwords and corporate jargon
- Include option to inject personal anecdotes

### **Cost Discipline**
- Start with API partners (faster MVP)
- Build in-house for strategic/high-volume features
- Monitor usage and optimize spend continuously

---

## **Appendix: Glossary**

- **ICP**: Ideal Customer Profile
- **SDR**: Sales Development Representative
- **AE**: Account Executive
- **Quota**: Sales target (usually monthly or quarterly revenue)
- **Pipeline**: Total value of open opportunities
- **Win Rate**: Percentage of opportunities that close successfully
- **Reply Rate**: Percentage of outreach that gets responses
- **Intent Signals**: Data points indicating buyer readiness (hiring, funding, etc.)
- **Enrichment**: Adding third-party data to leads (company size, tech stack, news)
- **Cadence**: Multi-touch outreach sequence (email, call, LinkedIn, etc.)

---

**Document Control**
- Version: 1.0
- Last Updated: 2025-10-08
- Owner: Product Team
- Status: Approved for Development
