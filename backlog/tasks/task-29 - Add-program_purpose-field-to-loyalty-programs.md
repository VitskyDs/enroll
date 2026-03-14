---
id: TASK-29
title: Add program_purpose field to loyalty programs
status: Done
assignee: []
created_date: '2026-03-14 07:13'
updated_date: '2026-03-14 18:19'
labels: []
dependencies: []
references:
  - src/types/index.ts
  - src/prompts/generateProgram.ts
  - src/services/generateProgram.ts
  - src/services/saveToSupabase.ts
  - onboarding-docs/loyalty program generation instruction.md
priority: medium
ordinal: 21000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a `program_purpose` field to the `loyalty_programs` table and propagate it through all relevant layers. This field captures a plain-language explanation of why this specific program structure was chosen for the business — written for the owner to read, not the AI. It is distinct from `brand_voice_summary` (which is about tone) and `referral_description` (which describes the referral mechanic).

Example value: "A points-based program suits your business because your customers visit frequently and spend consistently. Flat points reward every visit without requiring complex tier tracking, and the welcome and birthday bonuses give you quick wins for new and returning members."

This makes the generated program more legible to owners and provides context for future edits or regeneration.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A `program_purpose` column (text, not null) is added to the `loyalty_programs` table via a Supabase migration
- [ ] #2 The `LoyaltyProgram` TypeScript interface in `src/types/index.ts` includes `program_purpose: string`
- [ ] #3 The generation prompt in `src/prompts/generateProgram.ts` instructs the LLM to produce a `program_purpose` field (2–3 sentences, plain language, owner-facing, explaining the strategic rationale for the chosen program type) and includes it in the required output JSON schema
- [ ] #4 `program_purpose` is added to the required-field check in `src/services/generateProgram.ts`
- [ ] #5 `program_purpose` is included in the Supabase insert in `src/services/saveToSupabase.ts`
- [ ] #6 The `onboarding-docs/loyalty program generation instruction.md` doc includes a new section describing how to write `program_purpose`: what it is, who it is for, what it should cover, and one example per program type (points, tiered, cashback)
<!-- AC:END -->
