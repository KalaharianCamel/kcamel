---
name: Matthew Suwiryo portfolio
description: A reference-led portfolio with a living soft blossom pink cell scene and restrained editorial pages.
colors:
  blue-top: "#788cb0"
  blue-bottom: "#aeb9d4"
  cell-blossom-pink: "#dc8b9a"
  ink: "#232323"
  paper: "#f0f0f0"
  line: "#d8d8d8"
  dark-line: "rgb(45, 45, 45)"
  black: "#000"
  white: "#fff"
  selection-lavender: "#706188"
  credit-ink: "#151b27"
  notice-ink: "#5d5d65"
  inline-code: "#e3e3e3"
  code-background: "#282c34"
typography:
  display:
    fontFamily: "Graphik, sans-serif"
    fontSize: "clamp(2rem, 8.1vw, 8.5rem)"
    fontWeight: 600
    lineHeight: 1.28
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Graphik, sans-serif"
    fontSize: "clamp(2.4rem, 6vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.5
  title:
    fontFamily: "Graphik, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Wotfard, serif"
    fontSize: "var(--fs-m)"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Wotfard, serif"
    fontSize: "var(--fs-s)"
    fontWeight: 400
    lineHeight: 1.5
  menu:
    fontFamily: "Graphik, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1.5
  code:
    fontFamily: "IBM Plex Mono, monospace"
rounded:
  square: "0"
  circular: "50%"
spacing:
  header-mobile: "24px"
  header-desktop: "48px"
  menu-tile: "45px"
  menu-tile-small: "30px"
  menu-line-gap: "8px"
  credit-gap: "10px"
  editorial-paragraph: "1.5rem"
  about-gap: "2rem"
motion:
  ease-out: "cubic-bezier(.16,1,.3,1)"
  menu-enter: "460ms"
  menu-exit: "260ms"
  grid-resize: "520ms"
  tagline-in: "460ms"
  tagline-out: "220ms"
components:
  menu-toggle:
    textColor: "{colors.paper}"
    width: "30px"
    height: "44px"
    rounded: "{rounded.square}"
  close-menu:
    textColor: "{colors.paper}"
    width: "40px"
    height: "44px"
  navigation-tile:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.menu}"
    padding: "{spacing.menu-tile}"
    rounded: "{rounded.square}"
  navigation-tile-hover:
    backgroundColor: "{colors.black}"
  topic-tag:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: ".25ch 1ch"
    rounded: "{rounded.square}"
  writing-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
  filter-link:
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
---

# Design System: Matthew Suwiryo portfolio

## Overview

Matthew Suwiryo's portfolio retains the reference blue atmosphere, soft blossom-pink biconcave cells, Graphik identity, and expanding charcoal menu. Confirmed content now describes a senior at DVHS, class of 2027, pursuing biology/pre-med with the goal of becoming a doctor. Contact links come from src/profile.js; custom tagline messages are preserved. Experiments and Writing are coming-soon pages, including legacy aliases.

The signature moment is a cohesive biological cluster responding to the pointer and gently settling. Supporting motion preserves continuity between taglines, navigation states, and pages. Keep the approved composition and colors.

## Color

Use the frontmatter tokens. The hero gradient remains #788cb0 to #aeb9d4; cell material remains #dc8b9a. Reading surfaces use #f0f0f0 and #232323 with thin #d8d8d8 rules. The inherited light-on-pastel hero contrast is a deliberate reference-fidelity tradeoff. No top-left monogram returns.

## Typography

Graphik carries the name, page headings, and navigation; Wotfard carries prose. The hero name uses clamp(2rem,8.1vw,8.5rem), with the existing phone override. About headings use clamp(2.4rem,5vw,4rem); empty-page headings use clamp(2.4rem,6vw,4.5rem). Reading copy uses the responsive --fs-m scale; About leading is 1.65. Taglines overlap in one grid area during their crossfade, with no blank-text interval.

## Layout

Keep the 100svh hero, centered copy, forty-cell cluster, top-right menu, and lower-right credit. At 768px, navigation changes from a stacked list to its asymmetric five-by-five grid. Desktop hover/focus proportions use five explicit fractional tracks, so all states interpolate continuously. Contact links wrap safely. A text Home link remains reachable in the mobile menu; the desktop noise tile links home.

About is a centered reading column up to 650px, with Matthew's name, DVHS/class metadata, biography, and actual email/GitHub links. No reference-author portrait or biography is shown. Experiments and Writing use a restrained heading, rule, Coming soon message, and Back to home link. Legacy routes show the corresponding same empty state.

## Elevation & Depth

Keep flat editorial surfaces. Hero depth comes from closed biconcave meshes and matcap shading. The simulation runs at a fixed 120Hz with interpolated display frames and at most eight catch-up steps. Pointer damping and force-based interactions prevent teleporting. A bounded outward pulse replaces instant click impulses. Mesh complexity and pixel ratio are capped. Scene rendering pauses for hidden documents and open menus.

Menu entry is a 460ms curtain; exit is 260ms, including Escape and link navigation. Labels use a small bounded stagger. Grid resizing takes 520ms. Text enters in 460ms and exits in 220ms with small vertical/blur changes. Noise updates near 12fps only while visible. Native cross-document View Transitions fade between pages where supported; ordinary navigation is the fallback.

Reduced motion removes spatial movement, continuous cell motion, noise, and page choreography, preserving 100–140ms opacity feedback for meaningful state changes. All animations are interruptible; repeated Escape uses one closing task.

## Shapes

The cell is the governing form. Keep forty pink biconcave meshes and the original blue field. Reading pages use square edges and thin rules. A circular home monogram is confined to the desktop menu; no portrait placeholder or new decorative emblem is needed.

## Components

Menu controls use native buttons, named actions, a 2px visible focus outline, and 44px height. The native dialog retains focus containment, cancellation, and focus return after its exit finishes. Contact rows render only supplied profile fields and derive labels from the actual URLs. Tagline text remains available as the heading's accessible name while the outgoing line is hidden from assistive technology.

The reference filter/tag/writing-card token definitions and sidecar specimens are retained as dormant reference material for future user-authored content. They are not rendered by the current coming-soon pages. README documents source ownership and customization; .impeccable/motion-review.md records validation and limits.

## Do's and Don'ts

- Preserve the user's custom messages, approved palette, cell count, and uncluttered composition.
- Keep school/year, contact information, and medical aspiration factual; do not invent activities or credentials.
- Keep Experiments and Writing empty until the user supplies material.
- Use time-based physics, bounded work, and native motion fallbacks.
- Keep reduced-motion feedback meaningful and navigation available by keyboard.
- Do not add dependencies, repeated section reveals, or decorative hover motion to static prose.
