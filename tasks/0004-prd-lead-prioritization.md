# PRD #0004: Lead Prioritization

## 1. Introduction/Overview

This PRD defines the Lead Prioritization system that automatically scores and ranks researched leads based on buying signals and fit score, helping sales reps focus their time on the highest-value prospects. The system categorizes leads into High/Medium/Low priority and suggests a daily "Today's Focus" list of top leads to contact.

**Problem it solves:** Sales reps have limited time and often struggle to decide which leads to contact first. They may waste time on low-quality prospects while high-intent buyers go cold. Without clear prioritization, reps can't maximize their pipeline velocity or hit quota efficiently.

**Goal:** Automatically prioritize researched leads using buying signals and target fit, then surface the top 5 leads daily in a "Today's Focus" list that helps reps work smarter, not harder.

## 2. Goals

1. Automatically score all researched leads based on buying signals and fit to user's target buyer profile
2. Categorize leads into High/Medium/Low priority buckets for easy scanning
3. Display priority levels visually in the Researched Leads list (badges/colors)
4. Generate a daily "Today's Focus" list with up to 5 high-priority leads
5. Re-score leads daily to surface new buying signals and maintain fresh priorities
6. Help reps focus on the right leads at the right time to maximize conversion rates
7. Reduce time spent deciding "who to call next" from minutes to seconds

## 3. User Stories

**As a sales rep**, I want to:
- See which leads are highest priority so I don't waste time on low-value prospects
- Have a clear "Today's Focus" list so I know exactly who to contact today
- Trust that the system is finding real buying signals, not just guessing
- See why a lead is high priority (which signals triggered the score)
- Focus my energy on leads most likely to convert
- Have priorities update automatically so I don't miss new hot leads

**As a product owner**, I want to:
- Increase rep productivity by eliminating decision paralysis
- Drive more conversions by ensuring reps contact high-intent leads first
- Use data (buying signals, fit) to objectively prioritize, not gut feel
- Track how prioritization affects outreach and conversion rates

## 4. Functional Requirements

### Priority Scoring Algorithm (FR-SCORING)

**Buying Signals Score:**
1. The system must assign points for each buying signal detected:
   - Recent funding (Series A/B/C, acquisition) = +2 points
   - Executive/leadership hire or job change = +2 points
   - Company growth (rapid hiring, expansion, new office) = +1 point
   - Recent news/product launch = +1 point
   - Tech stack match (uses similar tools to user's solution) = +1 point
2. The system must calculate total buying signal score (0-10 points)

**Fit Score:**
3. The system must calculate fit score based on match to user's target buyer profile:
   - Industry match (lead's industry matches user's target industries from onboarding) = +2 points
   - Job title match (lead's title matches user's target roles from onboarding) = +2 points
4. The system must calculate total fit score (0-4 points)

**Combined Priority Score:**
5. The system must calculate total priority score = Buying Signals Score + Fit Score (0-14 points)
6. The system must categorize leads into priority buckets:
   - **High Priority**: 6+ points OR 2+ buying signals with any fit
   - **Medium Priority**: 3-5 points OR 1 buying signal with good fit
   - **Low Priority**: 0-2 points OR no signals and weak/no fit
7. The system must allow adjustment of thresholds based on testing and analytics
8. The system must store priority score and level in `researched_leads` table

### Priority Display in Researched Leads List (FR-DISPLAY)

9. The system must display priority level visually in the Researched Leads list:
   - High Priority: 🔴 Red badge or "HIGH" label
   - Medium Priority: 🟡 Yellow badge or "MEDIUM" label
   - Low Priority: ⚪ Gray badge or "LOW" label
10. The system must sort leads by priority by default (High → Medium → Low)
11. The system must allow users to filter by priority level (show only High, only Medium, etc.)
12. The system must show priority score details in lead detail view:
    - Total score (e.g., "Priority Score: 8/14")
    - Breakdown: "Buying Signals: 5 pts | Fit: 3 pts"
    - List of detected signals with point values
13. The system must make priority badges mobile-friendly (large, tappable)

### Today's Focus List (FR-FOCUS)

14. The system must generate a "Today's Focus" list with up to 5 leads
15. The system must use AI/algorithm to select leads based on:
    - Priority score (favor high-priority leads)
    - User's daily capacity (default max 5 leads)
    - Recency (avoid suggesting same lead multiple days in a row unless new signal appears)
    - Diversity (mix of companies/industries if possible)
16. The system must display "Today's Focus" prominently:
    - Dedicated widget on Dashboard (PRD #0006)
    - Separate "Focus" tab in navigation
    - Mobile-optimized card view
17. The system must show for each focus lead:
    - Name, title, company
    - Priority badge
    - Top 1-2 buying signals (why they're prioritized)
    - Quick action buttons: "Generate Outreach" | "View Details"
18. The system must refresh "Today's Focus" daily at midnight (user's timezone)
19. The system must allow users to manually mark a lead as "Contacted" to remove from focus list
20. The system must show empty state if no high-priority leads exist:
    - Message: "No high-priority leads yet - research more prospects!"
    - Suggestion: "Try researching leads in [user's target industries]"
    - Button: "Research New Leads"

### Daily Re-Scoring (FR-RESCORING)

21. The system must automatically re-score all researched leads daily (runs at 2am user's timezone)
22. The system must check Lusha API for new buying signals:
    - New funding announcements
    - New executive hires
    - Company growth indicators
    - Recent news
23. The system must update priority scores and levels if new signals detected
24. The system must log re-scoring activity (timestamp, leads updated, new signals found)
25. The system must handle Lusha API failures during re-scoring gracefully (retry next day)
26. The system must NOT re-score leads that were researched within last 24 hours (avoid duplicate API calls)
27. The system must notify user if high-priority leads emerge from re-scoring (optional notification badge)

### Data Storage (FR-DATA)

28. The system must add fields to `researched_leads` table:
    - `priority_score` (integer, 0-14)
    - `priority_level` (enum: 'high', 'medium', 'low')
    - `buying_signal_score` (integer, 0-10)
    - `fit_score` (integer, 0-4)
    - `signal_breakdown` (jsonb: array of signals with point values)
    - `last_scored_at` (timestamp)
    - `last_rescored_at` (timestamp, nullable)
29. The system must create a `daily_focus` table:
    - id (UUID, primary key)
    - user_id (foreign key to user_profiles)
    - focus_date (date)
    - lead_ids (jsonb array of researched_lead IDs)
    - generated_at (timestamp)
30. The system must create a `lead_actions` table to track user activity:
    - id (UUID, primary key)
    - user_id, lead_id (foreign keys)
    - action_type (enum: 'contacted', 'viewed', 'added_to_focus', 'generated_outreach')
    - action_date (timestamp)

### Priority Logic (FR-LOGIC)

**Industry Match:**
31. The system must check if lead's `company_industry` matches any of user's `target_industries` (case-insensitive)
32. The system must award +2 points for exact match, +1 point for partial match (e.g., "SaaS" matches "Technology/SaaS")

**Job Title Match:**
33. The system must check if lead's `person_title` contains any of user's `target_roles` keywords
34. The system must award +2 points for exact match (e.g., "VP Sales" = "VP Sales"), +1 point for partial (e.g., "VP of Sales" contains "VP Sales")

**Buying Signals Detection:**
35. The system must parse Lusha `buying_signals` array and assign points per signal type
36. The system must detect funding from Lusha company data (recent_funding field)
37. The system must detect leadership changes from Lusha company news or recent hires data
38. The system must detect growth from employee count increase or hiring activity

## 5. Non-Goals (Out of Scope)

The following are explicitly **not** included in this PRD:

- Manual priority overrides (fully automated in MVP)
- Custom scoring rules or weights per user
- Lead scoring based on engagement (email opens, website visits) - no tracking yet
- Predictive AI models (ML-based lead scoring) - using rule-based algorithm for MVP
- Integration with external lead scoring tools
- Historical priority trends or analytics
- Team-level prioritization or lead assignment
- Snooze or postpone features for focus list
- Multi-day focus planning (only today's focus)
- Calendar integration for scheduling outreach

## 6. Design Considerations

### Visual Priority Indicators

**Researched Leads List:**
```
┌─────────────────────────────────────────┐
│ 🔍 Researched Leads                     │
├─────────────────────────────────────────┤
│ [Filter: 🔴 High | 🟡 Medium | ⚪ Low]  │
├─────────────────────────────────────────┤
│ 🔴 HIGH                                 │
│ 📊 John Smith - VP of Sales             │
│    Acme Corp • SaaS • 500 employees     │
│    💰 Raised $20M  📈 Hiring            │
│    Score: 8/14 (Signals: 5 | Fit: 3)    │
│    [View Details →]                     │
├─────────────────────────────────────────┤
│ 🟡 MEDIUM                               │
│ 📊 Sarah Johnson - CTO                  │
│    TechCo • Technology • 200 employees  │
│    📈 Recent product launch             │
│    Score: 4/14 (Signals: 2 | Fit: 2)    │
│    [View Details →]                     │
└─────────────────────────────────────────┘
```

**Today's Focus Widget:**
```
┌─────────────────────────────────────────┐
│ 🎯 Today's Focus (5 leads)              │
├─────────────────────────────────────────┤
│ 1. John Smith - VP Sales @ Acme Corp    │
│    🔴 HIGH • 💰 Just raised $20M        │
│    [Generate Outreach] [View Details]   │
├─────────────────────────────────────────┤
│ 2. Maria Garcia - CMO @ TechStart       │
│    🔴 HIGH • 👤 New hire (30 days ago)  │
│    [Generate Outreach] [View Details]   │
├─────────────────────────────────────────┤
│ ... (3 more leads)                      │
├─────────────────────────────────────────┤
│ ✅ Mark as Contacted when done          │
└─────────────────────────────────────────┘
```

**Empty State:**
```
┌─────────────────────────────────────────┐
│ 🎯 Today's Focus                        │
├─────────────────────────────────────────┤
│                                         │
│         🔍                              │
│   No high-priority leads yet!           │
│                                         │
│   Research more prospects to find       │
│   buyers with strong signals.           │
│                                         │
│   💡 Try researching leads in:          │
│   • Technology/SaaS                     │
│   • Healthcare                          │
│                                         │
│   [Research New Leads]                  │
│                                         │
└─────────────────────────────────────────┘
```

### UX Flow
1. User researches leads (PRD #0003)
2. System auto-scores and assigns priority on save
3. Leads appear in list with priority badges
4. System generates "Today's Focus" daily
5. User views focus list, clicks "Generate Outreach" or "View Details"
6. User marks leads as contacted to clear from focus
7. System re-scores nightly, updates priorities

### Color Scheme
- High Priority: Red/Crimson (#DC2626)
- Medium Priority: Yellow/Amber (#F59E0B)
- Low Priority: Gray (#9CA3AF)

## 7. Technical Considerations

### Scoring Algorithm Implementation

**Pseudocode:**
```javascript
function calculatePriorityScore(lead, userProfile) {
  let buyingSignalScore = 0;
  let fitScore = 0;

  // Buying Signals
  lead.buying_signals.forEach(signal => {
    if (signal.type === 'funding') buyingSignalScore += 2;
    if (signal.type === 'executive_hire') buyingSignalScore += 2;
    if (signal.type === 'growth') buyingSignalScore += 1;
    if (signal.type === 'news') buyingSignalScore += 1;
    if (signal.type === 'tech_match') buyingSignalScore += 1;
  });

  // Fit Score
  if (userProfile.target_industries.includes(lead.company_industry)) {
    fitScore += 2;
  }

  userProfile.target_roles.forEach(role => {
    if (lead.person_title.toLowerCase().includes(role.toLowerCase())) {
      fitScore += 2;
    }
  });

  const totalScore = buyingSignalScore + fitScore;

  // Determine priority level
  let priorityLevel = 'low';
  if (totalScore >= 6 || (buyingSignalScore >= 4 && fitScore >= 2)) {
    priorityLevel = 'high';
  } else if (totalScore >= 3) {
    priorityLevel = 'medium';
  }

  return {
    priority_score: totalScore,
    priority_level: priorityLevel,
    buying_signal_score: buyingSignalScore,
    fit_score: fitScore
  };
}
```

### Daily Re-Scoring Job
- **Scheduler**: Use Supabase Edge Functions with cron trigger or Vercel Cron Jobs
- **Timing**: Runs at 2am in user's timezone (convert from UTC)
- **Batch Size**: Process 50 leads at a time to avoid timeout
- **Lusha API Calls**: Only fetch new signals, not full re-enrichment
- **Optimization**: Cache Lusha responses for 24 hours

### Today's Focus Generation
- **Algorithm**:
  1. Fetch all high-priority leads for user
  2. Exclude leads contacted in last 7 days
  3. Exclude leads in yesterday's focus (unless new signal)
  4. Sort by priority score descending
  5. Take top 5
  6. Save to `daily_focus` table
- **Runs**: Daily at midnight user's timezone
- **Fallback**: If <5 high-priority leads, include top medium-priority leads

### Database Schema Updates

**researched_leads table additions:**
```sql
ALTER TABLE researched_leads ADD COLUMN
  priority_score INTEGER DEFAULT 0,
  priority_level TEXT CHECK (priority_level IN ('high', 'medium', 'low')),
  buying_signal_score INTEGER DEFAULT 0,
  fit_score INTEGER DEFAULT 0,
  signal_breakdown JSONB DEFAULT '[]',
  last_scored_at TIMESTAMP DEFAULT NOW(),
  last_rescored_at TIMESTAMP;

CREATE INDEX idx_priority ON researched_leads(user_id, priority_level, priority_score DESC);
```

**daily_focus table:**
```sql
CREATE TABLE daily_focus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  focus_date DATE NOT NULL,
  lead_ids JSONB NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, focus_date)
);
```

**lead_actions table:**
```sql
CREATE TABLE lead_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  lead_id UUID REFERENCES researched_leads(id) NOT NULL,
  action_type TEXT CHECK (action_type IN ('contacted', 'viewed', 'added_to_focus', 'generated_outreach')),
  action_date TIMESTAMP DEFAULT NOW(),

  INDEX idx_lead_actions (lead_id, action_type)
);
```

### Performance Considerations
- Index `priority_score` and `priority_level` for fast filtering/sorting
- Use materialized views for "Today's Focus" if query is slow
- Lazy load signal breakdown details (only fetch when detail view opened)
- Cache priority calculations for 1 hour to avoid re-computing on every page load

## 8. Success Metrics

**Functional Success:**
1. ✅ All researched leads have priority scores calculated
2. ✅ Priority badges display correctly in list view
3. ✅ "Today's Focus" generates 5 leads daily (if available)
4. ✅ Daily re-scoring runs successfully and updates priorities
5. ✅ Users can filter/sort by priority level
6. ✅ Signal breakdown shows in detail view

**Business Success:**
- 70%+ of users check "Today's Focus" daily
- High-priority leads have 2x higher outreach rate than low-priority
- Users contact "Today's Focus" leads within 24 hours 60%+ of the time
- Priority scores correlate with actual conversion rates (validate post-launch)

**Technical Success:**
- Re-scoring job completes in <5 minutes for 1000 leads
- Lusha API success rate during re-scoring >95%
- Today's Focus generation completes in <2 seconds
- Zero missed daily jobs (100% cron reliability)

## 9. Open Questions

1. **Threshold Tuning**: Should we A/B test different priority thresholds (e.g., 5+ vs 6+ for high) to optimize conversion?
2. **User Timezone**: How do we reliably detect user timezone for cron jobs? Ask during onboarding or auto-detect from browser?
3. **Focus List Size**: Should users be able to customize daily capacity (e.g., "I can handle 10 leads/day")?
4. **Contacted Tracking**: Should "Mark as Contacted" require proof (e.g., email sent) or trust user input?
5. **Stale Leads**: If a lead has been in focus 3+ times but never contacted, should we deprioritize automatically?
6. **Notifications**: Should we send email/push notifications when new high-priority leads appear? Or keep it in-app only?
7. **Weighting**: Should certain buying signals (funding) weigh more than others (news mention)? Current system treats some as +2, others +1 - is this optimal?
8. **Multi-signal Boost**: Should leads with 3+ different signal types get a bonus multiplier?

---

## Next Steps After Implementation

Once lead prioritization is complete:
1. Prioritized leads will feed PRD #0005: Outreach Generation (focus on high-priority first)
2. "Today's Focus" will appear in PRD #0006: Dashboard
3. Priority/focus activity will contribute to PRD #0007: Gamification (e.g., "Contacted 5 focus leads this week!")
4. Analyze conversion data to refine scoring algorithm over time
