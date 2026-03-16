---
id: TASK-31
title: 'Consumer app — business dashboard, enrollment, and service drawer'
status: Done
assignee: []
created_date: '2026-03-15 16:42'
updated_date: '2026-03-16 17:56'
labels:
  - consumer
  - frontend
  - auth
dependencies:
  - TASK-30
references:
  - apps/consumer/src/pages/DashboardPage.tsx
  - apps/consumer/src/lib/supabase.ts
  - apps/consumer/src/hooks/useLoyaltyProgram.ts
  - apps/business/src/services/saveToSupabase.ts
  - apps/consumer/src/pages/ReferPage.tsx
documentation:
  - >-
    https://www.figma.com/design/gpdFAzL05BQXO7czT8EEhd/Enroll---Consumer?node-id=2074-17181
  - >-
    https://www.figma.com/design/gpdFAzL05BQXO7czT8EEhd/Enroll---Consumer?node-id=2017-3278
  - >-
    https://www.figma.com/design/gpdFAzL05BQXO7czT8EEhd/Enroll---Consumer?node-id=2055-3960
priority: high
ordinal: 26000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the pre-login business page that a customer lands on (via QR code or link), the Google sign-in + enrollment confirmation flow, and the service detail drawer.

## Why

This is the customer's first touchpoint. They need to understand what the business offers and why they should enroll before committing to sign up. After enrolling they immediately see their reward status, creating an instant gratification loop.

## Screens to implement

### 1. Business dashboard — `/dashboard?business=<id>` (unauthenticated)

Figma: https://www.figma.com/design/gpdFAzL05BQXO7czT8EEhd/Enroll---Consumer?node-id=2074-17181

Layout (scrollable, no bottom navbar at this stage):
- **Header**: full-width cover image (165px tall, rounded corners) with a "Gallery" pill button (bottom-right). Business logo circle overlaps the bottom-left of the cover image.
- **Title row**: business name (heading-3, 24px semibold) + tagline (14px muted) on the left; share icon button + black "Enroll" pill button on the right with "Free. 5% off." caption below.
- **Metadata bar**: hours badge (clock icon + "7:00 - 19:00"), dot separator, address badge (pin icon + address), dot separator, "More" ghost button.
- **Loyalty banner**: `#f5f5f5` card with title ("5% off all services at…"), subtitle ("When you enroll. +20 points."), "Enroll now" CTA button, and a service image on the right. Values derived from `loyalty_programs.referral_rules` and program data.
- **Services section**: heading "Services" + subtitle, then a vertical list of `ServiceCard` components showing name, description, discounted price + strikethrough full price, "x1 a month" frequency, service image, and a `+` icon button. Tap on a card opens the service drawer.

Data sources:
- Business info: `businesses` table (name, website, etc.)
- Services: `services` table filtered by `business_id`
- Loyalty offer: `loyalty_programs` table (same hook as ReferPage — `useLoyaltyProgram`)

### 2. Enrollment flow — triggered by "Enroll" or "Enroll now"

Tapping either enroll button triggers Google OAuth via Supabase (`supabase.auth.signInWithOAuth({ provider: 'google' })`). After successful sign-in, a customer record is created in Supabase (upsert on `customers` table keyed by `auth.user.id` + `business_id`) and the enrollment confirmation drawer slides up.

### 3. Enrollment confirmation drawer

Figma: https://www.figma.com/design/gpdFAzL05BQXO7czT8EEhd/Enroll---Consumer?node-id=2017-3278

Bottom sheet (handle bar, rounded top corners, lg shadow). Contents:
- Gray image placeholder (176px, `#f5f5f5`)
- "You're enrolled" heading + body copy referencing business name
- Two badge-check rows: earn rule (from program data) + "Loyalty points — You've earned X points with {business}"
- Points meter card: circular coin graphic, "X / 100 points" label, chevron-right (tappable, navigates to loyalty screen)
- Tier context paragraph: current tier + next tier progress

### 4. Service drawer

Figma: https://www.figma.com/design/gpdFAzL05BQXO7czT8EEhd/Enroll---Consumer?node-id=2055-3960

Bottom sheet (same shape). Contents:
- Service image (176px, `#f5f5f5` placeholder if no image)
- Service name (heading-4) + description
- Duration row (label + value)
- Points earned row (label + "Subscribe to earn pts every month" + value)
- Two CTA buttons: "Subscribe and save ${subscription price}/month" (primary black) and "Buy once ${price}" (secondary `#f5f5f5`)

## Data model notes

- `businesses` table already exists — use `name`, `website_url`, etc.
- `services` table already exists — use `name`, `description`, `price_cents`, `duration_minutes`
- `customers` table may need creating or extending — at minimum needs `id`, `user_id` (auth), `business_id`, `enrolled_at`, `points_balance`

## Technical notes

- Route already exists as a stub: `apps/consumer/src/pages/DashboardPage.tsx`
- Supabase client: `apps/consumer/src/lib/supabase.ts`
- Loyalty hook: `apps/consumer/src/hooks/useLoyaltyProgram.ts`
- No bottom navbar on any of these screens
- URL param `?business=<id>` is the primary way to scope the page to a business
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Navigating to /dashboard?business=<id> renders the business dashboard without requiring sign-in
- [ ] #2 Cover image, business logo, name, tagline, hours, address, and metadata bar are all visible and populated from Supabase
- [ ] #3 Loyalty enrollment banner shows the correct offer derived from the business's loyalty program
- [ ] #4 Services section lists all services for the business from the services table, each showing name, description, price, strikethrough full price, and frequency
- [ ] #5 Tapping the Enroll or Enroll now button triggers Google OAuth via Supabase
- [ ] #6 After successful Google sign-in, a customer record is upserted in Supabase (customers table) linking the user to the business
- [ ] #7 After enrollment, the enrollment confirmation drawer slides up from the bottom with the correct business name, earn rule, loyalty points earned, and points meter
- [ ] #8 Tapping a service card opens the service drawer showing name, description, duration, points earned, and the two CTA buttons (subscribe + buy once)
- [ ] #9 Service drawer and enrollment drawer both use the bottom-sheet layout from Figma (handle bar, rounded top corners, lg shadow)
- [ ] #10 No bottom navbar is shown on any of these screens
<!-- AC:END -->
