---
id: TASK-20
title: Wire InviteDrawer to real data and device APIs
status: Done
assignee: []
created_date: '2026-03-06 21:43'
updated_date: '2026-03-10 19:22'
labels: []
milestone: m-1
dependencies:
  - TASK-19
priority: medium
ordinal: 16000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace all InviteDrawer placeholders with real data and working interactions. Requires TASK-19 to be complete first.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Each business has a unique invite URL (https://enroll.app/join/<slug>) sourced from a slug column on the businesses table
- [ ] #2 QR code renders the real business invite URL using react-qr-code
- [ ] #3 Copy link button copies the invite URL to clipboard and shows brief 'Copied!' feedback
- [ ] #4 More / share button calls navigator.share({ url }) and falls back to clipboard copy if Web Share API is unavailable
- [ ] #5 WhatsApp opens wa.me/?text=<encoded>, Messages opens sms:?body=<encoded>, Email opens mailto:?body=<encoded>
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 QR code renders with real business URL on device
- [ ] #2 Copy and native share work on iOS Safari (tested via Vercel preview)
<!-- DOD:END -->
