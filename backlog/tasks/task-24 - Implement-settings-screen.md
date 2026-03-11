---
id: TASK-24
title: Implement settings screen
status: Done
assignee: []
created_date: '2026-03-07 15:35'
updated_date: '2026-03-10 19:22'
labels: []
dependencies: []
priority: medium
ordinal: 14000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the Settings screen as a full-page overlay triggered from the navbar's menu (hamburger) icon.

## Design

The screen is a full-screen list of navigation links grouped under a "Settings" heading. Each row has an icon on the left and a label.

Menu items (in order):
- Home — house icon
- Customers — users-round icon
- Invite customer — send icon
- Services — hand-heart icon
- Products — shopping-bag icon
- Loyalty program — loyalty icon
- Chat — sparkles icon
- Brand — hexagon icon
- Payment provider — hand-coins icon

Layout:
- Light stone/gray background (`#fafafa`)
- Header: "Settings" in heading-3 style, full-width, `pt-16 pb-4 px-4`
- Main content: `p-4`, vertical list with `gap-4` between items
- Each menu item row: `h-10`, icon (24×24) + label in heading-4 style (20px semibold, `#404040`)
- Navbar fixed at bottom (same as other screens)

## Entry / exit animation

The screen slides in/out over the existing content (not a route change — it overlays on top):
- Animate `opacity` 0→1 and `translateY` 8px→0 on enter
- Reverse on exit
- Duration: 300ms, easing: ease-out

## Behaviour

- Tapping the menu icon in the navbar opens the Settings overlay
- The menu icon gets an active/highlighted state when the overlay is open (matches the Figma — `bg-[#f5f5f5]` pill background)
- Tapping a menu item navigates to the relevant route (or is a no-op placeholder if the route doesn't exist yet)
- No close button — tapping the menu icon again closes it (toggle)
- Overlay sits above all page content; navbar remains visible beneath it
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Menu icon in navbar opens the Settings overlay on tap
- [ ] #2 Overlay animates in with opacity + translateY (0→8px reversed) over 300ms
- [ ] #3 Overlay animates out with the reverse transition on close
- [ ] #4 All 9 menu items render with their correct icons and labels
- [ ] #5 Tapping the menu icon again closes the overlay
- [ ] #6 Menu icon shows active state (highlighted pill) while overlay is open
- [ ] #7 Tapping a menu item navigates to the route if it exists, or is a no-op placeholder
<!-- AC:END -->
