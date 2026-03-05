---
id: TASK-13
title: Deploy to Vercel
status: To Do
assignee: []
created_date: '2026-03-04 00:00'
updated_date: '2026-03-05 09:29'
labels: []
milestone: m-0
dependencies:
  - TASK-9
priority: medium
ordinal: 1300
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Deploy the POC to Vercel so it can be shared and tested without running locally. No custom domain is needed — the default Vercel URL is sufficient. Environment variables (Supabase URL/key, Anthropic key) must be configured in the Vercel project settings.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The app is deployed to Vercel and accessible at the generated Vercel URL
- [ ] #2 All environment variables are set in Vercel project settings (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ANTHROPIC_API_KEY`)
- [ ] #3 The full onboarding flow works end-to-end on the deployed URL (chat, AI generation, Supabase save)
- [ ] #4 No local-only config or `localhost` references remain in production code
<!-- AC:END -->
