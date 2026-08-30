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
- Added the `ROYAL ABYSS LENS`: a custom WebGL liquid lens that combines the current kingdom photograph with Naoking, refracts both under pointer inertia, accepts impact ripples, and visually sinks into Scroll = Dive. The existing crown, pressure/current rings and light rays remain as the HTML/CSS fallback.
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
- Rebuilt the visible Oracle as the `ABYSSAL ROYAL SLOT / 王国の神託装置`: a submerged royal cabinet with tier display, edge lighting, large reel/result surfaces and distinct machine phases. Environment states (`normal`, `hot`, `superhot`, `jackpot`, `fake-loss`, `revival`) synchronize the photograph, waterfield, currents, rays, bubbles, pressure ring, depth UI, navigation and surrounding page with the existing result timeline. Its one-draw data model and every probability stage remain untouched.
- Mobile-safe five-tile roulette reel uses fixed 230px/190px tiles and explicit image visibility so Naoking cannot disappear halfway through a spin.
- LIFE 1 hunting game keeps its 78% OXYGEN start but now drains at 8.4→11.2→14.8→18.5→21.5% per second over five phases. With no food it reaches zero at about 8.215 seconds. Every gate places a precisely collectible, high-value O2 feed at the reachable edge of its safe lane, making risk mandatory rather than optional.
- Difficulty begins its first pattern at 1.95 seconds and forces a real movement decision at about 4.7–5.0 seconds while retaining the previously validated gaps, speeds and .95→.58-second warnings. Risk feeds restore 42→92% O2 and produce a short `RISK CLEARED` impact. The existing taunts remain; oxygen, greed, opening and personal-best-near categories bring the total to 99 lines across 17 categories.

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
- No-food oxygen model reaches zero at about 8.215 seconds. A 50,000-run strict risk-feed model reached 30 seconds every time with a minimum post-feed oxygen of 8.38%, confirming severe but reachable tuning.
- Manual game browser check: PC and 390px HUDs, opening-pattern death at 4.8 seconds in an idle run, enabled immediate retry, oxygen reset/drain and no console warnings/errors.
- Manual browser checks: desktop and 390px Opening/Hero, WebGL/no-WebGL guard, circular section passage, Oracle spin, game HUD/game over/retry and responsive layouts.

## Signature Impact Pass verification

- `ROYAL ABYSS LENS` reached its WebGL-ready state, responded to pointer inertia and impact input, followed Hero photo changes and visibly transformed into the initial dive. A context-loss/no-WebGL path keeps the sovereign CSS composition usable.
- The lens caps DPR and frame rate separately for desktop/mobile, renders a static reduced-motion frame, pauses when hidden or out of view, and releases textures, buffers and listeners on final page exit.
- Oracle simulation: 100,000 draws with one click listener; zero immediate normal repeats, immediate message repeats, result-integrity mismatches, shuffle-bag duplicates or leaked timers. All eleven result images exist.
- PC and 390px Oracle checks retained five visible Naoking images during spin and a visible result image after reveal. Normal, Very Hot and Jackpot states were observed without console errors.
- No-food game model reaches zero O2 at about 8.215 seconds. A strict 50,000-run model that collected only the mandatory risk feed reached 30 seconds every time; the minimum post-feed oxygen was 8.38%.
- Manual game browser check confirmed an opening-pattern death at 4.8 seconds, category-specific taunt, immediate retry, disabled in-run start button, and oxygen restarting from 78%.
- Two review passes completed: Art/Motion checked composition, state contrast and environment response; Frontend/Game/QA checked syntax, asset integrity, responsive bounds, logic isolation, fallback paths, fairness and retry tempo.

## Maintenance notes

- The 26 photo paths have one source of truth in `photo-background.js` and are exposed read-only to the gallery.
- The oracle resolves one frozen result object before animation. Title, image, message and effect are rendered from that same object.
- Oracle page changes invalidate pending timers with a draw token.
- Game patterns are scheduled only after the previous final gate has fully cleared the player plus a safety margin.
- Cache-query versions in `index.html` must be bumped when public CSS or JavaScript changes.
- `deep-sea-redesign` remains the untouched rollback ref and GitHub Pages branch settings are not part of this release.
