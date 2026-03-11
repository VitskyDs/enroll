---
id: TASK-25
title: Implement customers screen
status: Done
assignee: []
created_date: '2026-03-08 08:21'
updated_date: '2026-03-11 15:54'
labels: []
milestone: m-1
dependencies: []
references:
  - >-
    https://www.figma.com/design/y36JOK2UFgeBR0xnPSdQcC/%F0%9F%8F%A2-Enroll---Business?node-id=199-4074&t=jpj415DO6PU0P1Sq-11
  - >-
    https://www.figma.com/design/y36JOK2UFgeBR0xnPSdQcC/%F0%9F%8F%A2-Enroll---Business?node-id=200-4642&t=jpj415DO6PU0P1Sq-11
  - >-
    https://www.figma.com/design/y36JOK2UFgeBR0xnPSdQcC/%F0%9F%8F%A2-Enroll---Business?node-id=199-4174&t=jpj415DO6PU0P1Sq-11
priority: medium
ordinal: 18000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the customers resource screen in the business dashboard. The screen has three states that must all be handled correctly.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Empty state: shown when no loyalty program exists yet (matches Figma node 199-4074)
- [ ] #2 Zero state: shown when a program exists but no customers have enrolled yet (matches Figma node 200-4642)
- [ ] #3 Populated state: shown when customers are present — list/table with customer data (matches Figma node 199-4174)
- [ ] #4 Screen is reachable via the customers nav item in the dashboard shell
- [ ] #5 Data is loaded from Supabase (customers table or equivalent)
<!-- AC:END -->
