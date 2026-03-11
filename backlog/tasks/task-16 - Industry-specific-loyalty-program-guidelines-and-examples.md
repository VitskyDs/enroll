---
id: TASK-16
title: Industry-specific loyalty program guidelines and examples
status: To Do
assignee: []
created_date: '2026-03-05 20:50'
updated_date: '2026-03-07 05:01'
labels: []
milestone: m-0
dependencies: []
references:
  - 'https://www.openloyalty.io/insider/sephora-beauty-insider'
  - >-
    https://www.dtcpatterns.com/dtc-patterns-articles/princess-pollys-rewards-program-grants-vip-access-just-for-shopping
  - 'https://about.starbucks.com/starbucks-rewards-faq/'
  - src/prompts/programGuidelines.ts
  - src/prompts/generateProgram.ts
  - src/lib/validateProgram.ts
  - src/types/index.ts
priority: high
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current generation prompt uses a single `programGuidelines.ts` file for all business types. This task extends the system with industry-specific guidelines and concrete real-world examples in Supabase, using three well-known programs as the design basis:

- **Beauty & wellness** — Sephora Beauty Insider: 3 tiers (Insider → VIB → Rouge), 1 pt/$1, points redeemable for product rewards and experiences, birthday perks, tier-based multiplier events
- **CPG / Retail** — Princess Polly Rewards: 4 tiers (General Admission → Front Row → VIP → Backstage Pass), 1 pt/$1, non-transactional earn actions (social follow, reviews, referrals), aspirational lifestyle perks at top tiers
- **Food & beverage** — Starbucks Rewards: 3 tiers (Green → Gold → Reserve), 1 Star/$1 with tier multipliers (1×, 1.2×, 1.7×), low threshold redemptions starting at 60 Stars, visit-frequency emphasis

## Changes

### 1. Industry guidelines files
Create `src/prompts/guidelines/` with one file per industry plus a general fallback:

- `beauty-wellness.ts` — covers `salon`, `spa`, `barbershop`, `wellness`, `fitness`, `clinic`
- `food-beverage.ts` — covers a new `cafe` / `restaurant` category (extend `BusinessCategory` type and `VALID_CATEGORIES` in `validateProgram.ts`)
- `cpg-retail.ts` — covers a new `retail` category
- `general.ts` — fallback for `other` and any unmapped category
- `index.ts` — exports a `getIndustryGuidelines(category: BusinessCategory): string` function that returns the right guidelines string

Each file should capture the distinctive patterns of its reference program (see above) while remaining generic enough to apply to any business in that industry. Keep them in the same style and structure as the existing `programGuidelines.ts`.

### 2. Update `programGuidelines.ts`
Keep it as the universal base. Remove any industry-specific advice that should live in the industry files (e.g., the "visit-based rules: if the business has services under $30…" note belongs in beauty-wellness and food-beverage, not the general file).

### 3. Wire industry guidelines into the prompt
In `buildGenerateProgramPrompt`, call `getIndustryGuidelines(businessCategory)` and inject the result after `PROGRAM_GUIDELINES` and before the business-specific fields.

### 4. Supabase examples
Add one example loyalty program row per industry to the `loyalty_program_examples` table:
- A beauty & wellness example (inspired by Beauty Insider patterns)
- A food & beverage example (inspired by Starbucks Rewards patterns)
- A CPG / retail example (inspired by Princess Polly patterns)

Each row should be a complete, realistic `LoyaltyProgram`-shaped JSON (matching the schema already used in the table). The examples should use placeholder business names (e.g., "Glow Studio", "Brew & Bean", "Urban Thread").

### 5. Extensibility
The `getIndustryGuidelines` function and the `src/prompts/guidelines/` folder should make it trivial to add a new industry: create a new file, export a string, add a case to the index. Document this pattern in a short comment at the top of `index.ts`.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Industry guidelines files exist for beauty-wellness, food-beverage, cpg-retail, and general (fallback); each captures the key earning, tier, and reward patterns of its reference program
- [ ] #2 getIndustryGuidelines(category) returns the correct string for all current BusinessCategory values with no gaps (unmapped categories fall back to general)
- [ ] #3 buildGenerateProgramPrompt injects both universal and industry-specific guidelines into the prompt
- [ ] #4 BusinessCategory type and VALID_CATEGORIES include the new retail and cafe/restaurant categories
- [ ] #5 loyalty_program_examples table has at least one example row per industry (beauty & wellness, food & beverage, CPG/retail)
- [ ] #6 Adding a new industry requires only: a new guidelines file + one new case in index.ts (no changes to prompt builder or other files)
<!-- AC:END -->
