---
id: TASK-37
title: Consumer app — signed-in state and navigation
status: In Progress
assignee: []
created_date: '2026-03-21 14:00'
labels: []
dependencies: []
references:
  - apps/consumer/src/App.tsx
  - apps/consumer/src/pages/DashboardPage.tsx
  - apps/consumer/src/pages/ProfilePage.tsx
  - apps/consumer/src/pages/AuthCallbackPage.tsx
  - apps/consumer/src/components/BottomNav.tsx
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The consumer app has no global auth or enrollment state. Each page independently queries Supabase to check whether the user is signed in and enrolled, leading to inconsistent behavior across the app: `BottomNav` is conditionally rendered inside `DashboardPage` but always rendered inside `ProfilePage`, and other pages don't manage it at all. There is also no unenroll option — the profile screen only offers account deletion.

This task introduces a global auth + enrollment context so all pages share a single source of truth, makes `BottomNav` appear and disappear consistently across the whole app based on enrollment state, and adds an unenroll option to the profile screen.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance criteria

<!-- AC:BEGIN -->
- [ ] #1 A global auth + enrollment context wraps the consumer app and exposes `user`, `isEnrolled`, `enrolledCustomer`, and `businessId` to all pages
- [ ] #2 After a successful OAuth sign-in for a returning enrolled user, the user is redirected to their last URL (preserved via `sessionStorage`) or falls back to `/dashboard?business=<id>`
- [ ] #3 After a new enrollment (first-time user), the user stays on the dashboard and the enrollment confirmation drawer opens — no additional redirect
- [ ] #4 `BottomNav` is rendered at the app/layout level and is visible on all pages when the user is enrolled
- [ ] #5 `BottomNav` is hidden on all pages when the user is not enrolled
- [ ] #6 The enrollment banner and "Enroll" button on the dashboard are hidden when the user is enrolled (existing behavior preserved under the new context)
- [ ] #7 The profile screen has an "Unenroll" option that deletes the customer record but keeps the auth account, then returns the user to the unenrolled dashboard view
- [ ] #8 The profile screen "Delete account" option continues to delete the customer record and sign the user out
<!-- AC:END -->

## Implementation notes

<!-- SECTION:NOTES:BEGIN -->
**Global auth context**

Create `apps/consumer/src/contexts/AuthContext.tsx`. The context should:
- Load the current Supabase session on mount
- Subscribe to `onAuthStateChange` to stay in sync
- Resolve the active `businessId` (from URL query param, sessionStorage, or most recent in DB — same logic currently in `DashboardPage`)
- Query the `customers` table once per session to check enrollment status
- Expose a `setEnrolledCustomer` setter so `DashboardPage` can update state after new enrollment without re-fetching

**App-level BottomNav**

Move `<BottomNav />` out of individual pages into a layout wrapper in `App.tsx`. Render it when `isEnrolled` is true. Remove the per-page `<BottomNav />` from `DashboardPage` and `ProfilePage`.

**DashboardPage**

Replace local `enrolledCustomer`/`isEnrolled` state with values from the auth context. Keep the `onAuthStateChange` listener only for triggering the new-enrollment drawer (`showEnrollmentDrawer`), but delegate the actual customer creation result back to the context via the setter.

**ProfilePage**

- Remove the local `<BottomNav />` render (covered by the layout).
- Add an "Unenroll" `SectionItem` in the Account section (above Logout). On confirm, delete the customer record for the current user + business, call the context's setter to clear enrollment, then navigate to `/dashboard?business=<id>` (preserving which business the user was viewing).

**Unenroll confirmation**

Reuse the existing `Drawer` pattern from the delete-account confirmation — show a confirmation sheet before executing the unenroll.
<!-- SECTION:NOTES:END -->
