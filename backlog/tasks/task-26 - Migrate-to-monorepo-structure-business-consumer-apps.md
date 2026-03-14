---
id: TASK-26
title: Migrate to monorepo structure (business + consumer apps)
status: In Progress
assignee: []
created_date: '2026-03-10 19:35'
updated_date: '2026-03-14 19:00'
labels:
  - architecture
  - infrastructure
milestone: m-3
dependencies: []
priority: medium
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Restructure the repo into a monorepo to support the business app and a future consumer app as separate deployable units, sharing common types, Supabase client, and utilities.

## Target structure

```
apps/
  business/    ← current app (moved here)
  consumer/    ← new consumer-facing PWA (mobile-first)
packages/
  shared/      ← types, supabase client, utils, prompts
```

## Why

The consumer app (customer loyalty wallet) is genuinely different from the business app — different auth, different UX, different audience. Keeping them in one Vite project would become painful. A monorepo keeps them independent while sharing the DB layer and types.

## Scope

- Set up monorepo tooling (npm workspaces or Turborepo)
- Move current app into `apps/business/`
- Extract shared code into `packages/shared/` (types, `src/lib/supabase.ts`, utils)
- Scaffold `apps/consumer/` as a new Vite + React project (mobile-first, PWA manifest)
- Update Vercel config to deploy both apps independently
- Confirm `apps/business/` works identically after the move (no regressions)
<!-- SECTION:DESCRIPTION:END -->
