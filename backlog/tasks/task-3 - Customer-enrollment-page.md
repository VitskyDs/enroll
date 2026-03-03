---
id: TASK-3
title: Customer enrollment page
status: To Do
assignee: []
created_date: '2026-03-02 19:17'
updated_date: '2026-03-02 20:10'
labels: []
dependencies:
  - TASK-1
priority: high
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Goal: Show the "join → earn points" flow works.

- Public landing page accessible by URL or QR code
- Displays business name, services, and loyalty offer (e.g. "Earn 1 point per $1")
- "Join loyalty program" button
- Creates customer record in Supabase (customers table)
- Shows customer loyalty dashboard:
  - Points balance
  - Next reward (static, e.g. "Get $10 off at 100 points")
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Public enrollment page is accessible without authentication
- [ ] #2 Business name, services, and loyalty offer are displayed
- [ ] #3 Joining creates a customer record in Supabase
- [ ] #4 Customer sees their points balance and next reward after joining
<!-- AC:END -->
