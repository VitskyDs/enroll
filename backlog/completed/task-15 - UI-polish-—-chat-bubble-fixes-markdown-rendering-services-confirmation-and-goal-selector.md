---
id: TASK-15
title: >-
  UI polish — chat bubble fixes, markdown rendering, services confirmation, and
  goal selector
status: Done
assignee: []
created_date: '2026-03-05 16:42'
updated_date: '2026-03-05 16:59'
labels: []
dependencies: []
references:
  - >-
    https://www.figma.com/design/y36JOK2UFgeBR0xnPSdQcC/Enroll---Mobile-V2?node-id=5-757
    — services confirmation actions
  - >-
    https://www.figma.com/design/y36JOK2UFgeBR0xnPSdQcC/Enroll---Mobile-V2?node-id=3-34770
    — ProgramPage goal selector with Rich Radio Group
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
A batch of small UI fixes and improvements across the onboarding chat flow.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Spinner replaces the Enroll 'E' avatar while the AI is processing — the E avatar is removed entirely
- [ ] #2 BasicsPage opening greeting is split into two messages: (1) 'Hi {name} 👋' or 'Hi there 👋' if no name available; (2) 'I'm here to help you set up your loyalty program in just a few minutes. To get started, **what's your business name or website URL?**'
- [ ] #3 Bold markdown (**text**) in chat messages renders as semibold text, not literal asterisks
- [ ] #4 After services are confirmed, the message reads: 'Great! The services are now added to your business. Next, let's set up your loyalty program.' with two action buttons — 'Continue' (primary/black) and 'Start over' (secondary/gray) — plus disclaimer text 'You can change these anytime' below
- [ ] #5 ProgramPage starts with a goal selection screen matching Figma frame 3-34770: heading 'Setting up the loyalty program', subheading, then a chat bubble asking about primary goal, followed by Rich Radio Group options (Gain new members, Retain customers, Increase recurring revenue) each with title + description + radio button
<!-- AC:END -->
