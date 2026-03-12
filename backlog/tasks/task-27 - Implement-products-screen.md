---
id: TASK-27
title: Implement products screen
status: To Do
assignee: []
created_date: '2026-03-12 00:00'
updated_date: '2026-03-12 00:00'
labels: []
milestone: m-1
dependencies:
  - TASK-17
priority: medium
ordinal: 17500
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement a Products management screen where the business owner can view, add, edit, and delete their retail products. Data is persisted in the `public.products` Supabase table (defined in TASK-17), scoped to the current business.

Products can optionally be offered as subscriptions, with a separate subscription price.

## Schema extension

TASK-17 defines the base `products` table. This task adds two subscription-related columns via a new migration named `add_subscription_to_products`:

| Column | Type | Notes |
|---|---|---|
| `is_subscribable` | `boolean` | NOT NULL, default `false` — whether the product can be purchased as a subscription |
| `subscription_price_cents` | `bigint` | nullable — subscription price in cents; only meaningful when `is_subscribable = true` |

## TypeScript types

Extend the `Product` interface in `src/types/index.ts` with:

```ts
is_subscribable: boolean
subscription_price_cents: number | null
```

## Products screen

Wire `ResourceScreen` and product-specific drawers into `src/pages/ProductsPage.tsx`. Follow the same pattern as `ServicesPage` and the existing `src/components/service/` drawers.

Field definitions for the create/edit form:

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | text | yes | |
| Category | text | no | |
| Price | number | yes | Stored as `price_cents` |
| Description | textarea | no | |
| Subscribable | toggle | no | Enables the subscription price field |
| Subscription price | number | conditional | Only shown and required when subscribable is on |

On form submit:
- `insert` for create, `update` for edit
- `price_cents = Math.round(price * 100)`
- `subscription_price_cents = Math.round(subscriptionPrice * 100)` if subscribable, else `null`

## Design

Figma frames will be provided before implementation begins. Implement consistently with the existing app (zinc palette, Inter font, shadcn/ui primitives, mobile-first) and update to match Figma before marking done.

## Routing

Add a `/products` route in `src/App.tsx`. Add a bottom-nav entry if the Figma design calls for it.

## Data access

- Business id: most recently created `businesses` row (same pattern as dashboard and services)
- All Supabase calls via existing `src/lib/supabase.ts`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance criteria

<!-- AC:BEGIN -->
- [ ] #1 Migration applies cleanly: `is_subscribable` and `subscription_price_cents` columns exist on `products` with correct types and defaults
- [ ] #2 `Product` TypeScript type includes `is_subscribable` and `subscription_price_cents`
- [ ] #3 Products list screen renders an empty state (illustration placeholder, heading, subtext, CTA) when no products exist
- [ ] #4 Products list screen renders a scrollable list of rows and an Add button when products exist
- [ ] #5 Create/edit form includes name, category, price, description, subscribable toggle, and subscription price fields
- [ ] #6 Subscription price field is only shown when the subscribable toggle is on
- [ ] #7 Submitting the create form inserts a new row with correct `price_cents` and `subscription_price_cents`
- [ ] #8 Submitting the edit form updates the correct row in Supabase
- [ ] #9 Delete confirmation removes the row from Supabase and the list
- [ ] #10 Loading and error states are handled for the list fetch and each mutation
- [ ] #11 `/products` route is registered in the app router
- [ ] #12 Screens match the Figma design (reviewed when frames are provided)
<!-- AC:END -->

## Definition of done

<!-- DOD:BEGIN -->
- [ ] #1 No TypeScript errors
- [ ] #2 All mutations reflected in the UI without a full page reload
- [ ] #3 Supabase RLS allows all CRUD operations (verified manually)
- [ ] #4 Figma design reviewed and UI updated to match before marking done
<!-- DOD:END -->
