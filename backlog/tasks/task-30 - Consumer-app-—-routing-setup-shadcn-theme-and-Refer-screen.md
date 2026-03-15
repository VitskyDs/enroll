---
id: TASK-30
title: 'Consumer app — routing setup, shadcn theme, and Refer screen'
status: In Progress
assignee: []
created_date: '2026-03-15 10:48'
updated_date: '2026-03-15 10:49'
labels:
  - consumer
  - frontend
  - routing
dependencies:
  - TASK-26
references:
  - apps/consumer/src/App.tsx
  - apps/consumer/src/main.tsx
  - apps/consumer/package.json
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Set up the full routing skeleton for the consumer app and establish its own shadcn/ui theme, then implement the Refer a friend screen as the first concrete page.

## Why

The consumer app (`apps/consumer/`) is scaffolded but has no routing or design system. Before any customer-facing screens can be built, we need a navigable shell with a dedicated theme that can be rebranded per-business later (brand color as a CSS variable).

## Scope

### Shadcn theme
- Install and configure shadcn/ui in `apps/consumer/` independently of the business app
- Use a CSS custom property (`--brand`) for the primary color so it can be swapped per-business without touching component code
- Mobile-first layout (the consumer app is a PWA)

### Routing
Wire up React Router (already in `package.json`) with the following routes and stub pages:

| Route | Page |
|---|---|
| `/onboarding` | Onboarding (stub) |
| `/` or `/dashboard` | Dashboard (stub) |
| `/dashboard/service/:id` | Service drawer (stub, renders inside dashboard) |
| `/checkout` | Checkout (stub) |
| `/checkout/confirmation` | Purchase confirmation (stub) |
| `/refer` | Refer a friend (implemented) |
| `/refer/track` | Track referrals (stub) |
| `/loyalty` | Loyalty program (stub) |
| `/profile` | Profile (stub) |

Stubs just need a page title and a placeholder so navigation is verifiable.

### Refer a friend screen (first implemented page)
The Refer screen (`/refer`) is the first real screen. It should:
- Show the customer's unique referral link or shareable code
- Include a share/copy action
- Display a brief incentive message (e.g. "Give $10, get $10")
- Match the consumer app's mobile-first layout and brand theme
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 shadcn/ui is installed in `apps/consumer/` with its own `components.json` and CSS theme, independent of the business app
- [ ] #2 A CSS custom property (`--brand` or equivalent) controls the primary color and can be changed in one place
- [ ] #3 React Router is configured in `apps/consumer/src/main.tsx` or `App.tsx` with all routes listed in the task
- [ ] #4 Each stub route renders without errors and shows a visible page title so navigation can be verified manually
- [ ] #5 The `/refer` route renders a complete Refer a friend screen: referral code/link display, copy/share action, and incentive message
- [ ] #6 All screens use the consumer app's shadcn theme (not the business app's styles)
- [ ] #7 The app is mobile-first: default layout is single-column and fits a 390px viewport without horizontal scroll
<!-- AC:END -->
