---
id: TASK-19
title: Implement InviteDrawer UI
status: Done
assignee: []
created_date: '2026-03-06 21:43'
updated_date: '2026-03-07 05:54'
labels: []
milestone: m-1
dependencies: []
priority: medium
ordinal: 13000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the InviteDrawer as a bottom sheet that opens when the user taps "Invite customers" on the dashboard. This task is UI/UX only — no real QR code generation, no working share buttons, no real URLs.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tapping 'Invite customers' on DashboardPage opens the drawer
- [ ] #2 Drawer contains: title + close button, QR code placeholder (static gray dashed box), dummy invite URL pill (e.g. enroll.app/join/your-business), 'Copy link' button (visible, inert), share row with WhatsApp / Messages / Email / More buttons (visible, inert)
- [ ] #3 Drawer closes on close button and on backdrop tap
- [ ] #4 Matches zinc palette and type scale of the dashboard
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 InviteDrawer opens and closes correctly on mobile
- [ ] #2 Share buttons and copy button are visible but non-functional (no onClick required)
<!-- DOD:END -->
