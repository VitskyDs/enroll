---
id: TASK-11
title: Figma design system setup
status: To Do
assignee: []
created_date: '2026-03-04'
updated_date: '2026-03-05 09:04'
labels:
  - infrastructure
dependencies: []
priority: medium
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Set up a Figma design system that connects cleanly to the codebase via the Figma MCP integration in Claude Code. The goal is a tight design-to-code workflow where Claude can read a selected Figma node and generate accurate shadcn/ui components with correct Tailwind tokens.

### Steps

1. **Install the Obra shadcn/ui Figma kit** (free, MIT licensed) — the community-recommended option from the official shadcn/ui docs. Import it into the project's Figma file.

2. **Map Figma variables to Tailwind/shadcn tokens** — create or update Figma color/spacing variables to match the project's CSS custom properties (zinc base color, shadcn new-york style). Key mappings:
   - `--background`, `--foreground`
   - `--primary`, `--primary-foreground`
   - `--muted`, `--muted-foreground`
   - `--border`, `--input`, `--ring`
   - `--radius`

3. **Document the workflow in CLAUDE.md** — add a short section explaining how to use the Figma MCP: select a node in Figma desktop → ask Claude to implement it → Claude calls `get_design_context` and generates shadcn code.

### Why this matters

Without a shadcn-aligned Figma kit, Claude generates generic HTML/CSS instead of `<Card>`, `<Button variant="outline">` etc. With matching variable names, Tailwind class inference is accurate rather than guessed from hex values.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Obra shadcn/ui kit imported into the project Figma file
- [ ] #2 Figma variables created and mapped to the project's shadcn/Tailwind tokens (zinc base)
- [ ] #3 Selecting a Figma node and asking Claude to implement it produces accurate shadcn component code
- [ ] #4 Workflow documented in CLAUDE.md
<!-- AC:END -->
