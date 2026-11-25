import { readFile, writeFile } from 'node:fs/promises';
let design = await readFile('DESIGN.md', 'utf8');
let front = design.match(/^---\r?\n[\s\S]*?\r?\n---/)[0];
front = front.replace('clamp(2rem, 5vw + 1rem, 4rem)', 'clamp(2.4rem, 6vw, 4.5rem)');
front = front.replace('components:', 'motion:\n  ease-out: "cubic-bezier(.16,1,.3,1)"\n  menu-enter: "460ms"\n  menu-exit: "260ms"\n  grid-resize: "520ms"\n  tagline-in: "460ms"\n  tagline-out: "220ms"\ncomponents:');
const overview = `Matthew Suwiryo's portfolio retains the reference blue atmosphere, soft blossom-pink biconcave cells, Graphik identity, and expanding charcoal menu. Confirmed content now describes a senior at DVHS, class of 2027, pursuing biology/pre-med with the goal of becoming a doctor. Contact links come from src/profile.js; custom tagline messages are preserved. Experiments and Writing are coming-soon pages, including legacy aliases.`;
const body = `

# Design System: Matthew Suwiryo portfolio

## Overview

${overview}

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
`;
await writeFile('DESIGN.md', front + body);
const sidecar = JSON.parse(await readFile('.impeccable/design.json', 'utf8'));
sidecar.generatedAt = new Date().toISOString();
sidecar.extensions.motion = [
  { name: 'menu-enter', value: '460ms cubic-bezier(.16,1,.3,1)', purpose: 'Interruptible native-dialog curtain reveal; 120ms opacity under reduced motion.' },
  { name: 'menu-exit', value: '260ms cubic-bezier(.4,0,1,1)', purpose: 'Close button, Escape, and route links share one closing promise; reduced motion uses 100ms opacity.' },
  { name: 'grid-expansion', value: '520ms cubic-bezier(.16,1,.3,1)', purpose: 'Five matching fractional grid tracks interpolate across hover/focus states.' },
  { name: 'tagline-change', value: '220ms out / 460ms in', purpose: 'Overlapping opacity, 8px movement, and bounded 2px blur; 1600ms input throttle.' },
  { name: 'physics', value: '120Hz / 8-step cap', purpose: 'Fixed-step simulation, interpolated display, exponentially damped pointer, smooth outward pulse.' },
  { name: 'noise', value: '80ms minimum interval', purpose: 'Low-frequency texture refresh while visible and the menu is open.' },
  { name: 'page-continuity', value: '160ms out / 300ms in', purpose: 'Native same-origin View Transitions, with normal-navigation fallback.' },
  { name: 'reduced-motion', value: '100–140ms opacity', purpose: 'Static scene; no spatial effects, with meaningful tagline/menu feedback preserved.' },
];
sidecar.narrative.overview = overview;
sidecar.narrative.keyCharacteristics = ['Soft blossom-pink biological cells over a muted blue gradient.', 'Fixed-step fluid motion with interpolated display frames.', 'Overlapping custom tagline messages.', 'An expanding native dialog with animated entry and exit.', 'Matthew’s confirmed biography/contact information and honest coming-soon pages.'];
for (const component of sidecar.components) {
  if (['Technology Filter', 'Topic Tag', 'Writing Entry'].includes(component.name)) component.description = 'Dormant reference specimen for future content. ' + component.description;
  if (component.name === 'Menu Toggle') component.css = component.css.replace('transform .4s ease-in-out', 'transform 360ms cubic-bezier(.16,1,.3,1)').replace('translateY(8px)', 'translateY(2px)').replace('translateY(-8px)', 'translateY(-2px)');
  if (component.name === 'Close Menu') component.css = component.css.replace('transform .3s', 'transform 320ms cubic-bezier(.16,1,.3,1)');
  if (component.name === 'Navigation Tile') component.css = component.css.replace('background-color .4s', 'background-color 280ms ease');
}
await writeFile('.impeccable/design.json', JSON.stringify(sidecar, null, 2) + '\n');
