# Cell portfolio template

A local-only biology portfolio built with Vite and Three.js. The opening is a closed, low-poly cell; scrolling enters it, separates internal structures, reconstructs the cell, and repeats with alternating layouts. A permanent full-viewport projection plane lets the cell travel continuously between reading columns; reading surfaces keep solid cores beneath the text and feather their edges into the scene. Phones frame the specimen above the copy. The sole navigation is a lower-right capsule, matching the supplied Anime.js reference placement, with five equal tick groups and clear gaps. On phones it keeps full-width usable targets at the bottom. Its groups jump to Intro, Projects, Experience, Academics, and Contact; names appear on hover or keyboard focus. The coral marker advances through the active group's actual scroll interval. The top bar, numeric endpoints, and footer template note are removed. This isolated folder preserves the parent workspace's existing deletions and unrelated content.

## Run

This is the repository's default website. From the repository root, `npm install`
and `npm run build` build this portfolio into the root `dist/` folder for deployment.
The instructions below also support working in this folder independently.

From this directory, run `npm install` on a fresh checkout, then `npm run dev`. The development address is printed in the terminal (normally http://127.0.0.1:5174). Use `npm run build` to produce `dist/`, `npm run preview` to inspect the build, and `npm test` for content safety, scroll selection, continuous framing, and actual-geometry containment checks.

## Edit the portfolio

All personal content is in `src/content.js`. Replace bracketed placeholders. The three featured projects each have a title, summary, role, methods, result, description, image, alt text, and links. Project links use `{ label: 'View project', url: 'https://...' }` objects. Leave optional values blank or lists empty to omit them. Add or remove experience, statistics, coursework, and honors entries as needed. The authored journey has three featured project scenes; adding or removing one also requires adjusting its motion stops in `src/choreography.js` so subsequent chapters stay synchronized.

Put project images and an optional résumé in `public/`, then use paths such as `./project-image.jpg` or `./resume.pdf`. Supply meaningful image alt text. Missing or failed images display an explicit image placeholder. Email, professional links, and résumé are omitted until supplied; the email slot remains visible as `[Email address]`.

The coarse procedural geometry, flat-shaded materials, and membrane cutaway are in `src/scene.js`. Cushioned reveals ease gently into and out of holds, with broader reconstruction intervals and perspective-scaled camera travel. Each physical stage eases directly from scroll progress: the shell clears before the interior unfolds, and every organelle packs before the shell closes. Shell and interior assembly remain synchronized without stacking a second packing animation. Reversible scroll poses and continuous screen framing are in `src/choreography.js`: camera distance, membrane opening, organelle spread, inspection focus, framing, and separation of internal structures. The canvas keeps fixed bounds across all chapters; screen position, camera, and specimen scale move continuously rather than switching rendering areas. `src/scroll.js` eases the real document position, applying half-distance wheel, trackpad, and incremental keyboard input, with touch scrolling at 87.5% of swipe distance (75% faster than before), with a .30-second response. Same-page jumps reach their exact destinations; scrollbar dragging remains direct, and project panels keep native scrolling. Styles are in `src/style.css`. No external model, image service, backend, or contact form is required. Fonts are reused from the existing workspace; review their licenses before distributing them beyond this project.

## Accessibility and fallbacks

Real document scrolling, chapter anchors, a skip link that focuses main content, visible focus, project-specific accessible button names, native dialog focus containment, Escape dismissal, and focus return support keyboard use. Project actions, text links, and panel close controls provide at least 44px target height. Detail panels contain overscroll, wrap long titles, limit reading width, and reserve phone safe areas. Empty optional groups collapse cleanly. Reduced-motion preferences bypass 3D entirely, use the static cell diagram, and apply the desktop and touch input multipliers immediately without easing. WebGL failure uses the same diagram and HTML content. Mobile uses simpler geometry and content below the illustration. No-JavaScript mode exposes a static placeholder portfolio.

## Biological metaphor

The nucleus anchors the introduction; mitochondria anchor selected projects; ER/Golgi anchor experience; ribosomes anchor academics. These are visual metaphors, not literal anatomical or biographical claims. Contact brings the specimen back together.

The opening separates two actual clipped half-shell meshes. Their cut faces expose a stylized nucleus and organelles, hold in a full-width cross-section, then move aside for camera entry. Projects 1 and 3 place their text on the right. Project 2 places text on the left as the closed cell shrinks to a tiny specimen and settles inside a glass Petri dish beneath the electron column. After a visible placement hold, the camera approaches the tiny specimen and the page fades smoothly to pale silver-green with a dark monochrome microscope view, then restores warmth for Project 3. Its desktop panel opens on the left so the microscope remains visible. Experience uses left-side text and folded networks; Academics uses left-side text and right-side ribosome clusters; Contact centers its invitation beneath the fully visible closed cell with room between the silhouette and copy. Every closure first packs all organelles and their split structures inside the membrane; the shell and interior share the same scroll pose, and geometry containment is checked for desktop and mobile models. This is an illustrative visual metaphor, with no instrument readings or invented academic claims. Static diagrams retain the split, Petri dish, and microscope states.

## Timing and navigation

The repository uses one scroll timeline for reading visibility, specimen poses,
material emphasis, annotation leaders, and the electron-imaging palette. Project
2 copy and its palette fade in together after docking; stopping or reversing
scroll keeps them aligned. Chapter links and direct URLs land on their matching
study holds. The intro now takes 80svh on desktop / 85svh on phones, and the
split/entry section takes 35svh. Phone reading positions account for actual text
height and the bottom navigation.

`funFacts` in `src/content.js` contains eight editable placeholders. They appear
in pairs during animation-only passages, with leaders attached to cell features,
and fade as chapter reading returns. The same callouts work with static SVG and
reduced motion. The ruler's active chapter and marker share the reading reveal
boundaries, including Contact beginning during cell closure; its final position
aligns with the last tick at the bottom of the page.

Contact text rises during the final cell reconstruction, arriving directly beneath
the cell when it closes. Its final gap remains 24–40px across viewports.
