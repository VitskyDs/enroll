---
id: TASK-22
title: Business dashboard on desktop
status: Done
assignee: []
created_date: '2026-03-07 05:01'
updated_date: '2026-03-19 16:04'
labels: []
dependencies: []
references:
  - apps/business/src/App.tsx
  - apps/business/src/components/BottomNav.tsx
  - apps/business/src/pages/DashboardPage.tsx
  - apps/business/src/pages/ProgramPage.tsx
  - apps/business/src/pages/ServicesPage.tsx
  - apps/business/src/pages/CustomersPage.tsx
ordinal: 28000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Make the business app fully usable on desktop by introducing a responsive layout shell. Business owners should get the right experience at any screen width — no separate URL needed.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 At lg+ breakpoint, a left sidebar nav replaces the BottomNav
- [ ] #2 At < lg breakpoint, BottomNav remains and sidebar is hidden
- [ ] #3 All main pages (Dashboard, Program, Services, Customers) have responsive layouts that don't overflow or look broken on desktop
- [ ] #4 No separate URL or route is introduced — same URLs work on both mobile and desktop
- [ ] #5 Drawers (InviteDrawer, SettingsOverlay) still function on desktop
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Architecture decision

Use a **breakpoint change** (single URL, responsive layout) rather than a separate URL. Business owners bookmark one URL and expect the same app on any device. Data and flows are identical, so splitting routes doubles maintenance with no UX benefit.

## Approach: responsive AppShell

Introduce an `AppShell` layout wrapper at the router root. It owns the nav and switches at the `lg` breakpoint:

- **Mobile (< lg):** existing BottomNav at bottom, unchanged
- **Desktop (≥ lg):** left sidebar with the same nav destinations; BottomNav hidden via `lg:hidden`

Every page inherits this automatically — no per-page routing changes needed.

## Per-page responsive pass

| Page | Desktop addition |
|---|---|
| DashboardPage | 2-col grid (checklist left, summary right) |
| ProgramPage | Card grid for feature sections |
| ServicesPage / CustomersPage | Table layout |
| Forms | Centered narrow container (already fine) |

All pages get a `max-w-4xl mx-auto px-6` container so content doesn't stretch on ultrawide screens.

## Steps

1. Create `AppShell.tsx` — flex container: sidebar (hidden on mobile) + `<main>` slot. Wire into App.tsx.
2. Create `SidebarNav.tsx` — extract nav destinations from BottomNav, render as vertical list. Add `lg:hidden` to existing BottomNav.
3. Responsive pass — DashboardPage
4. Responsive pass — ProgramPage
5. Responsive pass — ServicesPage + CustomersPage
<!-- SECTION:PLAN:END -->
