---
id: TASK-5
title: AI pipeline + persistence
status: Done
assignee: []
created_date: '2026-03-02 20:08'
updated_date: '2026-03-05 10:03'
labels: []
milestone: m-0
dependencies:
  - TASK-1
priority: high
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace the stubbed AI phases in the onboarding flow with live integrations: Jina.ai website crawling, Claude service extraction, Claude loyalty program generation (streaming), and Supabase persistence. By the end of this task the full end-to-end flow works — a business owner can complete onboarding and see a real AI-generated loyalty program saved to the database.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 AI crawls the provided website URL via Jina.ai and extracts a list of services
- [ ] #2 Extracted services are shown in the ServiceSelector; user selects which to import
- [ ] #3 User selects their primary goal; it is stored as the business_goal enum value
- [ ] #4 AI generates a tailored points-based loyalty program using selected services, goal, and loyalty_program_examples as context
- [ ] #5 Program generation streams output — user sees progress as it generates
- [ ] #6 Business, selected services, and loyalty program are saved to Supabase on completion
- [ ] #7 ProgramPreview displays the full program summary: goal, program name, earn rule, referral bonus, and tier benefits
- [ ] #8 If Jina.ai crawl fails, the flow continues gracefully with an empty services list
- [ ] #9 All data shown in the preview comes from AI generation — no hardcoded content
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Scope

Replace stub implementations with live integrations. TASK-1 must be complete first — this task only touches src/prompts/, src/services/, hooks/useOnboarding.ts (AI phases only), and ProgramPreview.tsx.

## Key files

- `src/prompts/extractServices.ts` — new
- `src/prompts/generateProgram.ts` — new
- `src/services/extractServices.ts` — new
- `src/services/generateProgram.ts` — new (streaming)
- `src/services/saveToSupabase.ts` — new
- `src/hooks/useOnboarding.ts` — replace stubbed phases 5–6 and 9–10 with live calls
- `src/components/preview/ProgramPreview.tsx` — replace placeholder with full layout

## AI prompts

**extractServices**: Jina markdown (≤12,000 chars) + business name → JSON array `{name, description, duration_minutes, price, category}`. JSON only, no markdown fences.

**generateProgram**: Business profile (name, type, goal) + selected services + 2–3 loyalty_program_examples rows → flat JSON matching loyalty_programs schema. Fields: name, points_per_currency, redeem_rate, base_reward_description, tiered, tier1_name/threshold/reward, tier2_*, tier3_*, referral_reward_type/value/description, brand_voice. Use streaming.

## Supabase inserts (saveToSupabase.ts)

1. Insert `businesses` row → capture `id`
2. Batch insert `services` rows with `business_id` and `source = 'ai_extracted'`
3. Insert `loyalty_programs` row with `business_id` and `ai_generated = true`
4. Update `businesses.loyalty_program_id` with the new program id

## Error handling

- Jina fetch throws → catch, log, `services = []`, continue
- JSON.parse fails → catch, append error message to chat
- Supabase insert fails → append error message, still render preview from in-memory data
<!-- SECTION:PLAN:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 src/prompts/extractServices.ts and generateProgram.ts written with well-structured prompts
- [ ] #2 src/services/extractServices.ts calls Claude and returns ExtractedService[]
- [ ] #3 src/services/generateProgram.ts uses streaming and accumulates chunks before parsing
- [ ] #4 src/services/generateProgram.ts queries loyalty_program_examples from Supabase for context
- [ ] #5 src/services/saveToSupabase.ts inserts businesses, services, and loyalty_programs rows
- [ ] #6 useOnboarding hook stubbed phases replaced with live service calls
- [ ] #7 ProgramPreview renders all program fields from the real API response
- [ ] #8 Graceful error handling: Jina fail → empty services; parse fail → fallback; Supabase fail → show error but keep preview
- [ ] #9 End-to-end test: complete onboarding with a real salon website URL and verify all 3 Supabase tables have rows
<!-- DOD:END -->
