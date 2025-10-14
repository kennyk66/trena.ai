
# PRD #0001: Foundation - Authentication & App Shell

## 1. Introduction/Overview

This PRD defines the foundational layer for Trena.ai - a sales enablement platform that helps sales reps research buyers, generate personalized outreach, and prioritize leads. This foundation provides the authentication system, core application structure, and basic navigation that all future features will build upon.

**Problem it solves:** Before any sales-focused features can be implemented, users need a secure way to create accounts, log in, and navigate a mobile-first application structure.

**Goal:** Build a production-ready authentication system and responsive app shell that serves as the foundation for all Trena.ai MVP features.

## 2. Goals

1. Enable users to securely sign up and log in using email/password authentication
2. Provide a mobile-first, responsive app shell with collapsible sidebar navigation
3. Establish basic routing structure for Home, Settings, and Profile pages
4. Set up design system foundation using Tailwind CSS + shadcn/ui
5. Create a fast-loading (<2s) application with smooth navigation
6. Prepare database schema for user profiles using Supabase

## 3. User Stories

**As a sales rep**, I want to:
- Sign up for Trena.ai with my email and password so that I can access the platform
- Log in to my account securely so that I can use the sales tools
- Navigate between different sections of the app easily on my mobile device
- Access my profile settings to update my information
- Have a responsive interface that works on both my phone and desktop

**As a product owner**, I want to:
- Ensure the foundation is scalable and can support future MVP features
- Have users complete authentication before accessing any features
- Track when users create accounts and last logged in

## 4. Functional Requirements

### Authentication (FR-AUTH)
1. The system must allow users to sign up with email and password
2. The system must validate email format during sign up
3. The system must enforce minimum 8-character password requirement
4. The system must prevent duplicate email registrations
5. The system must allow users to log in with email and password
6. The system must provide logout functionality
7. The system must maintain user session state across page refreshes
8. The system must redirect unauthenticated users to the login page
9. The system must redirect authenticated users away from login/signup pages to the home page

### App Shell & Navigation (FR-NAV)
10. The system must provide a collapsible sidebar navigation on desktop (≥768px width)
11. The system must auto-collapse sidebar to icon-only mode on mobile (<768px width)
12. The sidebar must include navigation links to: Home, Profile, Settings
13. The sidebar must include a logout button
14. The system must highlight the currently active page in the navigation
15. The system must be fully responsive across mobile and desktop breakpoints

### Pages & Routing (FR-PAGES)
16. The system must provide a Home/Dashboard page (accessible post-login)
17. The system must provide a Settings page with:
    - Profile information display (name, email)
    - Password change functionality
    - Account preferences (theme toggle: light/dark, notification preferences)
18. The system must provide a Profile page showing user basic information
19. All pages must load in under 2 seconds on standard connections

### Database (FR-DB)
20. The system must create a `user_profiles` table in Supabase with fields:
    - id (UUID, primary key)
    - email (unique, not null)
    - name (text)
    - created_at (timestamp)
    - updated_at (timestamp)
21. The system must automatically create a user profile record when a user signs up

### Design System (FR-DESIGN)
22. The system must use Tailwind CSS for styling
23. The system must integrate shadcn/ui component library
24. The system must support light and dark theme modes
25. All interactive elements must have clear hover and active states

## 5. Non-Goals (Out of Scope)

The following are explicitly **not** included in this PRD:

- Detailed 7-step onboarding flow (covered in PRD #0002)
- OAuth login (Google, LinkedIn) - email/password only for now
- Password reset/forgot password functionality (can be added later)
- Multi-role user management (admin, manager) - single role (sales rep) only
- PWA features (installable, offline-capable) - may add later
- Email verification on signup
- Two-factor authentication
- User profile photos/avatars
- Any sales-specific features (buyer research, outreach, etc.)

## 6. Design Considerations

### Component Library
- Use **shadcn/ui** components for buttons, inputs, forms, navigation
- Customize theme tokens for Trena.ai brand (colors, spacing, typography)

### Navigation Structure
```
Sidebar (Collapsible):
├─ Trena.ai Logo (top)
├─ Home
├─ Profile
├─ Settings
└─ Logout (bottom)
```

### Responsive Behavior
- **Mobile (<768px)**: Sidebar collapses to icon-only or hamburger menu
- **Desktop (≥768px)**: Sidebar expands with text labels, collapsible via toggle

### Theme Support
- Light mode (default)
- Dark mode (toggle in Settings)
- Persist theme preference in local storage or user preferences

## 7. Technical Considerations

### Tech Stack
- **Frontend**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v3+
- **Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel (recommended for Next.js)

### Supabase Setup
- Use Supabase client library (`@supabase/supabase-js`)
- Configure Row Level Security (RLS) policies:
  - Users can only read/update their own profile
  - Prevent unauthorized access to user data
- Enable Supabase Auth email provider

### Project Structure (Suggested)
```
/app
  /(auth)
    /login
    /signup
  /(dashboard)
    /home
    /profile
    /settings
  /layout.tsx
/components
  /ui (shadcn components)
  /sidebar.tsx
  /theme-provider.tsx
/lib
  /supabase.ts
  /auth.ts
/types
  /database.ts
```

### Performance
- Use Next.js App Router for automatic code splitting
- Implement lazy loading for non-critical components
- Optimize initial bundle size to meet <2s load time

## 8. Success Metrics

**Functional Success:**
1. ✅ User can sign up with email/password
2. ✅ User can log in successfully
3. ✅ User can navigate between Home, Profile, Settings pages
4. ✅ User can log out
5. ✅ User can change password
6. ✅ User can toggle theme (light/dark)
7. ✅ Sidebar collapses/expands correctly on mobile and desktop

**Performance Success:**
- Page load time < 2 seconds (measured via Lighthouse)
- Lighthouse Performance score > 90
- Mobile-friendly (Google Mobile-Friendly Test passes)

**Technical Success:**
- All Supabase RLS policies correctly restrict data access
- Authentication state persists across page refreshes
- No console errors or warnings in production build

## 9. Open Questions

1. **Brand Identity**: What are the Trena.ai brand colors, logo, and typography preferences?
2. **Error Handling**: What level of error messaging detail should be shown to users (e.g., "Invalid credentials" vs specific error codes)?
3. **Session Duration**: How long should user sessions last before requiring re-login?
4. **Home Page Content**: Since detailed onboarding is in PRD #0002, should the Home page show a placeholder/welcome message or immediately redirect to onboarding after first login?
5. **Analytics**: Should we integrate analytics (PostHog, Mixpanel) from day one to track user behavior?
6. **Email Provider**: Does Supabase's default email provider meet needs, or should we configure a custom SMTP provider?

---

## Next Steps After Implementation

Once this foundation is complete:
1. Implement PRD #0002: Detailed Onboarding Flow
2. Begin work on core sales features (buyer research, lead prioritization, outreach generation)
