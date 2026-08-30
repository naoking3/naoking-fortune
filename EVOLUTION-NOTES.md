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

## Signature polish research decisions

Adopted as design/engineering references, then re-authored for this site:

- A small dependency-free WebGL fragment shader for the Opening, Hero, section passage and Oracle environment only. It supplies procedural current, caustics, depth light, pointer wake and pressure pulses while the photographic site remains normal HTML/CSS.
- Native CSS transforms, opacity, clip-path and keyframes for the routine motion system and the directional dive/surface aperture.
- `IntersectionObserver` for entrance activation rather than continuous scroll work.
- `requestAnimationFrame` throttling for scroll/pointer updates.
- Page Visibility handling for ambient events and date rollover.
- Native `<dialog>`, Canvas, Blob download and local storage for gallery, frame studio and passport.
- Responsive images, WebP assets and explicit dimensions.
- Accessibility patterns from WCAG/ARIA practice: visible focus, focus return, inert backgrounds and reduced motion.

Visual research included Codrops' [Liquid Distortion Effects](https://tympanus.net/codrops/2017/10/10/liquid-distortion-effects/), [Creative WebGL Image Transitions](https://tympanus.net/codrops/2019/11/05/creative-webgl-image-transitions/), [Water-like Distortion](https://tympanus.net/codrops/2019/10/08/creating-a-water-like-distortion-effect-with-three-js/), [The Spark case study](https://tympanus.net/codrops/2026/01/09/the-spark-engineering-an-immersive-story-first-web-experience/) and [Podium case study](https://tympanus.net/codrops/2026/06/23/podium-building-a-website-where-running-becomes-storytelling/). Engineering references included the official [Three.js post-processing guide](https://threejs.org/manual/en/how-to-use-post-processing.html), [Theatre.js sequences](https://www.theatrejs.com/docs/latest/manual/sequences), MDN [Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), [View Transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API), [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) and [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion). The Convex Seascape Survey and The Sea We Breathe were used only as spatial underwater mood references.

Considered but deliberately not adopted:

- Three.js, PixiJS, Phaser and OGL: the selected Signature Scene needed one shader pass, not a framework-sized 3D runtime.
- Scroll hijacking and smooth-scroll frameworks: would weaken keyboard/native scroll behavior.
- React effect libraries, Rive and Lottie: no authored asset need and too much dependency weight.
- Glassmorphism or neon effects as a universal component treatment: conflicts with the natural underwater art direction.
- Unofficial VRChat APIs or browser OSC integration: unsuitable for a reliable public GitHub Pages feature.

No external component or effect source code was copied.

## Implemented experience

- Reworked first-visit entry as a 3.2-second silent short film: surface loss, increasing pressure, kingdom signal, passing sovereign silhouette, title lock-up and a circular underwater handoff into Hero. Skip and short return visits remain.
- Added the Hero's always-visible sovereign signature: a crown, pressure/current rings and light rays that frame Naoking without decorative orbiting text.
- Added the shared WebGL waterfield so Opening, Hero, transitions and Oracle feel like one continuous scene instead of separate effects.
- Multi-layer blue/blue-green underwater space; no black-only surface and no sci-fi dot grid.
- Scroll-reactive depth and section-specific depth zones.
- Replaced the rectangular blue wipe with a short 0.82-second directional dive/surface aperture, moving pressure line and source→destination depth readout. It remains because the circular spatial handoff is clearer and more valuable than an instant cut while staying below one second.
- Hero current/light response with restrained pointer parallax and an HTML/CSS fallback when WebGL is unavailable.
- Low-frequency ambient events that pause when hidden and disappear under reduced motion.
- Twenty-six-scene full-screen gallery linked to both the snapshot card and page background.
- Pause/resume control for automatic photo rotation; latest-selection-wins image loading.
- Daily royal decree, tide, relic and seven-day local passport.
- Browser-local VRChat Royal Frame Studio with three frame styles and PNG/WebP download fallback.
- Oracle environment states (`normal`, `hot`, `superhot`, `jackpot`, `fake-loss`, `revival`) synchronize the photograph, waterfield, currents, rays, bubbles, pressure ring, depth UI and surrounding page with the existing result timeline. Its one-draw data model and every probability stage remain untouched.
- Mobile-safe five-tile roulette reel uses fixed 230px/190px tiles and explicit image visibility so Naoking cannot disappear halfway through a spin.
- LIFE 1 hunting game now has an OXYGEN survival meter. It starts at 78%, drains faster every five seconds, is restored by food, and ignores the crown shield at zero. Every gate places a high-value O2 feed near an edge of its reachable safe lane, making risk mandatory rather than optional.
- Difficulty now steps through five phases: narrower gaps, 220→380+ speed, .95→.58-second warnings, stronger currents and double/current/sweep pattern unlocks. The original 71 taunts remain and eight oxygen-specific taunts bring the total to 79.

## Performance and accessibility guardrails

- Transform/opacity are the default animated properties.
- The heaviest transition blur runs only during the short page passage; ambient caustic blur stays slow and low-opacity.
- Ambient animation pauses when the document is hidden.
- Pointer and scroll work are coalesced with `requestAnimationFrame`.
- Reduced-motion mode removes optional travel and ambient motion.
- The water shader caps rendering at 60fps / DPR 1.65 on desktop and 30fps / DPR 1.15 on compact/coarse-pointer devices. It renders one static frame for reduced motion and stops entirely while the page is hidden.
- Gallery and opening controls account for device safe areas and retain 44px touch targets.
- Gallery thumbnails and frame styles expose pressed state.
- Page transitions move focus to the destination heading after `inert` is removed.
- User photos for the frame studio stay local to the browser and are rejected above 25MB or 60 megapixels.
- The roulette reel is at most 1,150 CSS pixels tall, remaining below 4,096 device pixels through DPR 3.

## Verification record

- JavaScript syntax checks: `site.js`, `photo-background.js`, `kingdom-experience.js`, `signature-water.js`, `roulette-controller.js`, `deep-sea-game.js` passed.
- `git diff --check`: passed.
- Referenced local assets: no missing files.
- Oracle simulation: 100,000 draws; one click listener; no normal-result immediate repeats; no immediate message repeats; no data-integrity mismatches; no shuffle-bag duplicates; no timer leak after page change.
- Oracle probability sample (100,000 draws): 70.681% normal, 20.018% special win and 9.301% special loss. Immediate normal repeats, message repeats, integrity mismatches, duplicate listeners and leaked timers were all zero.
- Manual PC and 390px roulette checks retained five visible images while spinning and one visible result image after reveal; no console warnings/errors.
- No-food oxygen model reaches zero at about 12.08 seconds. A 20,000-run perfect risk-feed model reached 30 seconds every time with a minimum post-feed oxygen of 38.7%, confirming hard but reachable tuning.
- Manual game browser check: PC and 390px HUDs, obstacle death at 5.4 seconds in an idle run, enabled immediate retry, oxygen reset/drain and no console warnings/errors.
- Manual browser checks: desktop and 390px Opening/Hero, WebGL/no-WebGL guard, circular section passage, Oracle spin, game HUD/game over/retry and responsive layouts.

## Maintenance notes

- The 26 photo paths have one source of truth in `photo-background.js` and are exposed read-only to the gallery.
- The oracle resolves one frozen result object before animation. Title, image, message and effect are rendered from that same object.
- Oracle page changes invalidate pending timers with a draw token.
- Game patterns are scheduled only after the previous final gate has fully cleared the player plus a safety margin.
- Cache-query versions in `index.html` must be bumped when public CSS or JavaScript changes.
- `deep-sea-redesign` remains the untouched rollback ref and GitHub Pages branch settings are not part of this release.
