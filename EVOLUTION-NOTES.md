# NAOKING KINGDOM — Creative Evolution Notes

## Release boundary

- Development branch: `main`
- Rollback branch: `deep-sea-redesign` (kept unchanged)
- GitHub Pages branch configuration: unchanged
- Architecture: static HTML/CSS/JavaScript for GitHub Pages; no runtime framework or build step

## Creative direction

The experience is an elegant underwater court with a playful Naoking system layer. It avoids an effects-showcase composition: every motion belongs to one of the following interaction meanings.

| Language | Meaning | Typical treatment |
| --- | --- | --- |
| Scroll = Dive | The visitor descends through the kingdom | slow depth tint, restrained parallax, current-depth response |
| Abyss Passage | Moving between sections means travelling to another depth | short water wipe, refraction line, focused destination heading |
| Memory Current | A photograph is a linked royal memory | full-screen reveal, selected scene becomes the site background |
| Royal Oracle | One immutable verdict passes through a ceremonial machine | descent → judgment → verdict → reveal |
| Hunt | Danger is fair and readable before impact | telegraph → safe gap → action → impact/result |
| Royal Record | A visit leaves a light local trace | deterministic daily decree and seven-day passport stamp |

Routine motion uses transform and opacity. Drift is slow and low-amplitude; reveal is editorial and directional; impact is short and decisive. `prefers-reduced-motion` removes nonessential travel, particles and repeated motion.

## Research decisions

Adopted as design/engineering references, then re-authored for this site:

- Native CSS transforms, opacity and keyframes for the routine motion system.
- `IntersectionObserver` for entrance activation rather than continuous scroll work.
- `requestAnimationFrame` throttling for scroll/pointer updates.
- Page Visibility handling for ambient events and date rollover.
- Native `<dialog>`, Canvas, Blob download and local storage for gallery, frame studio and passport.
- Responsive images, WebP assets and explicit dimensions.
- Accessibility patterns from WCAG/ARIA practice: visible focus, focus return, inert backgrounds and reduced motion.

References included MDN documentation for [Web Animations](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API), [Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), [View Transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API), [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) and [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), plus official [VRChat creator documentation](https://creators.vrchat.com/).

Considered but deliberately not adopted:

- Three.js, PixiJS, Phaser, OGL and full-screen shaders: unnecessary GPU/memory cost for this static photographic experience.
- Scroll hijacking and smooth-scroll frameworks: would weaken keyboard/native scroll behavior.
- React effect libraries, Rive and Lottie: no authored asset need and too much dependency weight.
- Glassmorphism or neon effects as a universal component treatment: conflicts with the natural underwater art direction.
- Unofficial VRChat APIs or browser OSC integration: unsuitable for a reliable public GitHub Pages feature.

No external component or effect source code was copied.

## Implemented experience

- Reworked entry dive with light shafts, water depth, natural bubbles, a numeric depth meter and a skip control.
- Multi-layer blue/blue-green underwater space; no black-only surface and no sci-fi dot grid.
- Scroll-reactive depth and section-specific depth zones.
- Short water-passage page transitions with latest-route handling and destination focus.
- Hero current/light response with restrained pointer parallax.
- Low-frequency ambient events that pause when hidden and disappear under reduced motion.
- Twenty-six-scene full-screen gallery linked to both the snapshot card and page background.
- Pause/resume control for automatic photo rotation; latest-selection-wins image loading.
- Daily royal decree, tide, relic and seven-day local passport.
- Browser-local VRChat Royal Frame Studio with three frame styles and PNG/WebP download fallback.
- Oracle timing polish without altering its one-draw data model or special-result probability stages.
- Mobile-safe 14-tile roulette reel to avoid oversized composited layers on mobile GPUs.
- LIFE 1 hunting game with six telegraphed patterns, time-based difficulty, a short crown shield, immediate retry and 71 conditional Naoking taunts.

## Performance and accessibility guardrails

- Transform/opacity are the default animated properties.
- The heaviest transition blur runs only during the short page passage; ambient caustic blur stays slow and low-opacity.
- Ambient animation pauses when the document is hidden.
- Pointer and scroll work are coalesced with `requestAnimationFrame`.
- Reduced-motion mode removes optional travel and ambient motion.
- Gallery and opening controls account for device safe areas and retain 44px touch targets.
- Gallery thumbnails and frame styles expose pressed state.
- Page transitions move focus to the destination heading after `inert` is removed.
- User photos for the frame studio stay local to the browser and are rejected above 25MB or 60 megapixels.
- The roulette reel is at most 1,150 CSS pixels tall, remaining below 4,096 device pixels through DPR 3.

## Verification record

- JavaScript syntax checks: `site.js`, `photo-background.js`, `kingdom-experience.js`, `roulette-controller.js`, `deep-sea-game.js` passed.
- `git diff --check`: passed.
- Referenced local assets: no missing files.
- Oracle simulation: 100,000 draws; one click listener; no normal-result immediate repeats; no immediate message repeats; no data-integrity mismatches; no shuffle-bag duplicates; no timer leak after page change.
- Oracle probability sample: representative 100,000-draw runs stayed near 70.7% normal, 20.0% special win and 9.3% special loss. Special stages remain independent of normal-history weighting.
- Manual roulette browser check: four consecutive completed spins retained one visible Naoking result image each; the compact spinning reel uses five images at every viewport.
- Game simulation: 10,000 runs; all six patterns observed; immediate identical pattern repeats 0.
- Manual game browser check: PC and 390px layouts; death around 5.2–5.3 seconds when idle; immediate retry; no console errors.
- Manual browser checks: entry/focus, section navigation/depth, gallery selection/background linkage, photo pause, daily stamp, oracle spin, game over/retry and offering/frame UI.

## Maintenance notes

- The 26 photo paths have one source of truth in `photo-background.js` and are exposed read-only to the gallery.
- The oracle resolves one frozen result object before animation. Title, image, message and effect are rendered from that same object.
- Oracle page changes invalidate pending timers with a draw token.
- Game patterns are scheduled only after the previous final gate has fully cleared the player plus a safety margin.
- Cache-query versions in `index.html` must be bumped when public CSS or JavaScript changes.
