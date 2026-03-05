---
id: TASK-14
title: Add guardrails to loyalty program creation
status: To Do
assignee: []
created_date: '2026-03-04 00:00'
updated_date: '2026-03-04 00:00'
labels: []
dependencies:
  - TASK-9
priority: high
ordinal: 1400
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The loyalty program generation pipeline currently has no defensive layers. `generateProgram` calls `JSON.parse()` directly with no schema validation; numeric fields are never range-checked; `saveToSupabase` fires immediately after generation before the user confirms; and generated content is trusted without any moderation.

This task adds four guardrail layers to harden the pipeline:

**1. Input validation (pre-generation)**
Before `generateProgram` is called, validate that the business profile is sufficient:
- `businessName` is non-empty and ≤ 100 chars
- `businessCategory` is a recognized value
- `services` has at least 1 entry with a non-empty name
- `goal` is set to one of the three valid values (`retention`, `referrals`, `frequency`)

If validation fails, surface a readable error in the chat UI and block generation.

**2. Output validation (post-parse)**
After `JSON.parse()` succeeds, validate the structure before showing or saving:
- All required top-level fields are present (`program_name`, `currency_name`, `earn_rules`, `reward_tiers`, `bonus_rules`, `referral_description`, `brand_voice_summary`)
- `earn_rules`: ≥ 1 entry; each has a positive `points_per_dollar` or `points_per_visit` (not both null/zero)
- `reward_tiers`: ≥ 2 entries; `points_required` values are strictly ascending; no empty `reward_description`
- `bonus_rules`: each `multiplier` > 1 if present
- No empty strings on required text fields

On failure, retry generation once automatically. If the second attempt also fails, show an error in chat.

**3. Content moderation (post-parse, pre-display)**
Scan all generated text fields (`program_name`, `currency_name`, `brand_voice_summary`, tier names, rule labels and descriptions) for inappropriate content. Add a moderation instruction to the system prompt as the primary layer, and a keyword blocklist as a secondary layer. Avoid a separate API call. If a blocked term is detected, retry once; if still failing, show an error.

**4. Confirmation gate (pre-save)**
`saveToSupabase` currently fires as soon as generation finishes. Defer the save until the user explicitly confirms at the end of the review flow:
- `useProgramOnboarding` completes generation and review steps without saving
- The save is triggered in `ConfirmPage` (or the final review step handler) when the user confirms

All validation and moderation logic should live in a new `src/lib/validateProgram.ts` module with pure, testable functions.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Input validation: generation is blocked with a clear chat error if business data is incomplete or invalid
- [ ] #2 Output validation: malformed or out-of-range AI output triggers an automatic retry (max 1), then shows a chat error if still invalid
- [ ] #3 Content moderation: generated text is scanned and blocked if inappropriate content is detected (prompt-level instruction + keyword blocklist)
- [ ] #4 Confirmation gate: `saveToSupabase` does not fire until the user explicitly confirms at the end of the review flow; no Supabase row exists for an unconfirmed generation
- [ ] #5 All validation errors surface as readable messages in the chat UI — no blank screens or unhandled console errors
<!-- AC:END -->
