# PRD #0006: Dashboard - Daily Priorities View

## 1. Introduction/Overview

This PRD defines the main Dashboard (Home page) that serves as the rep's daily command center. It displays Today's Focus leads, pipeline stats, progress toward weekly activity goals, recent activity, quick action buttons, and motivational messaging - all optimized for mobile-first, single-tap interactions.

**Problem it solves:** Sales reps need a clear, actionable view of what to do today without digging through menus or lists. They need to see progress, stay motivated, and access key actions quickly. A cluttered or confusing dashboard wastes time and reduces engagement with the platform.

**Goal:** Create a mobile-first dashboard that shows reps exactly what to focus on today, tracks their progress toward weekly goals, celebrates wins, and provides single-tap access to key actions - all in a clean, scannable interface that loads in under 2 seconds.

## 2. Goals

1. Display "Today's Focus" leads prominently with single-tap actions
2. Show pipeline stats (leads researched, contacted, responded) for today and this week
3. Visualize progress toward weekly activity goals with clear, motivating UI
4. Surface recent activity (last 5 actions) for quick context
5. Provide quick action buttons (Research Lead, View All Leads, Settings)
6. Greet user with personalized, contextual messages based on progress and time of day
7. Update dashboard in real-time as user completes actions
8. Show helpful empty state with step-by-step checklist for new users
9. Load dashboard in under 2 seconds on mobile

## 3. User Stories

**As a sales rep**, I want to:
- See my top priorities for today immediately when I open the app
- Know how many leads I've researched and contacted this week
- Feel motivated by seeing my progress and streaks
- Quickly research a new lead or view all my leads with one tap
- See recent activity so I remember where I left off
- Be greeted personally so the app feels like it knows me
- Complete my daily tasks without navigating through multiple screens

**As a product owner**, I want to:
- Drive daily engagement by showing clear, actionable priorities
- Motivate reps with progress tracking and celebration of wins
- Make the app feel personal and motivating, not generic
- Ensure the dashboard works perfectly on mobile (where reps spend most time)
- Track which widgets/actions drive the most engagement

## 4. Functional Requirements

### Dashboard Layout (FR-LAYOUT)

1. The system must display the dashboard as the default landing page after login
2. The system must use a single-column, mobile-first layout
3. The system must include the following sections (top to bottom):
   - Personalized greeting header
   - Today's Focus widget
   - Pipeline stats cards
   - Progress toward weekly goals
   - Recent activity feed
   - Quick action buttons
4. The system must make all sections scrollable on mobile
5. The system must load critical content (greeting, Today's Focus) above the fold
6. The system must lazy load lower sections (recent activity) for performance

### Personalized Greeting (FR-GREETING)

7. The system must greet user by name: "Good morning, [Name]" / "Good afternoon, [Name]" / "Good evening, [Name]"
8. The system must determine time of day based on user's browser timezone
9. The system must show contextual motivational messages based on:
   - **Daily Streak**: "🔥 3 days in a row!" (if user completed activity 3+ consecutive days)
   - **Weekly Progress**: "💪 7/10 leads contacted this week - almost there!" (if nearing goal)
   - **Achievements**: "🎉 First high-priority lead contacted!" (on milestone completion)
   - **Encouragement**: "Today's a fresh start!" (if user hasn't been active recently)
10. The system must rotate motivational messages if multiple apply (show 1 at a time)
11. The system must make greeting collapsible/dismissible on scroll (sticky header behavior)

### Today's Focus Widget (FR-FOCUS)

12. The system must display "Today's Focus" prominently as the first widget
13. The system must show up to 5 high-priority leads (from PRD #0004)
14. For each focus lead, the system must display:
    - Lead name, title, company
    - Priority badge (🔴 HIGH)
    - Top buying signal (e.g., "💰 Just raised $20M")
    - Quick action buttons: [Generate Outreach] [View Details]
15. The system must allow users to mark leads as "Contacted" (checkbox or swipe action)
16. The system must remove contacted leads from Today's Focus immediately
17. The system must show empty state if no focus leads:
    - Message: "No focus leads today - great job staying on top of your pipeline!"
    - CTA: [Research New Leads]
18. The system must link to full focus list if more than 5 leads (show "View All 8 →")

### Pipeline Stats Cards (FR-STATS)

19. The system must display 3 stat cards in a horizontal scrollable row:
    - **Researched**: # of leads researched (Today / This Week)
    - **Contacted**: # of leads contacted (Today / This Week)
    - **Responded**: # of leads that responded (Today / This Week)
20. For each stat card, the system must show:
    - Large number (e.g., "12")
    - Label (e.g., "Researched This Week")
    - Small icon (🔍, ✉️, 💬)
    - Trend indicator: "+3 today" or "+0 today" (optional)
21. The system must make cards tappable to drill down (e.g., tap "Researched" → view researched leads list)
22. The system must calculate stats from `researched_leads` and `lead_actions` tables
23. The system must update stats in real-time when user completes actions

### Progress Toward Weekly Goals (FR-PROGRESS)

24. The system must display progress toward weekly activity goals
25. The system must track these default goals (configurable post-MVP):
    - Research 10 leads per week
    - Contact 5 leads per week
    - Generate 5 outreach messages per week
26. For each goal, the system must display:
    - **Circular progress ring** (e.g., "7/10 researched") OR
    - **Horizontal progress bar** with percentage
27. The system must use both visualization styles:
    - Circular rings for primary goals (researched, contacted)
    - Horizontal bars for secondary goals (outreach generated)
28. The system must color-code progress:
    - On track (≥70%): Green
    - At risk (40-69%): Yellow
    - Behind (<40%): Red
29. The system must celebrate goal completion with visual indicator: "✅ Goal met!"
30. The system must reset weekly goals every Monday at midnight (user's timezone)

### Recent Activity Feed (FR-ACTIVITY)

31. The system must display the last 5 user actions
32. For each activity item, the system must show:
    - Icon (based on action type)
    - Action description: "Researched John Smith @ Acme Corp"
    - Timestamp: "2 hours ago" (relative time)
33. The system must support these action types:
    - Researched lead (🔍)
    - Generated outreach (✉️)
    - Contacted lead (📤)
    - Added to focus (⭐)
34. The system must link activity items to relevant detail pages (tap to view lead)
35. The system must show empty state if no recent activity: "Start by researching your first lead!"

### Quick Action Buttons (FR-ACTIONS)

36. The system must provide prominent quick action buttons:
    - **Research New Lead**: Opens research input (PRD #0003)
    - **View All Leads**: Navigates to full researched leads list
    - **Settings**: Opens settings page
37. The system must make buttons large, finger-friendly (min 48x48px touch target)
38. The system must position quick actions at bottom of viewport (sticky footer) OR below Today's Focus widget
39. The system must use clear icons + labels for accessibility

### Empty State for New Users (FR-EMPTY)

40. The system must detect if user has completed onboarding but has zero researched leads
41. The system must show a welcoming empty state with:
    - **Welcome message**: "Welcome to Trena! Let's get your first leads."
    - **Step-by-step checklist**:
      - ☐ Research your first lead
      - ☐ Generate personalized outreach
      - ☐ Contact your first prospect
    - **Quick tutorial** (optional expandable section):
      - "How Trena Works" (3-4 bullet explainer)
    - **Primary CTA**: [Research Your First Lead]
42. The system must hide empty state once user has 1+ researched leads
43. The system must show partial empty state if user has leads but no focus leads (different messaging)

### Real-Time Updates (FR-REALTIME)

44. The system must update dashboard data in real-time when user:
    - Researches a new lead → increment "Researched" stat, add to activity feed
    - Generates outreach → increment "Outreach Generated" stat, add to activity feed
    - Marks lead as contacted → increment "Contacted" stat, remove from Today's Focus
45. The system must use optimistic UI updates (update immediately, sync with backend)
46. The system must handle sync failures gracefully (revert optimistic update, show toast notification)
47. The system must NOT require page refresh to see updated data

### Data Storage (FR-DATA)

48. The system must create a `user_activity_goals` table:
    - id (UUID, primary key)
    - user_id (foreign key to user_profiles)
    - goal_type (enum: 'research', 'contact', 'outreach')
    - goal_target (integer, default 10 for research, 5 for contact/outreach)
    - week_start_date (date)
    - current_count (integer)
    - goal_met (boolean)
    - created_at, updated_at (timestamps)
49. The system must create a `user_streaks` table:
    - id (UUID, primary key)
    - user_id (foreign key to user_profiles)
    - streak_type (enum: 'daily_activity', 'weekly_contact')
    - current_streak (integer, days)
    - longest_streak (integer, days)
    - last_activity_date (date)
50. The system must query existing tables for dashboard data:
    - `researched_leads` for research stats
    - `lead_actions` for contact/outreach stats
    - `daily_focus` for Today's Focus leads
51. The system must cache dashboard queries for 5 minutes (refresh on user action)

### Performance (FR-PERFORMANCE)

52. The system must load dashboard in under 2 seconds on 3G mobile connection
53. The system must use server-side rendering (SSR) for initial page load
54. The system must lazy load "Recent Activity" and lower sections
55. The system must prefetch Today's Focus data on app launch
56. The system must optimize images/icons (use SVG or optimized PNG)

## 5. Non-Goals (Out of Scope)

The following are explicitly **not** included in this PRD:

- Customizable dashboard layout (drag-and-drop widgets)
- Multiple dashboard views (sales rep vs manager)
- Advanced analytics or charts (revenue trends, conversion funnels)
- Team leaderboards (covered partially in PRD #0007)
- Calendar integration for scheduling
- Notifications center or inbox
- Third-party widget integrations
- Dark mode toggle on dashboard (covered in PRD #0001 Settings)
- Dashboard export (PDF, CSV)
- Historical data comparison (this week vs last week trends)

## 6. Design Considerations

### Visual Design - Dashboard Layout

```
┌─────────────────────────────────────────┐
│ ☰  TRENA                    [Profile]   │  ← Sticky header
├─────────────────────────────────────────┤
│ Good morning, Ryan! 🔥 3 days in a row  │  ← Greeting
├─────────────────────────────────────────┤
│ 🎯 Today's Focus (5 leads)              │
│ ┌─────────────────────────────────────┐ │
│ │ ☐ John Smith - VP Sales             │ │
│ │    Acme Corp • 🔴 HIGH               │ │
│ │    💰 Just raised $20M               │ │
│ │    [Generate Outreach] [View]        │ │
│ ├─────────────────────────────────────┤ │
│ │ ☐ Sarah Lee - CTO                   │ │
│ │    TechStart • 🔴 HIGH               │ │
│ │    👤 New hire (1 month ago)         │ │
│ │    [Generate Outreach] [View]        │ │
│ └─────────────────────────────────────┘ │
│ ... (3 more leads)                      │
├─────────────────────────────────────────┤
│ 📊 Your Week                            │
│ ┌───────┐ ┌───────┐ ┌───────┐          │
│ │  12   │ │   7   │ │   3   │          │
│ │ 🔍    │ │  ✉️   │ │  💬   │          │
│ │Resear │ │Contact│ │Respond│          │
│ │+3 today│ │+2 today│ │+1 today│        │
│ └───────┘ └───────┘ └───────┘          │
├─────────────────────────────────────────┤
│ 📈 Weekly Goals                         │
│ ○○○○○○○●●● 7/10 Researched   (70%) 🟢  │
│ ○○○○○●●●●● 5/5  Contacted    ✅        │
│ ██████░░░░ 6/10 Outreach Gen (60%) 🟡  │
├─────────────────────────────────────────┤
│ ⏱️ Recent Activity                      │
│ • 🔍 Researched John Smith (2h ago)     │
│ • ✉️ Generated outreach for Maria (3h)  │
│ • 📤 Contacted Sarah Lee (5h ago)       │
│ • 🔍 Researched Acme Corp (1d ago)      │
│ • ⭐ Added TechCo to focus (1d ago)     │
├─────────────────────────────────────────┤
│ [🔍 Research New Lead]                  │
│ [📋 View All Leads]  [⚙️ Settings]      │
└─────────────────────────────────────────┘
```

### Empty State - New User

```
┌─────────────────────────────────────────┐
│ ☰  TRENA                    [Profile]   │
├─────────────────────────────────────────┤
│ Welcome to Trena, Ryan! 👋              │
├─────────────────────────────────────────┤
│                                         │
│          🚀                             │
│   Let's get your first leads!           │
│                                         │
│   Here's how to get started:            │
│   ☐ Research your first lead            │
│   ☐ Generate personalized outreach      │
│   ☐ Contact your first prospect         │
│                                         │
│   ▼ How Trena Works                     │
│   • Research buyers with rich data      │
│   • AI creates custom outreach          │
│   • Focus on high-priority leads        │
│                                         │
│   [🔍 Research Your First Lead]         │
│                                         │
└─────────────────────────────────────────┘
```

### Color Scheme for Progress
- **On Track** (≥70%): Green (#22C55E)
- **At Risk** (40-69%): Yellow/Amber (#F59E0B)
- **Behind** (<40%): Red (#EF4444)
- **Completed** (100%): Green with checkmark (✅)

### Mobile Optimizations
- Stack stat cards horizontally (swipeable carousel)
- Use circular progress rings (more compact than bars on mobile)
- Make Today's Focus leads swipeable cards
- Sticky header with collapsible greeting on scroll
- Large touch targets (min 48x48px)
- Bottom action bar for primary CTAs

### UX Flow
1. User logs in → Dashboard loads (SSR)
2. Greeting + Today's Focus appear instantly
3. Stats and progress lazy load (perceived speed)
4. User taps "Generate Outreach" on focus lead
5. Modal opens (PRD #0005)
6. User generates, copies outreach
7. User marks lead as contacted (checkbox)
8. Dashboard updates in real-time (removes from focus, increments "Contacted" stat)
9. Motivational message updates: "💪 1 more contact to hit your weekly goal!"

## 7. Technical Considerations

### Data Fetching Strategy
- **Server-Side Rendering (SSR)**: Fetch critical data (Today's Focus, stats) on server, render HTML
- **Client-Side Hydration**: Make interactive on client load
- **Lazy Loading**: Fetch recent activity and lower sections after initial render
- **SWR/React Query**: Cache dashboard data, revalidate on focus/user action

### Real-Time Updates Implementation
```javascript
// Optimistic update example
function markAsContacted(leadId) {
  // 1. Update UI immediately
  updateLocalState(leadId, { contacted: true });
  removeFr omFocusList(leadId);
  incrementStat('contacted');

  // 2. Sync with backend
  api.markContacted(leadId)
    .catch(err => {
      // 3. Revert on failure
      revertLocalState(leadId);
      showToast('Failed to mark as contacted');
    });
}
```

### Weekly Goals Calculation
```sql
-- Calculate weekly goals progress
SELECT
  goal_type,
  goal_target,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('week', NOW())) as current_count
FROM lead_actions
WHERE user_id = $1 AND action_type IN ('researched', 'contacted', 'generated_outreach')
GROUP BY goal_type;
```

### Streak Calculation
```javascript
// Calculate daily activity streak
function calculateStreak(userId) {
  // Fetch all activity dates for user
  const activityDates = getActivityDates(userId);

  let streak = 0;
  let currentDate = today();

  while (activityDates.includes(currentDate)) {
    streak++;
    currentDate = previousDay(currentDate);
  }

  return streak;
}
```

### Performance Optimizations
- **Database Indexes**:
  ```sql
  CREATE INDEX idx_lead_actions_user_date ON lead_actions(user_id, created_at DESC);
  CREATE INDEX idx_researched_leads_user_date ON researched_leads(user_id, researched_at DESC);
  ```
- **Query Caching**: Use Redis to cache dashboard queries for 5 minutes
- **Pagination**: Limit recent activity to 5 items (no need to fetch all history)
- **Prefetching**: Prefetch Today's Focus on app launch (service worker)

### Database Schema Updates

**user_activity_goals:**
```sql
CREATE TABLE user_activity_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  goal_type TEXT CHECK (goal_type IN ('research', 'contact', 'outreach')),
  goal_target INTEGER NOT NULL,
  week_start_date DATE NOT NULL,
  current_count INTEGER DEFAULT 0,
  goal_met BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, goal_type, week_start_date)
);
```

**user_streaks:**
```sql
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  streak_type TEXT CHECK (streak_type IN ('daily_activity', 'weekly_contact')),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,

  UNIQUE(user_id, streak_type)
);
```

## 8. Success Metrics

**Functional Success:**
1. ✅ Dashboard loads in <2 seconds on mobile
2. ✅ Today's Focus displays 5 leads (if available)
3. ✅ Stats update in real-time when user completes actions
4. ✅ Weekly goals display correctly and reset on Monday
5. ✅ Motivational messages appear based on progress/streaks
6. ✅ Empty state shows for new users with checklist

**Business Success:**
- 90%+ of users visit dashboard daily (primary landing page)
- Users complete at least 1 action from dashboard 70%+ of sessions
- "Today's Focus" leads have 2x higher contact rate than other leads
- Users with active streaks have 3x higher daily engagement
- Empty state converts 60%+ of new users to research first lead

**Technical Success:**
- Dashboard API response time <500ms
- Real-time updates succeed 99%+ of the time
- Zero dashboard crashes or errors
- Lighthouse Performance score >90

## 9. Open Questions

1. **Goal Customization**: Should users be able to set custom weekly goals (e.g., "I want to contact 20/week"), or use defaults?
2. **Time Period Toggle**: Should we add a toggle to switch between "Today" and "This Week" views for stats?
3. **Notifications**: Should we send push notifications when user hasn't checked dashboard by noon?
4. **Widgets Priority**: If screen is small, should we prioritize Today's Focus over stats (hide stats below fold)?
5. **Streak Recovery**: If user breaks a streak, should we show "Your 7-day streak ended - start a new one!" or hide it?
6. **Activity Detail**: Should recent activity items be clickable to view full lead details?
7. **Motivational Copy**: Should motivational messages be more playful/fun vs professional/serious?
8. **Refresh Indicator**: Should we show a visual indicator when dashboard auto-updates (subtle badge or animation)?

---

## Next Steps After Implementation

Once dashboard is complete:
1. Dashboard becomes the central hub for all Trena workflows
2. Gamification data (PRD #0007) will surface on dashboard (badges, achievements)
3. Post-MVP: Add analytics widgets (conversion rates, response rates)
4. Post-MVP: Team leaderboards for competitive reps
5. Post-MVP: Smart recommendations ("Leads similar to your recent wins")
