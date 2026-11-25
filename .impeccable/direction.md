# Smooth motion and profile update

## Motion thesis
Focal moment: a cohesive cluster of biological cells responds to the pointer and a tap like a gently disturbed fluid, returning without jumps. Continuity: words overlap while changing; the menu curtain animates both directions; interpolable grid tracks preserve spatial relationships; native cross-document transitions bridge page changes. Feedback: short eased control responses, visible focus, and a mobile Home link. Budget: fixed 120 Hz simulation with at most eight catch-up steps, interpolated rendering, 1.5 device-pixel-ratio cap, fewer mesh vertices, noise capped near 12 fps. Hidden documents and open menus pause scene rendering.

## Content
Matthew Suwiryo; senior at DVHS, class of 2027; biology/pre-med; aspiring doctor. Contact is matthewsuwiryo@gmail.com and github.com/kalahariancamel. User-authored custom taglines retained. About now uses only supplied facts and an authorized paragraph. Writing and Experiments are intentionally empty states; legacy routes retain working aliases.

## Verification
Production build passes. Four motion tests cover equal simulation time at 60/144 Hz, bounded catch-up/reset, frame-independent pointer damping, and meaningful non-spatial reduced-motion tagline changes with repeated-click throttling. Static link/asset checks pass. Browser checks cover animated menu navigation to About, repeated Escape dismissal and focus return, real 1280×720 and 390×844 iframe viewports, contact links, and phone biography. Screenshots are captured from the fully settled state; they verify composition, not animation frame-rate or hardware performance.

## Limits
No claim of measured device frame-rate or screen-reader/hardware acceptance. Reduced-motion behavior is covered by source inspection and unit tests; OS-level emulation was not available through the browser controller. View Transitions have ordinary navigation as a fallback. The original pastel contrast remains a fidelity tradeoff.
