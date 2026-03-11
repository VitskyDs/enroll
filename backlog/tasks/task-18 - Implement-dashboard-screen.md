---
id: TASK-18
title: Implement dashboard screen
status: Done
assignee: []
created_date: '2026-03-06 20:51'
updated_date: '2026-03-07 05:01'
labels: []
milestone: m-1
dependencies: []
priority: high
ordinal: 11000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace the DashboardPage placeholder with the designed dashboard screen. Priority is UI fidelity; most content is dummy except the business name which is fetched from Supabase.

## Design reference
Figma frame selected — screenshot attached in plan. Key sections:

- **Header** — business name (left, pulled from Supabase) + Bell + Menu icon buttons (right, inert)
- **Banner** — light-gray rounded card with Sparkles icon, "Your loyalty program is live", subtitle, black "Invite customers" full-width button (inert for now)
- **Get started section** — "Get started" heading + "Follow this guide to get up and running" subtitle + "0 / 5 completed" badge + 5 checklist rows
- **Bottom navbar** — fixed, 6 items: Search | Home (active, gray pill) | Send | Star | Menu | Sparkles; Home is the only active state, rest are inert

## Checklist rows (all static/dummy)
1. Invite your first customers — Share your loyalty link
2. Add your branding — Upload your logo and set brand colors
3. Set up a payment provider — Connect Stripe to accept payment
4. Preview your business — See it through your customer's eyes
5. Download the app — Get the merchant app on your phone

Each row: `CircleDashed` icon (lucide) + label (semibold) + description (muted) + `ChevronRight` icon.

## Data
Only real data: `businesses.name` from Supabase — query most recently created row (`order('created_at', { ascending: false }).limit(1).single()`). Everything else is static.

## Implementation notes
- File to replace: `src/pages/DashboardPage.tsx`
- Icons: lucide-react (already installed) — Bell, Menu, Sparkles, CircleDashed, ChevronRight, Search, House, Send, Star
- Font: Inter (already loaded) — weights 400/500/600 to match Figma
- Colors: zinc-900 text, zinc-500 muted, zinc-100 secondary bg, white, black CTA button
- Main content: `pb-24` to clear the fixed navbar
- Navbar: fixed bottom, white bg, `shadow-sm`, safe-area-aware padding
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Business name renders from Supabase (most recent business row); falls back to 'Your business' if fetch fails
- [ ] #2 Banner, checklist, and navbar match the Figma design
- [ ] #3 Bottom navbar renders all 6 items; Home tab has the active gray pill; the rest are inert
- [ ] #4 Checklist shows all 5 rows with CircleDashed icon, label, description, and ChevronRight
- [ ] #5 Layout does not overlap the fixed navbar (main content has correct bottom padding)
- [ ] #6 Page is scrollable when content overflows
<!-- AC:END -->
