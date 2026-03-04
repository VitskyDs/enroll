---
id: TASK-10
title: Page routing
status: Done
assignee: []
created_date: '2026-03-04'
updated_date: '2026-03-04 16:51'
labels: []
dependencies: []
priority: high
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement client-side routing using React Router so the app has a clear page structure from the start.

### Current state
`App.tsx` is the onboarding flow directly — it mounts the state machine and renders `ChatShell`. This needs to move to an `OnboardingPage` component so routing can wrap it.

### Routes

| Path | Page | Component | Notes |
|---|---|---|---|
| `/` | Landing page | `LandingPage` (stub) | "Get started" → `/onboarding`, "Sign in" → `/login` |
| `/login` | Login page | `LoginPage` (stub) | Auth form stub, no logic required |
| `/onboarding` | Onboarding flow | `OnboardingPage` (real) | Move existing `App.tsx` logic here |
| `/dashboard` | Dashboard | `DashboardPage` (stub) | Destination after onboarding completes |

### Implementation notes
- Install `react-router-dom`
- Add `BrowserRouter` in `main.tsx`, wrapping `<App />`
- `App.tsx` becomes the route config only (`Routes` + `Route` declarations)
- Page components live in `src/pages/`
- Replace `window.location.reload()` in `App.tsx` with `useNavigate()` → `/dashboard`

### Out of scope
- Auth / session gating
- Actual onboarding redesign or visual polish
- Dashboard content
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `react-router-dom` installed and configured
- [ ] #2 `BrowserRouter` added in `main.tsx`; `App.tsx` contains only route declarations
- [ ] #3 All four routes render without error
- [ ] #4 `/`, `/login`, and `/dashboard` are stub pages with a clear page label
- [ ] #5 `/onboarding` renders the existing onboarding flow unchanged
- [ ] #6 After onboarding completes, user is navigated to `/dashboard` via `useNavigate`
- [ ] #7 Browser back/forward buttons work correctly across routes
- [ ] #8 Direct URL access (e.g. `/dashboard`) renders the correct page
<!-- AC:END -->
