---
id: TASK-34
title: Connect business and consumer apps to joinenroll.app domain
status: In Progress
assignee: []
created_date: '2026-03-17 18:45'
updated_date: '2026-03-17 18:52'
labels: []
dependencies: []
references:
  - apps/business/vercel.json
  - apps/consumer/vercel.json
  - apps/business/.env.local
  - apps/consumer/.env.local
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Point both Vercel deployments at the new joinenroll.app domain so the product has a permanent, professional home.

Domain structure decided:
- Business app (owner-facing): app.joinenroll.app
- Consumer app (loyalty member-facing): go.joinenroll.app
- Root joinenroll.app: redirect to app.joinenroll.app (or marketing page later)

Keep 2 separate Vercel deployments — the apps serve different users with different env vars and session contexts. No architectural change needed, purely domain + config wiring.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 https://app.joinenroll.app loads the business app with valid HTTPS and no browser warnings
- [ ] #2 https://go.joinenroll.app loads the consumer app with valid HTTPS and no browser warnings
- [ ] #3 http:// requests on both subdomains redirect to https://
- [ ] #4 joinenroll.app (root) redirects to app.joinenroll.app
- [ ] #5 OAuth redirect URIs (Google) are updated to use the new domains in both Supabase and Google Cloud Console
- [x] #6 Any hardcoded URLs in .env files or source code reference the new domains instead of Vercel-generated URLs
- [ ] #7 CORS configuration (if any) allows requests from the new domains
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Code changes committed:
- apps/business/.env.production — sets VITE_CONSUMER_URL=https://go.joinenroll.app (used by DashboardPage.tsx to build invite links)
- apps/root/vercel.json — redirect project for apex domain: joinenroll.app → app.joinenroll.app

Remaining ACs (#1–5, #7) require manual steps in Vercel dashboard, DNS registrar, Supabase, and Google Cloud Console. See instructions provided to user.
<!-- SECTION:NOTES:END -->
