---
id: TASK-7
title: Refine onboarding UX and conversation flow
status: To Do
assignee: []
created_date: '2026-03-03 00:00'
updated_date: '2026-03-04 10:05'
labels: []
milestone: m-0
dependencies:
  - TASK-5
priority: medium
ordinal: 7000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The onboarding flow works end-to-end but needs polish before it's ready for real users. Several UX rough edges remain: no input validation, thin copy, abrupt transitions, and the chat input is active during steps where it shouldn't be (e.g. during generation or when a widget is shown). Tighten these up so the experience feels intentional and production-ready.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Business name input is validated — empty or whitespace-only submissions are rejected with an inline nudge ("Please enter your business name")
- [ ] #2 Chat input is disabled (or hidden) during async steps (`crawling`, `extracting`, `generating`, `saving`, `reviewing`) and when a widget is active (`confirm_services`, `collect_goal`)
- [ ] #3 The business category step accepts a broader range of inputs (e.g. "hair salon", "day spa", "barber shop") and provides a helpful re-prompt on unrecognised input instead of silently falling back to "other"
- [ ] #4 Review the full message copy — ensure tone is warm, concise, and consistent throughout
- [ ] #5 Replace the typing indicator with a shadcn spinner during async processing steps (`crawling`, `extracting`, `generating`, `saving`) so users have a clear visual signal that work is in progress
- [ ] #6 The GoalSelector and ServiceSelector widgets are hidden once the user has confirmed their choice (i.e. only show while the step is active)
<!-- AC:END -->



## Notes

Current state: widgets are already conditionally rendered based on `state.step` in `App.tsx` for `service_selector` and `goal_selector`, so #6 is partially handled. The main gap is that the chat input (`ChatShell`) doesn't block submission during async steps — check `src/components/chat/ChatShell.tsx` for the send handler.

For the spinner: use the shadcn `Loader2` icon from `lucide-react` with `animate-spin` — no additional shadcn component install required. Replace the `isTyping` three-dot animation in `ChatShell` or swap it contextually based on `step`.
