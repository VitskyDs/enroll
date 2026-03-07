---
id: TASK-23
title: 'Services screen — list, create, edit, delete'
status: Done
assignee: []
created_date: '2026-03-07 06:13'
updated_date: '2026-03-07 15:24'
labels: []
milestone: m-1
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement a Services management screen where the business owner can view, add, edit, and delete their services. Data is persisted in the `public.services` Supabase table, scoped to the current business.

A key deliverable of this task is a set of **reusable components** that future resource screens (products, customers, etc.) can adopt without rebuilding from scratch.

## Context

Services are central to the loyalty program — they define what customers earn points on and what rewards are structured around. Currently, services are only added during onboarding (via the AI-driven chat flow, `source = 'ai_extracted'`). This screen gives owners ongoing control.

## `services` table schema (existing)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, auto-generated |
| `business_id` | uuid | FK → `businesses.id` |
| `name` | text | Required |
| `description` | text | Optional |
| `duration_minutes` | bigint | Optional |
| `price` | numeric | Required — display as currency |
| `subscription_price` | numeric | Optional |
| `category` | text | Optional |
| `source` | text | Set to `'manual'` for owner-created/edited services |
| `price_cents` | bigint | Keep in sync with `price` (price × 100) |

---

## Reusable components

Build these generics under `src/components/resource/`. Services will be the first consumer — they must be generic enough for products, customers, and any future resource.

### `ResourceScreen`
Top-level list screen shell. Accepts a title, the list content, and an "add" action. Renders two internal states driven by whether items exist:

- **Empty state** — centered illustration placeholder, heading, subtext, and a primary CTA button ("Add your first service", etc.)
- **Populated state** — scrollable list of rows + a persistent "Add" button/FAB

### `ResourceForm`
A bottom sheet (shadcn `Sheet`) used for both creating and editing a resource. Accepts:
- A title ("Add service" / "Edit service")
- A list of field definitions (label, key, type: text | number | textarea, required flag)
- Initial values (empty for create, populated for edit)
- `onSubmit` callback
- `onDelete` callback (shown only in edit mode, triggers the delete confirmation)

Handles its own field validation (required fields, numeric coercion).

### `DeleteConfirmSheet`
A separate bottom sheet (action sheet style) for delete confirmation. Renders:
- Short description of what will be deleted
- Destructive "Delete" button
- "Cancel" button

Opened from `ResourceForm` when the user taps delete; does not close `ResourceForm` (stack them or swap — decide based on Figma when it arrives).

---

## Services screen

Wire `ResourceScreen` and `ResourceForm` together into `src/pages/ServicesPage.tsx`. Field definitions for services:

| Field | Type | Required |
|---|---|---|
| Name | text | yes |
| Category | text | no |
| Price | number | yes |
| Duration (min) | number | no |
| Description | textarea | no |

On form submit:
- `insert` for create, `update` for edit
- Set `source = 'manual'`
- `price_cents = Math.round(price * 100)`
- Optimistically update list on success

### Data access
- Business id: most recently created `businesses` row (same pattern as dashboard)
- All Supabase calls via existing `src/lib/supabase.ts`

---

## Design
Figma design is forthcoming. Implement consistently with the existing app (zinc palette, Inter font, shadcn/ui primitives, mobile-first). Update to match Figma before marking done.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 ResourceScreen renders an empty state (illustration placeholder, heading, subtext, CTA) when no items exist
- [ ] #2 ResourceScreen renders a scrollable list of rows and an Add button when items exist
- [ ] #3 ResourceForm renders as a bottom sheet, accepts field definitions and initial values, and handles create and edit modes
- [ ] #4 ResourceForm validates required fields and shows inline errors without submitting
- [ ] #5 DeleteConfirmSheet renders as an action-sheet-style bottom sheet with a destructive Delete button and a Cancel button
- [ ] #6 All three components are generic — no services-specific logic inside them
- [ ] #7 ServicesPage composes ResourceScreen and ResourceForm with services field definitions
- [ ] #8 Services list fetches from Supabase and renders all services for the current business
- [ ] #9 Submitting the create form inserts a new row with source = 'manual' and price_cents set correctly
- [ ] #10 Submitting the edit form updates the correct row in Supabase
- [ ] #11 Confirming delete removes the row from Supabase and the list
- [ ] #12 Loading and error states are handled for the list fetch and each mutation
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 No TypeScript errors
- [ ] #2 Reusable components contain no services-specific imports or logic
- [ ] #3 Supabase RLS allows all CRUD operations (verified manually)
- [ ] #4 All mutations reflected in the UI without a full page reload
- [ ] #5 Figma design reviewed and UI updated to match before marking done
<!-- DOD:END -->
