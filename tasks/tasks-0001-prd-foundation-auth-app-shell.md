# Task List: PRD #0001 - Foundation - Authentication & App Shell

## Relevant Files

### Core Configuration
- `package.json` - Project dependencies and scripts
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `.env.local` - Environment variables (Supabase keys)
- `components.json` - shadcn/ui configuration

### Authentication & Database
- `lib/supabase/client.ts` - Supabase client initialization
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/auth/auth-helpers.ts` - Authentication helper functions
- `lib/auth/middleware.ts` - Authentication middleware
- `types/database.ts` - Database TypeScript types
- `types/auth.ts` - Authentication TypeScript types

### Pages (App Router)
- `app/layout.tsx` - Root layout
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/signup/page.tsx` - Signup page
- `app/(auth)/layout.tsx` - Auth layout (no sidebar)
- `app/(dashboard)/home/page.tsx` - Home/Dashboard page
- `app/(dashboard)/profile/page.tsx` - Profile page
- `app/(dashboard)/settings/page.tsx` - Settings page
- `app/(dashboard)/layout.tsx` - Dashboard layout (with sidebar)

### Components
- `components/ui/*` - shadcn/ui components (button, input, form, etc.)
- `components/sidebar.tsx` - Collapsible sidebar navigation
- `components/theme-provider.tsx` - Theme context provider
- `components/theme-toggle.tsx` - Light/dark mode toggle
- `components/auth/signup-form.tsx` - Signup form component
- `components/auth/login-form.tsx` - Login form component
- `components/auth/password-change-form.tsx` - Password change form
- `components/navigation/nav-link.tsx` - Active navigation link component

### Styles
- `app/globals.css` - Global styles and Tailwind imports

### Notes

- This is a greenfield project (no existing codebase)
- Use Next.js 14+ App Router with TypeScript
- Install dependencies: `next`, `react`, `react-dom`, `@supabase/supabase-js`, `@supabase/ssr`, `tailwindcss`, `next-themes`
- Use `npx shadcn-ui@latest init` to set up shadcn/ui
- Supabase table SQL will be provided in sub-tasks

## Tasks

- [ ] 1.0 Project Setup & Configuration
  - [ ] 1.1 Initialize Next.js 14+ project with TypeScript using `npx create-next-app@latest` (App Router, Tailwind CSS, TypeScript, ESLint)
  - [ ] 1.2 Install core dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `next-themes`
  - [ ] 1.3 Initialize shadcn/ui using `npx shadcn-ui@latest init` (select style, color scheme, etc.)
  - [ ] 1.4 Create project folder structure: `/lib/supabase`, `/lib/auth`, `/types`, `/components/auth`, `/components/navigation`
  - [ ] 1.5 Create `.env.local` file with placeholders for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] 1.6 Configure `next.config.js` for optimized performance (image optimization, minification)
  - [ ] 1.7 Update `.gitignore` to exclude `.env.local` and other sensitive files

- [ ] 2.0 Supabase Configuration & Database Schema
  - [ ] 2.1 Create Supabase project at supabase.com (or use existing) and obtain URL and anon key
  - [ ] 2.2 Add Supabase URL and anon key to `.env.local`
  - [ ] 2.3 Enable Email Auth provider in Supabase dashboard (Authentication > Providers > Email)
  - [ ] 2.4 Create `user_profiles` table using Supabase SQL Editor with schema: id (UUID, PK, references auth.users), email (TEXT UNIQUE NOT NULL), name (TEXT), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)
  - [ ] 2.5 Set up Row Level Security (RLS) policies: Enable RLS on `user_profiles`, add policy "Users can view own profile" (SELECT), add policy "Users can update own profile" (UPDATE)
  - [ ] 2.6 Create database trigger to auto-create `user_profiles` record when user signs up (on `auth.users` INSERT)
  - [ ] 2.7 Create `lib/supabase/client.ts` for client-side Supabase initialization
  - [ ] 2.8 Create `lib/supabase/server.ts` for server-side Supabase client (using cookies)
  - [ ] 2.9 Create `types/database.ts` with TypeScript interfaces for `UserProfile` matching table schema

- [ ] 3.0 Authentication System Implementation
  - [ ] 3.1 Create `lib/auth/auth-helpers.ts` with functions: `signUp(email, password)`, `signIn(email, password)`, `signOut()`, `getCurrentUser()`
  - [ ] 3.2 Create `types/auth.ts` with types for auth state, errors, and user session
  - [ ] 3.3 Build `app/(auth)/layout.tsx` - layout without sidebar for auth pages, redirects authenticated users to /home
  - [ ] 3.4 Build `components/auth/signup-form.tsx` - form with email/password validation (min 8 chars), error handling, loading states
  - [ ] 3.5 Build `app/(auth)/signup/page.tsx` - signup page using signup form component
  - [ ] 3.6 Build `components/auth/login-form.tsx` - login form with email/password, error handling
  - [ ] 3.7 Build `app/(auth)/login/page.tsx` - login page using login form component
  - [ ] 3.8 Create `lib/auth/middleware.ts` - authentication middleware to protect dashboard routes
  - [ ] 3.9 Implement session persistence using Supabase's built-in session management
  - [ ] 3.10 Test signup flow: create account, verify user in Supabase dashboard, verify `user_profiles` record created
  - [ ] 3.11 Test login flow: log in, verify redirect to /home, verify session persists on refresh
  - [ ] 3.12 Test logout flow: log out, verify redirect to /login, verify session cleared

- [ ] 4.0 App Shell & Navigation
  - [ ] 4.1 Install shadcn/ui components needed: `npx shadcn-ui@latest add button sheet`
  - [ ] 4.2 Create `components/sidebar.tsx` - collapsible sidebar with logo, nav links (Home, Profile, Settings), logout button
  - [ ] 4.3 Implement sidebar collapse/expand functionality (icon for collapsed, full text for expanded)
  - [ ] 4.4 Add responsive behavior: auto-collapse on mobile (<768px), expandable on desktop (≥768px)
  - [ ] 4.5 Create `components/navigation/nav-link.tsx` - navigation link component that highlights active route using `usePathname()`
  - [ ] 4.6 Create `app/(dashboard)/layout.tsx` - layout with sidebar for authenticated pages, includes auth check and redirect if not logged in
  - [ ] 4.7 Style sidebar with Tailwind CSS: proper spacing, hover states, active states, smooth transitions
  - [ ] 4.8 Add logout functionality to sidebar logout button (calls `signOut()` and redirects to /login)
  - [ ] 4.9 Test sidebar collapse/expand on desktop
  - [ ] 4.10 Test sidebar behavior on mobile (hamburger menu or icon-only)
  - [ ] 4.11 Test navigation between Home, Profile, Settings pages
  - [ ] 4.12 Test active link highlighting

- [ ] 5.0 Core Pages (Home, Profile, Settings)
  - [ ] 5.1 Create `app/(dashboard)/home/page.tsx` - dashboard/home page with welcome message, displays user's name
  - [ ] 5.2 Fetch current user data in home page using `getCurrentUser()` helper
  - [ ] 5.3 Create `app/(dashboard)/profile/page.tsx` - profile page showing user email, name, account created date
  - [ ] 5.4 Fetch user profile data from `user_profiles` table in profile page
  - [ ] 5.5 Create `app/(dashboard)/settings/page.tsx` - settings page layout with sections: Profile Info, Password, Preferences
  - [ ] 5.6 Add profile information display section in Settings (name, email) with edit capability
  - [ ] 5.7 Create `components/auth/password-change-form.tsx` - form to change password (current password, new password, confirm password)
  - [ ] 5.8 Implement password change functionality using Supabase's `updateUser()` method
  - [ ] 5.9 Add preferences section in Settings with theme toggle and notification preferences placeholders
  - [ ] 5.10 Test all pages load successfully after authentication
  - [ ] 5.11 Test profile data displays correctly on Profile and Settings pages
  - [ ] 5.12 Test password change functionality
  - [ ] 5.13 Test that unauthenticated access to these pages redirects to login

- [ ] 6.0 Theme System & Design Polish
  - [ ] 6.1 Create `components/theme-provider.tsx` - theme context provider using `next-themes`
  - [ ] 6.2 Wrap app with theme provider in `app/layout.tsx`
  - [ ] 6.3 Create `components/theme-toggle.tsx` - toggle button for light/dark mode
  - [ ] 6.4 Add theme toggle to Settings page in preferences section
  - [ ] 6.5 Configure Tailwind CSS dark mode in `tailwind.config.ts` (class strategy)
  - [ ] 6.6 Update `app/globals.css` with CSS custom properties for light/dark theme colors
  - [ ] 6.7 Apply theme-aware styles to all components (background, text, borders adjust with theme)
  - [ ] 6.8 Ensure all interactive elements (buttons, links, inputs) have clear hover and active states
  - [ ] 6.9 Test light mode appearance across all pages
  - [ ] 6.10 Test dark mode appearance across all pages
  - [ ] 6.11 Test theme preference persistence (refresh page, theme remains)
  - [ ] 6.12 Test responsive design on mobile (viewport <768px) and desktop (≥768px)
  - [ ] 6.13 Optimize bundle size: review imports, use dynamic imports for heavy components
  - [ ] 6.14 Run Lighthouse audit: verify Performance score >90, page load <2s
  - [ ] 6.15 Fix any accessibility issues identified by Lighthouse
