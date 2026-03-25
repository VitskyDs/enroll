---
id: TASK-33
title: Add skippable branding stage to onboarding
status: To Do
assignee: []
created_date: '2026-03-16 18:16'
updated_date: '2026-03-21 08:12'
labels:
  - onboarding
  - branding
dependencies: []
references:
  - apps/business/src/App.tsx
  - apps/business/src/pages/onboarding/BasicsPage.tsx
  - apps/business/src/pages/onboarding/PreferencesPage.tsx
  - apps/business/src/hooks/useBasicsOnboarding.ts
  - apps/business/src/hooks/usePreferencesOnboarding.ts
  - apps/business/src/types/index.ts
  - apps/business/src/lib/supabase.ts
priority: medium
ordinal: 18500
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Businesses want their loyalty program to reflect their brand. This onboarding stage lets owners set a brand color, upload a logo, and set a cover image — all optionally. Skipping is always available so the flow never blocks progress.

The stage sits between existing onboarding steps (after BasicsPage, where the website URL is already known) and introduces a new route `/onboarding/branding`.

**Color**
- On load, attempt to extract a dominant brand color from the scraped website (website URL is available from BasicsPage state). Fall back to black (#000000) if extraction fails or no URL is present.
- Display a predefined palette of ~12 swatches for quick selection.
- Allow the user to click any swatch or the current color to open a color modifier (hue/saturation/lightness controls or similar).
- Provide a hex input field that updates the selected color and vice versa; validate that the value is a valid 6-digit hex.

**Logo**
- File upload (accept PNG, JPG, SVG, WebP). Show a preview after selection.
- Uploaded image is stored in Supabase Storage; the URL is saved to the business record.

**Cover image**
- File upload option (same accepted types as logo). Show a preview after selection.
- AI-generate option: clicking "Generate" calls an image generation API with a prompt derived from the business name, category, and brand personality already collected. Show a loading state while generating; display the result for acceptance or re-generation.
- Uploaded or accepted generated image is stored in Supabase Storage; the URL is saved to the business record.

**Skip behavior**
- A prominent "Skip for now" action is always visible.
- Skipping stores no branding data and proceeds to the next onboarding step.
- Partial data (e.g. color chosen but no logo) should be saved when the user clicks continue.

**Data persistence**
- Add columns to the `businesses` table: `brand_color` (text, nullable), `logo_url` (text, nullable), `cover_image_url` (text, nullable).
- Apply a Supabase migration for these columns.
- Update `BusinessProfile` in `src/types/index.ts` to include the new fields.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A new route `/onboarding/branding` exists and is reachable from the preceding onboarding step
- [ ] #2 The page has a visible 'Skip for now' action that advances to the next step without saving any branding data
- [ ] #3 On page load the color field is pre-populated with the dominant color extracted from the business website URL; if extraction fails or no URL exists, it defaults to #000000
- [ ] #4 A predefined palette of swatches is displayed and clicking one updates the selected color and hex input
- [ ] #5 The hex input accepts manual entry; invalid hex values are rejected with inline validation and the color state is not updated
- [ ] #6 A color modifier control (e.g. hue/saturation/lightness) is accessible from the current color swatch
- [ ] #7 Uploading a logo (PNG, JPG, SVG, WebP) shows a preview; other file types are rejected with an error message
- [ ] #8 Uploading a cover image shows a preview; other file types are rejected with an error message
- [ ] #9 Clicking 'Generate' on the cover image section calls an image generation API using business name, category, and brand personality; a loading state is shown during generation
- [ ] #10 A generated cover image is displayed for acceptance; the user can re-generate or replace with an uploaded file
- [ ] #11 Continuing with branding data uploads logo and/or cover image to Supabase Storage and saves the public URLs plus brand_color to the businesses row
- [ ] #12 The `businesses` table has new nullable columns: `brand_color` (text), `logo_url` (text), `cover_image_url` (text), applied via a Supabase migration
- [ ] #13 `BusinessProfile` type in `src/types/index.ts` includes `brand_color`, `logo_url`, and `cover_image_url` as optional/nullable fields
<!-- AC:END -->
