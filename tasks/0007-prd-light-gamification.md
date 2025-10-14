# PRD #0007: Light Gamification

## 1. Introduction/Overview

This PRD defines the Light Gamification system that motivates sales reps through badges, streaks, and progress tracking. The system celebrates small wins, builds daily habits, and keeps reps engaged with the platform through playful, fun rewards that feel encouraging rather than gimmicky.

**Problem it solves:** Sales can be a grind. Reps face constant rejection, quota pressure, and burnout. Without positive reinforcement, they lose motivation and engagement drops. Generic productivity tools don't celebrate progress or build habits effectively.

**Goal:** Create a lightweight gamification layer that celebrates wins (big and small), builds daily contact streaks, and motivates reps to stay engaged with Trena through fun badges and encouraging progress tracking - all while keeping the tone playful but not distracting from core sales work.

## 2. Goals

1. Celebrate user achievements with badges for research, contact, and streak milestones
2. Build daily contact habits through visible streak tracking
3. Show progress toward next badge to keep users motivated ("2 more to go!")
4. Display badges and streaks on Dashboard and Profile page
5. Create delightful moments with confetti animations and toast notifications when badges are earned
6. Track longest streaks to motivate users even after breaking a streak
7. Keep gamification lightweight - enhance the experience without overwhelming users
8. Focus on quality milestones (not quantity spam) to maintain meaningfulness

## 3. User Stories

**As a sales rep**, I want to:
- Earn badges when I hit milestones so I feel recognized for my effort
- See my daily contact streak so I'm motivated to keep it going
- Know how close I am to my next badge so I have a short-term goal
- Celebrate wins (even small ones) so sales feels less like a grind
- See my badge collection on my profile so I can track progress over time
- Feel encouraged when I break a streak (not punished) so I start fresh

**As a product owner**, I want to:
- Increase daily engagement through streak mechanics
- Reduce churn by making the app more fun and rewarding
- Drive key behaviors (researching leads, contacting prospects) through achievement incentives
- Keep gamification subtle and professional (not childish or distracting)
- Track which badges/achievements drive the most engagement

## 4. Functional Requirements

### Badge System (FR-BADGES)

**Badge List (MVP):**
1. The system must include these 5 badges:
   - **🔍 First Steps**: Research your first lead
   - **🔬 Research Pro**: Research 5 leads
   - **📤 First Contact**: Contact your first lead
   - **💪 Outreach Warrior**: Contact 5 leads
   - **🔥 Week Streak**: Contact at least 1 lead for 7 days in a row
2. The system must store badge definitions in a `badges` table with:
   - badge_id (unique identifier)
   - badge_name (e.g., "First Steps")
   - badge_description (e.g., "Research your first lead")
   - badge_icon (emoji or icon identifier)
   - unlock_criteria (json: {type: 'research_count', target: 1})
   - badge_tier (enum: 'bronze', 'silver', 'gold') - for future expansion
3. The system must automatically check badge unlock criteria after every user action
4. The system must award badges instantly when criteria are met

**Badge Unlocking:**
5. The system must track user badge progress in `user_badges` table:
   - user_id, badge_id
   - unlocked (boolean)
   - unlocked_at (timestamp, nullable)
   - progress (integer, current progress toward unlock)
6. The system must prevent duplicate badge awards (once unlocked, stays unlocked)
7. The system must trigger unlock check on these actions:
   - Lead researched → check research-based badges
   - Lead contacted → check contact-based badges
   - Daily streak updated → check streak-based badges

**Badge Display:**
8. The system must show badge progress on Dashboard:
   - Widget title: "Your Progress" or "Achievements"
   - Show next unlockable badge with progress: "🔬 Research Pro: 3/5 leads"
   - Show recently earned badges (last 3): "🎉 Recently Earned: [badge icons]"
9. The system must show full badge collection on Profile page:
   - List view with badge name, description, unlock date
   - Unlocked badges: Full color with "Earned on [date]"
   - Locked badges: Grayed out with progress indicator "2/5 - Keep going!"
10. The system must sort badges by: Earned (recent first), then Locked (closest to unlock)

### Streak System (FR-STREAKS)

**Daily Contact Streak:**
11. The system must track daily contact streak (consecutive days with at least 1 lead contacted)
12. The system must increment streak when user contacts a lead on a new day (based on user's timezone)
13. The system must reset streak to 0 if user goes 24+ hours without contacting a lead
14. The system must store streak data in `user_streaks` table (from PRD #0006):
    - current_streak (integer, days)
    - longest_streak (integer, days)
    - last_activity_date (date)
15. The system must update longest_streak if current_streak exceeds it

**Streak Display:**
16. The system must show current streak on Dashboard:
    - Prominent display: "🔥 7-Day Streak - Keep it going!"
    - Visual indicator: flame emoji + number
17. The system must show streak on Profile page with details:
    - Current streak: "🔥 7 days"
    - Longest streak: "🏆 Longest: 14 days"
    - Encouragement: "You're on fire!" or "Keep going!"
18. The system must show encouraging message when streak is broken:
    - "Your 7-day streak ended - but your longest is still 7 days! Start fresh today 💪"
    - Include [Contact a Lead Now] CTA

**Streak Recovery:**
19. The system must preserve longest_streak even when current_streak resets
20. The system must NOT implement streak freeze or grace periods in MVP (keep simple)
21. The system must celebrate when user beats their longest streak:
    - "🎉 New record! 8-day streak beats your previous best of 7!"

### Notifications & Celebrations (FR-NOTIFICATIONS)

**Badge Unlock Notification:**
22. The system must show a celebration modal when user unlocks a badge:
    - Confetti animation (JS library like canvas-confetti)
    - Badge icon (large, centered)
    - Badge name: "🎉 Badge Earned: First Steps!"
    - Badge description: "You researched your first lead"
    - [Awesome!] or [Continue] button to dismiss
23. The system must show modal immediately after action that triggered unlock (inline in flow)
24. The system must play a subtle sound effect (optional, user can disable in settings)
25. The system must also show a toast notification for minor badges:
    - Small popup in top-right: "🎉 Badge earned: Research Pro"
    - Auto-dismisses after 5 seconds

**Streak Milestone Notification:**
26. The system must show toast notification when user extends their streak:
    - "🔥 3-day streak! Keep it going!"
27. The system must show celebration modal for major streak milestones:
    - 7-day streak (unlocks badge)
    - 14-day streak (future badge)
    - 30-day streak (future badge)
28. The system must NOT send push notifications for gamification in MVP (in-app only)

### Progress Tracking (FR-PROGRESS)

**Next Badge Progress:**
29. The system must determine "next badge" for user (closest to unlock, not yet earned)
30. The system must show progress toward next badge on Dashboard:
    - "🔬 Research Pro: 3/5 leads researched"
    - Progress bar (60% filled)
31. The system must update progress in real-time as user completes actions
32. The system must show encouraging copy:
    - "Almost there! 2 more to go"
    - "Keep going!"
    - "You've got this!"

**Historical Progress:**
33. The system must show total stats on Profile page:
    - Total badges earned: "5/5" (in MVP, eventually "5/15" as more badges added)
    - Current streak: "🔥 7 days"
    - Longest streak: "🏆 14 days"
    - Total leads researched: "23"
    - Total leads contacted: "12"

### Data Storage (FR-DATA)

34. The system must create a `badges` table:
    - id (UUID, primary key)
    - badge_name (text)
    - badge_description (text)
    - badge_icon (text, emoji or icon reference)
    - unlock_criteria (jsonb, e.g., {type: 'research_count', target: 5})
    - badge_tier (enum: 'bronze', 'silver', 'gold', nullable)
    - display_order (integer)
    - created_at (timestamp)
35. The system must create a `user_badges` table:
    - id (UUID, primary key)
    - user_id (foreign key to user_profiles)
    - badge_id (foreign key to badges)
    - unlocked (boolean, default false)
    - progress (integer, default 0)
    - unlocked_at (timestamp, nullable)
    - created_at (timestamp)
    - UNIQUE(user_id, badge_id)
36. The system must use existing `user_streaks` table from PRD #0006
37. The system must seed `badges` table with 5 MVP badges on deployment

### Badge Unlock Logic (FR-LOGIC)

**Unlock Criteria Evaluation:**
38. The system must implement badge unlock checker function:
    ```
    checkBadgeUnlock(userId, actionType, actionData):
      - Fetch relevant badge criteria (type matches actionType)
      - Calculate user progress
      - If progress >= target AND badge not unlocked:
        - Mark badge as unlocked
        - Set unlocked_at timestamp
        - Trigger celebration notification
    ```
39. The system must support these criteria types:
    - `research_count`: User researched X leads
    - `contact_count`: User contacted X leads
    - `streak_days`: User maintained X-day streak
40. The system must query `researched_leads` and `lead_actions` tables for counts
41. The system must run unlock checks asynchronously (don't block user action)

**Progress Updates:**
42. The system must update `user_badges.progress` after every relevant action:
    - Lead researched → update progress for research-based badges
    - Lead contacted → update progress for contact-based badges
43. The system must calculate progress dynamically (don't cache stale data)

## 5. Non-Goals (Out of Scope)

The following are explicitly **not** included in this PRD:

- Points/levels system (e.g., "Level 5 Sales Rep")
- Leaderboards or team competition
- Social sharing (LinkedIn, Twitter badge posts)
- Badge trading or gifting
- Virtual rewards (coins, avatars, customization)
- Advanced streak mechanics (streak freeze, recovery, multipliers)
- Challenge system (weekly challenges, quests)
- More than 5 badges in MVP (expandable post-launch)
- External gamification integrations
- User-created badges or custom achievements
- Email notifications for achievements

## 6. Design Considerations

### Visual Design - Badge Celebration Modal

```
┌─────────────────────────────────────────┐
│                                         │
│          🎉 ✨ 🎊                       │
│                                         │
│            🔬                           │
│       (Large Badge Icon)                │
│                                         │
│      Badge Earned!                      │
│      Research Pro                       │
│                                         │
│  You've researched 5 leads.             │
│  Keep exploring your pipeline!          │
│                                         │
│         [Awesome! 🎉]                   │
│                                         │
└─────────────────────────────────────────┘
```

### Dashboard Widget - Achievements

```
┌─────────────────────────────────────────┐
│ 🏆 Your Progress                        │
├─────────────────────────────────────────┤
│ Next Badge:                             │
│ 🔬 Research Pro                         │
│ ████████░░ 4/5 leads - Almost there!    │
│                                         │
│ Recently Earned:                        │
│ 🔍 📤 (2 badges)                        │
│                                         │
│ Current Streak: 🔥 7 days               │
│ [View All Badges →]                     │
└─────────────────────────────────────────┘
```

### Profile Page - Badge Collection

```
┌─────────────────────────────────────────┐
│ Your Badges (3/5 earned)                │
├─────────────────────────────────────────┤
│ ✅ 🔍 First Steps                       │
│    Research your first lead             │
│    Earned on Dec 1, 2024                │
├─────────────────────────────────────────┤
│ ✅ 📤 First Contact                     │
│    Contact your first lead              │
│    Earned on Dec 2, 2024                │
├─────────────────────────────────────────┤
│ ✅ 🔥 Week Streak                       │
│    7-day contact streak                 │
│    Earned on Dec 8, 2024                │
├─────────────────────────────────────────┤
│ 🔒 🔬 Research Pro (4/5)                │
│    Research 5 leads - Keep going!       │
├─────────────────────────────────────────┤
│ 🔒 💪 Outreach Warrior (2/5)            │
│    Contact 5 leads - You've got this!   │
└─────────────────────────────────────────┘
```

### Toast Notification

```
┌─────────────────────────────┐
│ 🎉 Badge earned:            │
│    Research Pro             │
│              [x] Dismiss     │
└─────────────────────────────┘
```

### Confetti Animation
- Use `canvas-confetti` library
- Trigger on badge unlock modal open
- Duration: 2-3 seconds
- Colors: Match Trena brand (avoid garish rainbow)
- Subtle sound effect (optional, disable in settings)

### UX Flow
1. User contacts a lead (their 5th contact)
2. System checks badge unlock criteria
3. Detects "Outreach Warrior" badge unlocked
4. Immediately shows celebration modal with confetti
5. User clicks "Awesome!"
6. Modal closes, badge added to collection
7. Dashboard widget updates: "Recently Earned: 💪"
8. Profile page shows badge with unlock date

### Mobile Optimization
- Full-screen celebration modal on mobile
- Large badge icon (96x96px minimum)
- Touch-friendly "Awesome!" button
- Progress bars clearly visible on small screens
- Toast notifications positioned top-center (mobile-friendly)

## 7. Technical Considerations

### Badge Unlock Checker Implementation

**Pseudocode:**
```javascript
async function checkBadgeUnlocks(userId, actionType) {
  // 1. Fetch relevant badges
  const badges = await getBadgesByActionType(actionType);

  for (const badge of badges) {
    // 2. Check if user already unlocked
    const userBadge = await getUserBadge(userId, badge.id);
    if (userBadge.unlocked) continue;

    // 3. Calculate progress
    const progress = await calculateProgress(userId, badge.unlock_criteria);

    // 4. Update progress
    await updateBadgeProgress(userId, badge.id, progress);

    // 5. Check if unlocked
    if (progress >= badge.unlock_criteria.target) {
      await unlockBadge(userId, badge.id);
      await sendCelebrationNotification(userId, badge);
    }
  }
}

async function calculateProgress(userId, criteria) {
  switch (criteria.type) {
    case 'research_count':
      return await countResearchedLeads(userId);
    case 'contact_count':
      return await countContactedLeads(userId);
    case 'streak_days':
      return await getCurrentStreak(userId);
  }
}
```

### Streak Tracking Logic

**Daily Streak Update:**
```javascript
async function updateStreak(userId, contactDate) {
  const streak = await getUserStreak(userId);
  const lastDate = streak.last_activity_date;
  const daysDiff = dateDiff(lastDate, contactDate);

  if (daysDiff === 1) {
    // Consecutive day - increment streak
    streak.current_streak += 1;
    if (streak.current_streak > streak.longest_streak) {
      streak.longest_streak = streak.current_streak;
    }
  } else if (daysDiff > 1) {
    // Streak broken - reset
    streak.current_streak = 1;
  }
  // daysDiff === 0 means same day, no change

  streak.last_activity_date = contactDate;
  await saveStreak(userId, streak);

  // Check if streak milestone reached (7, 14, 30 days)
  if (streak.current_streak % 7 === 0) {
    await checkBadgeUnlocks(userId, 'streak_milestone');
  }
}
```

### Performance Optimizations
- **Async Badge Checks**: Run badge unlock checks in background job (don't block user action)
- **Cache Badge Definitions**: Load all badges into memory on app start (only 5-10 badges)
- **Batch Progress Updates**: Update multiple badge progress in single query
- **Debounce Notifications**: If user unlocks multiple badges rapidly, queue notifications

### Database Schema

**badges table:**
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  unlock_criteria JSONB NOT NULL,
  badge_tier TEXT CHECK (badge_tier IN ('bronze', 'silver', 'gold')),
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed MVP badges
INSERT INTO badges (badge_name, badge_description, badge_icon, unlock_criteria, display_order) VALUES
('First Steps', 'Research your first lead', '🔍', '{"type":"research_count","target":1}', 1),
('Research Pro', 'Research 5 leads', '🔬', '{"type":"research_count","target":5}', 2),
('First Contact', 'Contact your first lead', '📤', '{"type":"contact_count","target":1}', 3),
('Outreach Warrior', 'Contact 5 leads', '💪', '{"type":"contact_count","target":5}', 4),
('Week Streak', 'Contact at least 1 lead for 7 days in a row', '🔥', '{"type":"streak_days","target":7}', 5);
```

**user_badges table:**
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  badge_id UUID REFERENCES badges(id) NOT NULL,
  unlocked BOOLEAN DEFAULT false,
  progress INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges ON user_badges(user_id, unlocked);
```

### Celebration Modal Component

```jsx
function BadgeCelebrationModal({ badge, onClose }) {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    playSound('badge-unlock.mp3'); // Optional
  }, []);

  return (
    <Modal>
      <ConfettiCanvas />
      <BadgeIcon icon={badge.icon} size="large" />
      <Title>Badge Earned!</Title>
      <BadgeName>{badge.name}</BadgeName>
      <Description>{badge.description}</Description>
      <Button onClick={onClose}>Awesome! 🎉</Button>
    </Modal>
  );
}
```

## 8. Success Metrics

**Functional Success:**
1. ✅ All 5 MVP badges unlock correctly when criteria met
2. ✅ Badge celebration modal displays with confetti
3. ✅ Streak increments/resets correctly based on daily contact
4. ✅ Progress toward next badge updates in real-time
5. ✅ Profile page shows all badges with unlock status

**Business Success:**
- Users with active streaks have 2x higher daily engagement than those without
- 80%+ of users unlock at least 1 badge in first week
- Badge unlock rate: 60%+ of users unlock "First Contact" within 3 days of signup
- Streak retention: 40%+ of users maintain 7+ day streak within first month
- Users who unlock badges have 30% lower churn rate

**Technical Success:**
- Badge unlock checks complete in <500ms
- Zero duplicate badge awards
- Celebration modal renders smoothly on mobile
- Confetti animation performs well (60fps)

## 9. Open Questions

1. **Sound Effects**: Should we add subtle sound effects for badge unlocks, or is visual celebration enough?
2. **Notification Settings**: Should users be able to disable celebration modals (only show toasts)?
3. **Badge Expansion**: What badges should be added post-MVP? (10 Researched, 20 Contacted, 30-day Streak, etc.)
4. **Tier System**: Should badges have bronze/silver/gold tiers for visual hierarchy?
5. **Streak Definition**: Should "daily contact" mean contacted 1 lead, or a minimum of 3-5 leads per day?
6. **Grace Period**: Should we add 1-day grace period for streaks (e.g., if user contacts on Monday and Wednesday, Tuesday is forgiven)?
7. **Badge Rarity**: Should some badges be harder to unlock to make them feel more special?
8. **Sharing**: Post-MVP, should users be able to share badges on LinkedIn or social media?

---

## Next Steps After Implementation

Once light gamification is complete:
1. All 7 MVP PRDs are done - ready to build!
2. Monitor badge unlock rates and adjust criteria if needed
3. Post-MVP: Add more badges (10-15 total)
4. Post-MVP: Add team leaderboards for competitive reps
5. Post-MVP: Integrate gamification with CRM (track actual deals closed, revenue)
6. Post-MVP: Badge sharing on LinkedIn ("Just earned my Week Streak badge on Trena!")

---

## MVP Complete! 🎉

All 7 PRDs are now ready:
- PRD #0001: Foundation (Auth & App Shell)
- PRD #0002: Onboarding & Profile Learning
- PRD #0003: Buyer Research Agent
- PRD #0004: Lead Prioritization
- PRD #0005: Outreach Generation Agent
- PRD #0006: Dashboard - Daily Priorities View
- PRD #0007: Light Gamification

**Recommended Build Order:**
1. Foundation (0001) - Must be first
2. Onboarding (0002) - Captures critical user data
3. Buyer Research (0003) - Core value prop
4. Lead Prioritization (0004) - Uses research data
5. Outreach Generation (0005) - Uses research + prioritization
6. Dashboard (0006) - Brings everything together
7. Gamification (0007) - Final layer of engagement
