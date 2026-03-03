# Enroll — Claude instructions

## Project overview

Enroll is an AI-first B2B SaaS for small service businesses (salons, spas, barbershops, clinics). It automatically analyzes a business and generates a tailored loyalty program aligned with its brand, services, and goals — giving SMBs access to enterprise-grade loyalty without the enterprise price tag.

This repo contains the POC, which validates the core hypothesis: AI can automatically understand a service business and generate a meaningful loyalty foundation in minutes.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| UI components | shadcn/ui |
| Database | Supabase (Postgres + Auth) |
| AI | Vercel AI SDK (Claude or OpenAI, provider-agnostic) |

## Key concepts

- **Business profile** — structured onboarding data: name, category, services, average ticket, brand tone, goals
- **Loyalty program** — AI-generated earn mechanics, reward tiers, bonus rules, and brand voice tailored to the business
- **Program preview** — read-only view of the generated program for the owner to review and refine

## POC scope

In scope: onboarding flow, AI generation, program preview, basic regeneration.

Out of scope: customer-facing tracking, POS integrations, payments, analytics, mobile app.

## Writing and style conventions

- **Sentence case only** for all headings and titles — never Title Case
  - Correct: `## Program preview`
  - Incorrect: `## Program Preview`
- No emojis unless explicitly requested
- Keep responses concise and direct
- Use markdown link syntax for file references: `[filename.ts](path/to/file)`
