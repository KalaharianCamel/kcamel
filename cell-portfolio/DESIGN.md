---
name: Cell portfolio
description: A scroll-driven journey from a closed cell into an unfolding biological specimen.
colors:
  ground: "#1c1d1b"
  paper: "#ecebe6"
  muted: "#b6b7af"
  line: "#4c4c45"
  sand: "#bf6721"
  action-fill: "#b15b1c"
  copper: "#e0a06d"
  panel: "#24251f"
  sand-hover: "#a95619"
  action-ink: "#fff"
  membrane-surface: "#754325"
  membrane-edge: "#b6794e"
  membrane-facet: "#b56a35"
  electron-ground: "#dfe4e1"
  electron-paper: "#1c3028"
  electron-muted: "#46584f"
  electron-line: "#9daea3"
  electron-signal: "#326856"
  electron-panel: "#e8ece9"
  electron-field-line: "#73897b"
  ruler-ground: "#302f2d"
  ruler-tick: "#8d8a81"
  ruler-tick-active: "#c0bbae"
  ruler-marker: "#ff6b5e"
  ruler-focus: "#ffb4a9"
typography:
  display:
    fontFamily: "Graphik, Arial, sans-serif"
    fontSize: "clamp(64px, 7.2vw, 104px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Graphik, Arial, sans-serif"
    fontSize: "clamp(38px, 4.3vw, 64px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-.035em"
  title:
    fontFamily: "Graphik, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-.035em"
  body:
    fontFamily: "Wotfard, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Wotfard, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  action: "3px"
  circle: "50%"
  ruler: "20px"
  ruler-target: "4px"
  ruler-tooltip: "6px"
  ruler-marker: "2px"
spacing:
  compact: "8px"
  label: "12px"
  small: "16px"
  row: "20px"
  section: "24px"
  content: "32px"
  chapter: "40px"
  edge: "clamp(24px, 4.6vw, 88px)"
components:
  primary-link:
    backgroundColor: "{colors.action-fill}"
    textColor: "{colors.action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "14px 19px"
  primary-link-hover:
    backgroundColor: "{colors.sand-hover}"
  detail-button:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    padding: "9px 0"
  detail-button-hover:
    textColor: "{colors.copper}"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.circle}"
    width: "44px"
    height: "44px"
  project-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.paper}"
    width: "min(600px, 51vw)"
    height: "100dvh"
  project-panel-electron:
    backgroundColor: "{colors.electron-panel}"
    textColor: "{colors.electron-paper}"
  chapter-ruler:
    backgroundColor: "{colors.ruler-ground}"
    rounded: "{rounded.ruler}"
    padding: "8px 18px"
    width: "clamp(360px, 27vw, 520px)"
    height: "60px"
  chapter-marker:
    backgroundColor: "{colors.ruler-marker}"
    rounded: "{rounded.ruler-marker}"
    width: "4px"
    height: "24px"
---

# Design System: Cell portfolio

## Overview

**Creative North Star: "The Unfolding Specimen"**

A dark technical specimen study carries the portfolio, with an explicit pale electron-microscopy state in Project 2. An opaque, low-poly copper-brown cell physically separates into two solid half-shells, holds its anatomical cut faces in view, then opens the way to sparse contours, faceted translucent organelles, and warm sand highlights. The user's Anime.js reference governs the choreography: the actual document scroll position advances the perspective camera, repeatedly separates and reconstructs selected structures, and docks the cell beneath an electron column before a smooth palette fade. The same specimen travels continuously across one permanent viewport-sized projection plane as the reading columns exchange sides. HTML reading surfaces keep a solid ground beneath the copy and feather that cover into the moving scene at every edge. Reading reaches full opacity at its study hold; entrance and exit opacity follow the same scroll timeline as the specimen.

HTML carries the reading and interaction. The procedural scene supplies orientation and continuity; it does not replace project text, chapter navigation, or a readable detail panel. Personal details remain editable placeholders until the owner supplies them.

**Key Characteristics:**
- Charcoal, off-white text, sand actions, and copper annotations, with a pale silver-green electron-imaging exception in Project 2.
- Local Graphik headings and Wotfard reading text.
- Alternating reading columns with solid cores and feathered edges over one permanent projection plane with continuously traveling low-poly geometry.
- A lower-right charcoal capsule provides chapter navigation through five separated tick groups and a coral position marker; category names appear on hover or keyboard focus.
- Half-distance desktop scrolling and faster touch scrolling ease the real document position so copy, specimen, active category, and ruler stay aligned.
- A closed exterior, held split cross-section, forward camera entry, organelle studies, and repeated reconstruction.
- A tiny cell docks in a glass Petri dish in Project 2, holds before camera magnification, then enters monochrome imaging; Project 3 restores the warm palette.
- Hairlines, specimen contours, and measured progress marks.
- Closed, split, interior, and microscope diagrams preserve the journey in fallback and reduced motion.

## Colors

Warm mineral accents sit on near-black olive charcoal. The electron-imaging state deliberately breaks into pale silver-green, dark green text, and monochrome specimen rendering.

### Primary
- **Sand:** Selected structural marks and the nucleolus; this is the owner's Minecraft red sand brand accent.
- **Action fill:** The deeper sand variant used beneath white introduction-action text to preserve contrast.
- **Copper:** Focus outlines outside the ruler, secondary actions, and annotation points. The scene uses closely related material colors rather than a separate UI accent system.
- **Sand hover:** A darker state for the filled action.
- **Membrane surface and edge:** The static exterior uses an opaque brown fill and lighter copper-brown outline. The WebGL exterior uses the membrane-facet token with flat shading and directional light to expose broad planar faces; no surface noise is applied. These illustration colors are intentional material values, not additional action accents.
- **Electron signal:** Replaces sand and copper for scene emphasis, focus outside the ruler, viewfinder corners, and annotations during electron imaging. The navigation capsule retains its own stable palette.
- **Ruler marker and focus:** Coral marks progress within the current category; pale coral identifies keyboard focus on each chapter target.

### Neutral
- **Ground:** The page and stage background outside electron imaging.
- **Paper:** Headings, principal labels, and navigation tooltip text.
- **Muted:** Body copy and secondary metadata.
- **Line:** Low-contrast structural rules around metadata, entries, and the panel.
- **Panel:** A slightly lighter reading surface for project details.
- **Action ink:** White text on the sand action.
- **Electron ground, paper, muted, and line:** A coordinated state override for the page, reading text, secondary text, and separators. The pale ground supports a dark specimen and green microscope marks.
- **Electron panel and field line:** The microscope project’s detail panel and sticky panel bar use a lighter pale surface beneath dark text; the placeholder border uses a distinct green-gray stroke.
- **Ruler ground and ticks:** A separate charcoal capsule and tooltip surface, quiet gray tick groups, and lighter active or hovered ticks. This navigation surface remains charcoal during electron imaging.

**The Warm Signal Rule.** Sand and copper identify actions, selection, and specimen emphasis; preserve the quieter neutral reading field around them.

**The Electron Fade Rule.** Fade the page, solid reading cores and their feathered edges, text, lines, and panels together after microscope docking. Ease the specimen filter and viewfinder opacity with them, then fade back to the warm world for Project 3. Keep this exception tied to electron imaging and retain the capsule’s stable palette.

## Typography

**Display Font:** Graphik, with Arial and sans-serif fallback.
**Body Font:** Wotfard, with Arial and sans-serif fallback.

**Character:** Regular-weight headings are large and tightly spaced. The softer body face carries prose and small technical labels. Both families are local font assets reused from the parent workspace's `public/fonts`; no external font service is required.

### Hierarchy
- **Display:** The name uses the display token; the mobile override is (68px).
- **Headline:** Chapter headings use the headline token; tablet and mobile normally use (42px). Mobile Contact uses (clamp(32px, 8.8vw, 42px)) to keep its invitation heading on one line. Project headings use (clamp(40px, 4.4vw, 64px)), then (40px) on tablet and (42px) on mobile.
- **Title:** The default smaller heading uses the title token. Experience names narrow to (19px) with a (1.3) line height; the detail heading uses (40px), then (36px) on mobile, with a (1.12) line height and wrapping for long titles.
- **Body:** The body token is the baseline. Project summaries use (17px), line height (1.65), and a (38ch) maximum; mobile summaries use (16px). Introduction copy grows fluidly from (18px) to (23px). Detail-panel paragraphs stop at (65ch).
- **Label:** Actions use the label token. Supporting metadata and annotations step down through (12px), (11px), and (10px); chapter tooltips use (11px).

**The Reading Layer Rule.** Keep narrative copy in HTML and reserve the scene's labels for orientation. Do not make the specimen the only route to information.

## Layout

Desktop uses one permanent, fixed illustration stage spanning the viewport (100% width, 100svh height). Chapter changes do not move or resize its projection bounds. Scroll-space framing interpolates the specimen's normalized screen position and closing scale, then translates it through the shared world as the reading composition changes sides. The renderer and annotation projections use this same full-viewport coordinate system. Reading content with a solid core and feathered ground occupies a sticky column, normally (31%) wide with a (420px) maximum; right-hand columns use (30%) with a (400px) maximum. Shared side padding uses the edge token. The sole chapter navigation sits at the lower right; the top edge stays clear of a header or duplicate identity.

The introduction places copy left and a closed cell right. A separate entry section between the introduction and projects hides its empty reading wrapper, giving the held split and camera passage the whole frame within the unchanged projection stage. Projects one and three place copy right and the selected specimen left; project two places copy left and the specimen right. Experience places copy left beside folded networks; Academics also places copy left, with warm ribosome clusters on the right and honors clear of the lower-right capsule. Project copy rests at different viewport heights: (22svh), (32svh), and (20svh); the first position keeps its action clear of the lower-right navigation. Standard project chapters use (180svh); Project 2 extends to (240svh) for microscope docking and inspection, while Academics uses (160svh). Contact centers a reading column of at most (680px) beneath the reassembled cell, with the specimen framed above it in the permanent stage, copy sticky at (58svh), and a (130svh) desktop chapter with bottom clearance (max(96px, 14svh)). The full closed-cell silhouette stays above the invitation; final framing scales it to (.52) at a normalized vertical offset (.27). Labels exchange sides with the specimen, and leader paths route from projected organelle positions to the nearest label edge. The initial exterior has no organelles, labels, or annotation lines visible.

The structure is open rather than a card grid. Metadata uses two columns and horizontal rules; experience and academic entries stack with thin separators. Empty metadata, entry subtitles, contact-link groups, and detail-link groups collapse rather than leaving unused spacing. Reused gaps and paddings cluster around the spacing tokens, while chapter height is deliberately viewport-based to give the object time to unfold.

From (701px) to (1000px), right-hand copy widens to (34%) and project metadata stacks. At (700px) and below, the specimen occupies the upper part of the viewport and HTML content flows below it in full-width reading blocks using the current ground. Desktop side alternation collapses into this single column. Secondary scene annotation is hidden, and the detail panel takes the full width. The canvas keeps its full-viewport bounds on phones; framing places the specimen in the upper region, and solid reading cores with feathered edges support the reading layer beneath it. Introduction copy begins at (42svh), while later reading blocks begin below their specimen region. Standard project chapters use (190svh) on phones. Project 2 extends to (280svh), with copy synchronized to electron imaging and a measured sticky offset that clears the capsule. Its reading wrapper reserves bottom padding of (calc(96px + env(safe-area-inset-bottom))) so the project action clears the fixed capsule. Academics uses (180svh). Contact takes its height from its content on phones (min-height: 0), with its centered column beneath the cell and relative copy beginning at (58svh), a bottom margin (120px), and no preceding masking fade. Its final framing uses a vertical offset (.31) and scale (.82) so the complete silhouette stays clear of the invitation. The bottom capsule keeps five equal targets and clear gaps on mobile; category names remain available to assistive technology and appear visually on hover or keyboard focus.

## Elevation & Depth

Depth belongs primarily to the specimen: an opaque faceted exterior, two independently translated and rotated half-shells with solid anatomical cut faces, perspective camera travel, coarse translucent interior surfaces, and sparse contour rings. The modeled electron column, holder, stage plate, beam, and glass Petri dish make tiny-specimen placement visible before the imaging switch. Transparent dish walls, a liquid bed, and double rims give the holder a readable physical surface. Warm directional lighting eases into dark monochrome through the imaging filter. The page's reading structures stay flat. The illustration travels through one permanent viewport plane; solid ground backs the reading cores and annotation labels; the reading cover fades beyond its core instead of ending at a hard rectangular edge. The navigation capsule is a flat tonal surface without a footer fade or shadow. The modal panel alone carries an ambient lateral shadow and dim backdrop; their exact values live in the sidecar.

**The Specimen Depth Rule.** Use physical depth to reveal the cell and tonal separation to support reading; avoid assigning floating elevation to ordinary text groups.

**The Continuous Travel Rule.** Keep the projection plane fixed across every chapter. Move and ease the same specimen through world space, retain ambient drift during holds, and approach the tiny docked cell with the camera for magnification.

**The Cushioned Reveal Rule.** Enter and leave every authored hold with zero velocity and acceleration. Apply one ease to each physical stage from raw scroll progress. Clear the shell before unfolding the interior, pack the interior before closing the shell, and ease perspective magnification without compressing movement into a late burst.

**The Contained Closure Rule.** Pack every organelle and split internal structure inside the membrane before the half-shells close. Drive shell and interior assembly from the same scroll pose.

## Shapes

Asymmetric low-poly membranes, broad triangular faces, and simplified curved internal structures define the visual identity. Flat normals and subdued highlights expose the geometry. Sparse anatomical contours and simplified folds preserve biological recognition without photorealistic texture. The HTML interface is restrained: thin rules, a barely rounded filled action, circular close control, simple arrow SVGs, and small circular annotation points. The sole navigation uses a broad rounded capsule, separated tick groups, and a narrow coral marker. A dashed rectangle marks a missing project image honestly; it is not a decorative card treatment.

## Components

### Reading surfaces

Reading wrappers are transparent isolated layers. Every non-Contact wrapper paints a ground-colored cover behind its reading core; intersected horizontal and vertical alpha masks feather that cover beyond all text edges. Desktop feather widths are (120px) horizontally and (80px) vertically; mobile uses (32px) and (72px). Only the background cover is masked, leaving text and controls fully opaque. The cover inherits the active ground color, so its core and edges follow the shared palette fade. Contact is excluded to preserve the clear whole-cell silhouette above its invitation. Mask black is an alpha stop, not a display-palette addition.

### Primary link

A compact sand-filled link opens the project chapter. It uses the action radius and padding tokens, a simple inline arrow, and a darker hover. Keyboard focus is a copper outline (2px) offset by (6px).

### Detail button and text links

The project detail trigger is a transparent button with a sand underline, a directional SVG, and a minimum height (44px), placed (20px) below its preceding content. Its accessible name identifies the project, and it explicitly names the dialog it controls. Hover changes its text to copper. Secondary external links use copper text with a quiet warm underline; hover changes the text to paper. These actions retain the common visible focus treatment; secondary text links also preserve a minimum height (44px).

### Navigation

The bottom capsule is the sole chapter navigation. Five visually empty native anchors carry the accessible names Intro, Projects, Experience, Academics, and Contact. Same-page chapter anchors ease to their matching study holds while preserving the chapter URL hash. Category names appear as small charcoal tooltips above the hovered or keyboard-focused segment. The current category uses lighter ticks, and a single coral marker shows local progress. There is no top bar, logo, duplicate identity, footer template note, or numeric endpoint display.

Wheel, trackpad, and incremental keyboard inputs travel half their usual distance. Vertical touch input travels 87.5% of the swipe distance, a 75% increase over the previous 50% touch multiplier. An exponential response of (.30 seconds) eases the actual document scroll position; the scene, copy, active category, and marker all derive from that position. Reversing direction discards the previous direction's pending travel. Home, End, and anchor navigation retain exact destinations. Reduced motion applies these same input multipliers immediately. Native form controls and dialogs retain their own scrolling, and the controller pauses with the project panel. The skip link moves keyboard focus to the main content. The composition carries no filler scroll prompts or return-to-surface action.

### Project detail panel

A native dialog normally opens from the right with the panel token's dimensions, a thin left boundary, sticky top bar, and circular close button. Project 2 opens its desktop panel from the left with a right boundary, leaving the microscope graphic visible on the right. During electron imaging, the panel and its sticky bar use the electron-panel surface beneath dark text, and image placeholders use the electron-field-line border. Content scrolls within the panel with overscroll contained; background scrolling and scene motion pause while it is open. The close control is (44px) square and transitions border and text color over (.18s). Long titles wrap with a (1.12) line height, and body paragraphs stop at (65ch). Clicking the backdrop on either side or using the close control closes it and restores focus to the triggering button. Mobile uses a full-width panel, reserves its top safe area in the sticky bar, and adds bottom safe-area clearance to the reading content. Images are contained at their natural aspect ratio; absent or failed images show an explicit placeholder.

### Progress ruler and annotations

The fixed capsule uses the chapter-ruler token dimensions and sits at the lower right, inset (3.5vw) from the right and (9svh) from the bottom, and separates five equal tick groups with (18px) gaps. Each target is (44px) tall with the ruler-target radius. Each category retains its actual document interval, using the same (.18 viewport) section boundary as the scene; the marker maps local progress within that interval across its equal visual segment. The coral chapter-marker crosses the gaps when the active category changes. Tick groups use quiet gray at rest with opacity (.85), and lighter gray at full opacity when active or hovered. Keyboard focus uses a pale coral outline (1px), offset by (2px). Tooltips use the ruler-tooltip radius and transition opacity and vertical position over (.12s). Mobile preserves (16px) viewport gutters, reduces horizontal capsule padding to (12px), target gaps to (10px), and bottom offset to (max(16px, env(safe-area-inset-bottom))). Each mobile tick group is inset (4px) within its target, preserving (18px) visible gaps. At (360px) and below, horizontal padding becomes (10px) and target gaps become (8px), giving (16px) visible tick gaps while retaining at least (44px) target width at a (320px) viewport with a classic vertical scrollbar. The marker maps to the inset tick span. The capsule and marker retain their palette during electron imaging.

Annotation lines and dots are projected using the illustration stage’s bounds, fade in after the held section opens into the interior, and exchange sides within that plane. Current-ground label backgrounds and reading covers with solid cores and feathered edges keep annotations separate from portfolio copy. They remain hidden outside the cell and throughout the static fallback. On small screens the secondary annotation is removed to protect reading space; electron imaging also suppresses the secondary annotation.

### Procedural specimen

The first view is an opaque faceted cell built from a deformed icosahedron, with every interior structure hidden. Its triangles are physically clipped into two independently moving half-shells. Solid cut faces show stylized nuclear and mitochondrial sections; separation and rotation hold fully open across scroll tracks (.95–1.30), then the shells move farther apart and fade for camera entry at (1.64). Flat-shaded coarse surfaces, simplified folds, and sparse contours continue through the interior; the shell has no mottled texture or procedural surface noise. Scroll-derived keyframes spread the organelles, isolate a selection, split its internal structures, and reconstruct the whole between studies. Mitochondrial outer layers separate from their cristae; ER and Golgi ribbons separate during their selected studies. Every reconstruction returns organelle positions, scales, mitochondrial layers, and folded ribbons to the compact pose before the half-shells close. Later closed-to-open studies give the shell the first (20%) of the raw scroll interval and the interior the remaining (80%). During closure, the interior packs over the first (80%) and the shell closes over the final (20%). Each physical stage receives one quintic ease from raw progress; spread, isolation, splitting, and assembly scale follow that interior phase directly. Compact positions and scales remain (.86), and all contents are compact whenever the enclosing shell is visible. Actual rendered vertices fit inside the closed membrane in both desktop and mobile geometry checks. Quintic cushioning brings every authored reveal to zero velocity and acceleration at each hold. Camera distance interpolates reciprocally so perspective magnification grows evenly instead of surging near the end. The initial camera entry at (1.64) proceeds directly into the first project study at (2.24). Reconstructions have broad intervals at (2.48–2.92), (3.78–4.12), (5.54–5.92), and (6.64–7), with closed-cell holds before subsequent inspection. Project 3 opens over (4.20–4.60) and holds through (4.80); Academics opens over (6.02–6.56) and holds through (6.64). These scroll-derived poses and continuous screen framing keep the reveal controlled while the native document advances. One pose from the eased native-scroll track drives both the shell and the interior directly, so their assembly cannot fall behind one another. Root transforms, specimen scale, and material emphasis follow the native scroll pose directly, without a second delayed easing pass. Reverse scrolling retraces the sequence, with gentle ambient drift around the scroll pose. This is a scroll-driven camera, not a user-controlled orbit view.

Mobile lowers geometry detail and rendering density, keeps the specimen horizontally centered, and frames it above the copy in the permanent canvas. Ordinary phone camera travel approaches a soft lower distance bound (5.4), using a pose-camera multiplier (1.12) and smoothing width (.55) so velocity stays continuous through the framing threshold; microscope magnification blends toward the pose camera multiplied by (.7). Mobile geometry uses a world-unit multiplier (.6). A camera distance derived from the stage aspect ratio fits the two halves during the cross-section hold. Reduced motion, failed WebGL, and lost rendering context use authored inline SVG: a closed silhouette, separate split-section diagram, static interior, and microscope diagram with a tiny specimen inside the Petri dish. These states preserve document scrolling, the palette transition, and all HTML content without simulating the camera journey. All scene artwork is procedural geometry or authored inline SVG; this build has no generated raster imagery.

### Electron microscope view

Project 2 places reading left of the microscope. The instrument appears over tracks (2.90–3.26), and the closed cell docks in its Petri dish over (2.96–3.26), shrinking to 5.5% of its ordinary size. After docking, one scroll-derived amount over (3.26–3.36) reveals the project copy and mixes the page, reading covers, text, lines, panel, canvas filter, and viewfinder into electron imaging together. It stays fully active through (4) and returns to the warm palette over (4–4.14). There is no independent time-based palette animation. Camera magnification runs over (3.36–3.70), holds through (3.78), and retracts over (3.78–4.12); the specimen stays tiny, and projected camera aim keeps it in the field. Instrument presence withdraws over (3.82–4.14). Color-mix derives all seven palette colors from the same amount, while the canvas reaches grayscale(1) brightness(.42) contrast(1.1). Pausing or reversing scroll preserves exact synchronization. Reduced motion uses a simultaneous state switch for copy, palette, and viewfinder and retains the static diagrams. Four viewfinder corners, a specimen-view label, and an unnumbered scale mark remain illustrative rather than measurements. Project 3 is fully open by (4.60) while its reading remains visible. Academics holds its ribosome study at (6.56), and Contact shows the closed specimen by (7).

## Shared scroll timing and shorter opening

The intro takes 80svh on desktop and 85svh on phones, expanding naturally for
small screens or long content. The separate split/entry chapter takes 35svh,
with no vertical padding extending the empty section. Intro copy fades over
tracks .55–.95; Project 1 begins appearing at 1.4 and reaches full opacity at 2.
Phone intro copy starts at 42svh, and the first project starts at 32svh before
settling into its measured sticky reading position.

Eight editable fun-fact placeholders appear in pairs during the cross-section,
microscope docking, post-microscope reconstruction, and pre-Academics passage.
Their opacity yields to chapter reading on the same reversible timeline. Fine
leader lines follow actual cut-face features, visible organelles, or membrane
vertices, with endpoint dots. SVG fallback leaders use the diagram's own screen
transform. Phone cross-section labels sit above and below the split specimen.

The ruler and active category share reading-entrance boundaries: Intro 0,
Projects 1.4, Experience 5.04, Academics 6.02, Contact 6.64. Progress within each
segment uses its actual pixel scroll interval, with Contact ending at the page
bottom. Marker centers reach the first and last painted ticks of each segment.

Chapter copy samples named windows from the same scroll track as the camera,
shell, organelles, annotations, imaging palette, and navigation. Labels interpolate
between focus anchors, and material emphasis blends continuously between organs.
There is no extra root-transform, opacity, or palette easing that can trail scroll.

| Chapter | Main study / navigation stop |
| --- | --- |
| Intro | 0 |
| Project 1 | 2.24 |
| Project 2 | 3.70 |
| Project 3 | 4.60 |
| Experience | 5.28 |
| Academics | 6.56 |
| Contact | 7 |

Phone reading wrappers use sticky positions measured from their actual height,
up to 57svh, with 96px reserved below the copy for the capsule. Long reading can
move higher when necessary; all copy remains in normal document flow. The same
study-stop resolver handles chapter links, browser history, and direct URLs.

## Panel motion and microscope stability

The complete Contact reading block rises with the final chapter's native scroll
and settles 24–40px below the actual projected shell silhouette. Its endpoint
tracks rendered shell vertices across viewports and ambient rotation. The rise
shares the final cell-reconstruction interval (6.64–7), arriving as the shell
closes and retracing on reverse scroll. Reduced motion places the copy beneath the static diagram immediately.
Contact has no extra top padding or cover that can obscure the cell.

Project detail panels enter from their actual edge in 360ms with exponential
deceleration and a fading backdrop. Project 2 enters from the left on desktop;
other panels and the full-width phone panel enter from the right. Dismissal takes
220ms, including Escape and backdrop clicks, and can interrupt an entrance from
its current position. Focus containment and scroll/scene pause last through the
exit; focus then returns to the trigger. Reduced motion uses 120ms/100ms opacity
feedback. A stable scrollbar gutter prevents the scene from resizing on opening.

During microscope docking and magnification, the specimen's root transforms
follow the same scroll pose as the camera without an additional lagging ease.
Ambient rotation and scale breathing fade away as the instrument appears.
Camera height follows the projected perspective path, keeping the tiny specimen
in the field during both the approach and withdrawal. Ambient motion remains outside the microscope sequence; scroll-authored root
transforms and emphasis follow the shared timeline directly. Regression checks exercise actual
projected geometry at different frame rates and after direction reversals.

## Do's and Don'ts

### Do:
- **Do** preserve the warm charcoal world and its explicit electron-imaging palette exception across WebGL and fallback states.
- **Do** keep project text and controls fully opaque over solid reading cores with feathered ground edges beside or below the continuously moving specimen.
- **Do** keep the sole bottom capsule's five equal category targets synchronized with the actual document intervals and scene state.
- **Do** preserve clear gaps between tick groups, accessible category names, visible keyboard focus, and names on hover or focus.
- **Do** keep reading content and actions clear of the fixed capsule; reserve the microscope project’s mobile bottom padding and keep Academics copy on the left.
- **Do** use broad faceted surfaces and simplified anatomical details for the cell.
- **Do** use warm scene accents outside electron imaging and green within it; retain the capsule's coral marker and pale coral focus throughout.
- **Do** hold the physical split long enough to read its cut faces before entering, and show the tiny cell held inside its Petri dish before changing the palette and approaching it with the camera.
- **Do** keep scroll-derived content synchronized with the real document position, preserve visible keyboard focus, and bypass scroll easing for reduced motion.
- **Do** use explicit editable placeholders for information the owner has not supplied.

### Don't:
- **Don't** expose organelles or annotation lines in the initial closed exterior.
- **Don't** reintroduce a top bar, duplicate identity, numeric navigation endpoints, or permanently visible capsule labels.
- **Don't** replace the pinned cell-entry and reconstruction journey with an unrelated visual concept.
- **Don't** add fabricated personal achievements, project images, or contact details.
- **Don't** flatten the open reading layout into a grid of elevated cards.
- **Don't** require 3D interaction to access portfolio content.
- **Don't** add realistic mottled textures or allow the specimen and labels to underlay portfolio text.
