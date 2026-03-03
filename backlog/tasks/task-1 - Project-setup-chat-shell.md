---
id: TASK-1
title: Project setup + chat shell
status: Done
assignee: []
created_date: '2026-03-02 19:17'
updated_date: '2026-03-02 20:07'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Scaffold the Enroll POC and build a working chat UI with a complete onboarding state machine — no AI or Supabase calls yet. By the end of this task the app should run locally, the chat should step through all onboarding questions, and stubbed service/goal selection UIs should render inline.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Vite + React + TypeScript app runs locally with `npm run dev`
- [ ] #2 Tailwind and shadcn/ui are configured; button, input, and scroll-area primitives work
- [ ] #3 Chat UI renders a scrollable message list with distinct user and AI bubbles
- [ ] #4 Chat input is disabled during automated steps and re-enabled for user input steps
- [ ] #5 State machine steps through all 11 steps with hardcoded/stubbed responses (no live AI calls)
- [ ] #6 ServiceSelector renders a list of stubbed services as toggleable cards (all pre-selected by default) with a confirm button
- [ ] #7 GoalSelector renders 3 option cards inline; selecting one advances the state
- [ ] #8 `.env.example` documents all required environment variables
- [ ] #9 All lib singletons (anthropic, supabase, jina) are wired up and ready to use in the next task
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Scope

Infrastructure and UI only. No live AI or Supabase calls. All AI phases (crawling, extracting, generating, saving) use hardcoded stubs so the full flow can be tested without API keys.

## Implementation order

1. `npm create vite@latest . -- --template react-ts`
2. Install deps: tailwindcss, postcss, autoprefixer, @radix-ui/react-scroll-area, @radix-ui/react-slot, class-variance-authority, clsx, tailwind-merge, lucide-react, @anthropic-ai/sdk, @supabase/supabase-js
3. Configure tailwind.config.ts, postcss.config.js, update src/index.css with shadcn CSS variables
4. Run `npx shadcn@latest init` and add button, input, scroll-area
5. Create .env.example
6. Create src/lib/ singletons (anthropic.ts, supabase.ts, jina.ts, utils.ts)
7. Create src/types/index.ts
8. Build chat components: ChatShell, MessageList, ChatMessage, ChatInput, TypingIndicator
9. Build ServiceSelector (stub services, toggle cards, confirm button)
10. Build GoalSelector (3 option cards, single-select)
11. Build useOnboarding hook with full state machine; stub AI steps with setTimeout + hardcoded data
12. Build placeholder ProgramPreview (shows "Program ready" + raw draft data)
13. Wire App.tsx to switch between chat and preview
<!-- SECTION:PLAN:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Chat state machine covers all 11 steps: greeting → collect_name → collect_type → collect_website → crawling → extracting → confirm_services → collect_goal → generating → saving → done
- [ ] #2 Service selection UI renders extracted services as toggleable cards (all pre-selected); user can deselect before confirming
- [ ] #3 Goal selection UI renders 3 option cards inline in chat; single-select
- [ ] #4 Project scaffolded with Vite react-ts template
- [ ] #5 Tailwind configured with shadcn CSS variables in index.css
- [ ] #6 shadcn button, input, scroll-area components added
- [ ] #7 ChatShell, MessageList, ChatMessage, ChatInput, TypingIndicator components built
- [ ] #8 ServiceSelector and GoalSelector components built with stub data
- [ ] #9 useOnboarding hook implements full 11-step state machine with stubbed AI phases
- [ ] #10 App.tsx switches between chat and a placeholder ProgramPreview
- [ ] #11 src/lib/ singletons created (anthropic.ts, supabase.ts, jina.ts, utils.ts)
- [ ] #12 src/types/index.ts created with types matching DB schema column names
<!-- DOD:END -->
