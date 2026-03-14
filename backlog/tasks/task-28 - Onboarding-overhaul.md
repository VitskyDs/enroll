---
id: TASK-28
title: Onboarding overhaul
status: Done
assignee: []
created_date: '2026-03-13 15:13'
updated_date: '2026-03-14 06:19'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Overhaul the onboarding flow into 3 explicit phases driven by onboarding_schema.json, with proper program-type matching via decision rules and full program generation per loyalty_program_archetypes.json.

**New flow:**
- Phase 1 "Your business": collect name/URL, scrape services, infer offering_type/industry/brand_personality
- Phase 2 "Program inputs": 3 diagnostic questions (primary_goal, visit_frequency, spend_variance)
- Phase 3 "Your program": deterministic program-type recommendation → accept → loading screen → generate → display program

**Key changes:**
- New Supabase columns on businesses and loyalty_programs tables
- New TypeScript types (BusinessOnboardingData, ProgramRecommendation, BrandPersonality, etc.)
- New pages: PreferencesPage, RecommendationPage, GeneratingPage, ProgramPreviewPage
- Updated generation prompt using loyalty program generation instructions + archetypes
- Deterministic recommendProgram service implementing the 8 decision rules
- Remove old ProgramPage, ConfirmPage, useProgramOnboarding
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation complete. All new pages created (PreferencesPage, RecommendationPage, GeneratingPage, ProgramPreviewPage). Old files deleted (ProgramPage, ConfirmPage, useProgramOnboarding, useOnboarding, ProgramPreview, ProgramSectionCard, validateProgram). Build passes clean. Supabase migrations applied. Types updated.
<!-- SECTION:NOTES:END -->
