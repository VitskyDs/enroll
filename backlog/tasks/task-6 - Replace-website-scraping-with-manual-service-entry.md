---
id: TASK-6
title: Replace website scraping with manual service entry
status: In Progress
assignee: []
created_date: '2026-03-03 00:00'
updated_date: '2026-03-05 10:27'
labels: []
milestone: m-0
dependencies:
  - TASK-5
priority: high
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current Jina.ai website scraping step is unreliable — most real-world salon and spa websites use bot protection (Cloudflare, etc.) that causes Jina to return 500 errors. Replace the crawl + extract phases with a more reliable alternative so the onboarding flow consistently reaches the service selector with useful data.

Two options to evaluate and choose between:

**Option A — Manual entry**: Remove the website URL step entirely. Instead, ask the business owner to type in their top 3–5 services directly (name and optional price). Simpler, zero failure rate, no external dependency.

**Option B — Alternative scraper**: Swap Jina for a different approach — e.g. a Supabase Edge Function that uses Puppeteer or Playwright (bypasses bot protection), or a third-party scraping API with better JavaScript rendering support (e.g. Browserless, ScrapingBee, Firecrawl).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The unreliable Jina scraping step is removed or replaced
- [ ] #2 The onboarding flow reliably reaches the service selector with real data
- [ ] #3 If manual entry is chosen: user can enter services (name + optional price) as free text or structured input
- [ ] #4 If alternative scraper is chosen: at least 80% success rate on real salon/spa websites
- [ ] #5 The `src/lib/jina.ts` singleton and `VITE_JINA_API_KEY` env var are removed if no longer used
- [ ] #6 ProgramPreview and generateProgram prompt remain unchanged
<!-- AC:END -->



## Notes

Current state: `src/lib/jina.ts` calls `https://r.jina.ai/{url}`. The 500 errors are from the target site blocking Jina's crawler, not from our code. The error handling already degrades gracefully to an empty service list.

If going with Option A (manual entry), the `collect_website` and `crawling`/`extracting` steps in `useOnboarding.ts` would be replaced with a `collect_services` step that prompts the user to list their services.
