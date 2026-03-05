---
id: TASK-12
title: Chat processing spinner
status: To Do
assignee: []
created_date: '2026-03-04'
updated_date: '2026-03-05 09:29'
labels: []
milestone: m-0
dependencies: []
priority: medium
ordinal: 8000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a visual spinner animation to the chat shell that appears while the AI is processing (between the user sending a message and the first response tokens appearing).

### Current state
When the user submits a message, there is no visual feedback until the AI starts streaming tokens. This can feel broken or slow, especially during longer operations like website scraping or program generation.

### Expected behavior
- A spinner appears in the message list immediately after the user submits a message
- The spinner disappears once the assistant message starts streaming
- The spinner should be styled consistently with the existing chat UI (neutral, minimal)
- Works for all processing phases: service extraction, program generation, and any intermediate AI calls

### Implementation notes
- Add a `isProcessing` boolean to the chat/onboarding state (or derive it from existing state)
- Render a spinner row at the bottom of `MessageList` when `isProcessing` is true
- Use a CSS animation or a shadcn/ui compatible spinner — keep it simple (e.g. a rotating circle via Tailwind `animate-spin`)
- The spinner row should look like a chat bubble from the assistant side to maintain layout consistency
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A spinner appears immediately after the user submits a message
- [ ] #2 The spinner disappears as soon as the first streaming token arrives
- [ ] #3 The spinner is visually consistent with the chat UI
- [ ] #4 No spinner is shown when the chat is idle
- [ ] #5 Works across all processing phases (scraping, extraction, generation)
<!-- AC:END -->
