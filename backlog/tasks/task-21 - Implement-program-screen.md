---
id: TASK-21
title: Implement program screen
status: Done
assignee: []
created_date: '2026-03-06 22:01'
updated_date: '2026-03-07 05:01'
labels: []
dependencies: []
priority: medium
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the Program screen (loyalty tab) and ProgramFeature detail screen. Data comes from Supabase loyalty_programs table. Read-only — no editing functionality.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Program screen loads loyalty program from Supabase and displays program_name as heading
- [ ] #2 Five rows render: currency name, earn rules, reward tiers, bonus rules, brand voice — each with a short description and chevron
- [ ] #3 Tapping a row navigates to /program/:feature with correct heading and content
- [ ] #4 ProgramFeature screen shows a back button that returns to /program
- [ ] #5 Loyalty icon in bottom nav is highlighted when on /program
<!-- AC:END -->
