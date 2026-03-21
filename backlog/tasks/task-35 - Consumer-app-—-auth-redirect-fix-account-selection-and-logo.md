---
id: TASK-35
title: 'Consumer app — auth redirect fix, account selection, and logo'
status: In Progress
assignee: []
created_date: '2026-03-21 00:00'
updated_date: '2026-03-21 08:12'
labels: []
dependencies: []
references:
  - apps/consumer/src/pages/DashboardPage.tsx
  - apps/consumer/src/pages/AuthCallbackPage.tsx
  - apps/consumer/src/components/EnrollPromptDrawer.tsx
  - apps/consumer/src/hooks/useBusiness.ts
priority: high
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Three consumer app improvements needed:

**1. Auth redirect — production redirect goes to localhost**
On production, after Google OAuth, users land on `http://localhost:3000/#access_token=...` instead of the consumer app. Root cause: Supabase's Site URL is still `localhost:3000`, so when `redirectTo: https://go.joinenroll.app/auth/callback` isn't in the allowed redirect URLs list, Supabase falls back to the Site URL. Requires both a Supabase config fix (manual) and a code change to preserve and restore the user's full URL across the OAuth redirect.

**2. Google account selection**
When a user has multiple Gmail accounts they should see the account picker. `prompt: 'select_account'` is already set in `DashboardPage.handleGoogleEnroll` — verify it is present at all OAuth entry points and deploy.

**3. Business logo with initials fallback**
The logo circle in `DashboardPage` already loads `business.logo_url` with an initials fallback. Add the same logo circle to `EnrollPromptDrawer` (currently only shows the cover image). Verify that an uploaded logo_url loads correctly end-to-end.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Supabase Site URL updated to `https://go.joinenroll.app`
- [ ] #2 `https://go.joinenroll.app/auth/callback` added to Supabase allowed redirect URLs
- [ ] #3 After OAuth, user is redirected back to their original URL (not just `/dashboard`)
- [ ] #4 Google account picker is shown during sign-in when the user has multiple accounts
- [ ] #5 Business logo loads in `DashboardPage` when `logo_url` is set; falls back to initials otherwise
- [ ] #6 `EnrollPromptDrawer` shows the business logo (with initials fallback) alongside the cover image
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
**Auth redirect (code changes)**
- In `DashboardPage.handleGoogleEnroll`: save `window.location.href` to `sessionStorage` under a key like `enroll_return_url` before calling `signInWithOAuth`
- In `AuthCallbackPage`: after a successful session, read `enroll_return_url` from sessionStorage, remove it, and navigate to that URL (or fall back to `/dashboard?business=...` as today)

**Auth redirect (manual Supabase steps)**
- Supabase dashboard → Authentication → URL Configuration
  - Site URL: `https://go.joinenroll.app`
  - Add to Redirect URLs: `https://go.joinenroll.app/auth/callback`

**Logo in EnrollPromptDrawer**
- `EnrollPromptDrawer` receives the `business` prop (type `ConsumerBusiness`) which already has `logo_url`
- Add a small logo circle (e.g. 48×48px) overlapping the bottom-left of the cover image, matching the style in `DashboardPage`
- Same `onError → initials` pattern as `DashboardPage` (needs local `logoError` state)

**Account selection**
- `prompt: 'select_account'` is already in `DashboardPage.handleGoogleEnroll` — no code change needed there
- Confirm no other OAuth trigger exists without this param
<!-- SECTION:NOTES:END -->
