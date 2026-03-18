---
id: TASK-32
title: Business owner authentication with Google OAuth and email allowlist
status: Done
assignee: []
created_date: '2026-03-16 18:16'
updated_date: '2026-03-17 07:22'
labels:
  - auth
dependencies: []
references:
  - apps/business/src/pages/LandingPage.tsx
  - apps/business/src/pages/DashboardPage.tsx
  - apps/business/src/services/saveToSupabase.ts
  - apps/business/src/lib/supabase.ts
  - apps/business/src/App.tsx
priority: high
ordinal: 27000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Business owners currently have no way to log in — routes are open, the landing page uses a hardcoded stub name, and the dashboard just loads the first business in the database. This task gates access to a curated allowlist and lets invited owners sign in with Google, picking up their own business data after login.

The user (operator) manually inserts email rows into an `allowed_emails` table in Supabase to invite specific business owners. Those owners click "Continue with Google" on the landing page, go through Google OAuth, and are routed to onboarding (if new) or their dashboard (if returning). Uninvited accounts are signed out with an error message.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Supabase migration creates an `allowed_emails (email text primary key)` table
- [ ] #2 Supabase migration adds `owner_id uuid references auth.users(id)` to the `businesses` table
- [ ] #3 RLS on `allowed_emails` allows authenticated users to select only their own row
- [ ] #4 RLS on `businesses` scopes all operations to rows where `owner_id = auth.uid()`
- [ ] #5 LandingPage 'Continue with Google' button triggers real Google OAuth via `supabase.auth.signInWithOAuth`
- [ ] #6 After OAuth callback, app checks if the signed-in email exists in `allowed_emails`
- [ ] #7 If email is not in the allowlist, user is signed out and sees an inline error message
- [ ] #8 If email is in the allowlist and the user has no business yet, they are navigated to `/onboarding`
- [ ] #9 If email is in the allowlist and the user already has a business, they are navigated to `/dashboard`
- [ ] #10 All routes except `/` are wrapped in a ProtectedRoute that redirects unauthenticated users to `/`
- [ ] #11 ProtectedRoute shows nothing (or a loading state) while session is being resolved — no flash of content
- [ ] #12 `saveToSupabase` includes `owner_id` set to the current user's id when inserting a business
- [ ] #13 DashboardPage fetches the business filtered by `owner_id = current user id`, not just the first row
- [ ] #14 Navigating to a protected route while logged out redirects to `/`
<!-- AC:END -->
