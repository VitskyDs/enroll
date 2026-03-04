---
id: TASK-8
title: Fix Supabase persistence — data not saving to tables
status: In Progress
assignee: []
created_date: '2026-03-03 00:00'
updated_date: '2026-03-04 17:05'
labels:
  - Backend
milestone: m-0
dependencies:
  - TASK-5
priority: high
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`saveToSupabase` runs without throwing but no rows appear in the `businesses`, `services`, or `loyalty_programs` tables. The most likely causes are: (1) the tables don't exist yet in the Supabase project, (2) Row Level Security (RLS) is blocking anonymous inserts, or (3) the column schema doesn't match the insert payload. This task is to diagnose the root cause and fix it so a completed onboarding session durably persists all three records.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The `businesses`, `services`, and `loyalty_programs` tables exist in Supabase with the correct schema (column names, types, and nullability matching `saveToSupabase.ts`)
- [ ] #2 RLS policies allow the anon key to `INSERT` into all three tables (or auth is configured appropriately for the POC)
- [ ] #3 Completing onboarding creates one `businesses` row, N `services` rows, and one `loyalty_programs` row, confirmed via the Supabase table editor
- [ ] #4 `businesses.loyalty_program_id` is updated after the program is inserted
- [ ] #5 Any errors from Supabase inserts surface in the UI (currently they are only logged to the console)
<!-- AC:END -->



## Notes

Insert payload shape (from `src/services/saveToSupabase.ts`):

**businesses**: `name`, `category`, `website_url`, `goal`, `loyalty_program_id` (updated post-insert)

**services**: `business_id`, `name`, `price_cents`, `description`, `duration_minutes`, `category`, `source` (= `'ai_extracted'`)

**loyalty_programs**: `business_id`, `program_name`, `currency_name`, `earn_rules` (jsonb), `reward_tiers` (jsonb), `bonus_rules` (jsonb), `referral_description`, `brand_voice_summary`, `ai_generated` (bool)

The `supabase` singleton is at `src/lib/supabase.ts` and uses `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Check that these are set in `.env.local`. If RLS is the blocker, the quickest POC fix is to add an `INSERT` policy for the `anon` role on each table.
