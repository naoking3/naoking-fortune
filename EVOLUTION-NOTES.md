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
- Added the `ROYAL ABYSS LENS`: a custom WebGL liquid lens that refracts only the current kingdom photograph under pointer inertia and impact ripples. The real Naoking image stays as a sharp, stable HTML foreground above the canvas while light, water and rings move around it. The existing crown, pressure/current rings and light rays remain as the HTML/CSS fallback.
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
- Rebuilt the visible Oracle as `ROYAL ORACLE // FIVE WITNESSES`: a submerged pressure-hull cabinet rather than a conventional rounded card. One frozen verdict travels through descent → cruise → signal → judgment → braking → staggered witness stops → verdict → reveal/fake/revival → rest. Thirty-two compatible presentation routes span normal, false-signal, intrusion, environment, reel-event, rule-change, typography, blackout, revival, premium and secret families. They synchronize the photograph, waterfield, currents, rays, bubbles, pressure ring, depth UI, navigation and page edges without changing the frozen result or its probability stage.
- Added session route history, daily first/fifth/echo/long-silence reactions and recent-route weighting. These alter presentation only; they never alter special-win or special-loss probability. Expensive Roulette-only environment classes are removed after settlement, page change or cancellation.
- Mobile-safe five-tile roulette reel uses fixed 230px/190px tiles and explicit image visibility so Naoking cannot disappear halfway through a spin.
- LIFE 1 hunting game keeps its 78% OXYGEN start and retry contract while using five clearer pressure phases at 4.5/9/13.5/18 seconds. No-food oxygen still expires at about 8.092 seconds. Gate speed rises 235→420px/s, safe gaps tighten 196→146px, warning time steps .92→.52 seconds, and current pressure rises 98→166px/s without producing an impossible late lane.
- Difficulty was tuned against human-like reaction/error models rather than frame-perfect automation. A 12,000-run-per-model simulation produced a deliberate skill curve from effectively no first-play clears through practiced/expert improvement, while the worst late reachability margin remained positive at +49.9px/s.

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
- Oracle simulation: 100,000 verdict draws plus 100,000 presentation draws; one click listener; no normal-result immediate repeats; no immediate message repeats; no data-integrity mismatches; no shuffle-bag duplicates; no mutable results/presentations and no timer leak after page change.
- All 32 presentation routes were covered. Immediate route repeats, incompatible routes and result/presentation contradictions were zero; the largest route share stayed below 10% and the minimum estimated visible rotation count was ten.
- Manual PC and 390px roulette checks retained five visible images while spinning and one visible result image after reveal; no console warnings/errors.
- Human-like Hunt simulation ran 12,000 trials for each of five ability models. First-play, learning, practiced, expert and near-optimal clear rates were 0%, 0.05%, 1.18%, 7.13% and 24.82%; their median survival times were 8.08, 8.18, 12.12, 17.10 and 21.40 seconds. The no-food oxygen model reached zero at about 8.092 seconds.
- Manual game browser checks cover PC and compact HUDs, opening death, immediate retry, oxygen reset/drain, keyboard/touch input and no new console errors.
- Manual browser checks: desktop and 390px Opening/Hero, WebGL/no-WebGL guard, circular section passage, Oracle spin, game HUD/game over/retry and responsive layouts.

## Signature Impact Pass verification

- `ROYAL ABYSS LENS` reached its WebGL-ready state, responded to pointer inertia and impact input, followed Hero photo changes and visibly transformed into the initial dive. A context-loss/no-WebGL path keeps the sovereign CSS composition usable.
- The lens caps DPR and frame rate separately for desktop/mobile, renders a static reduced-motion frame, pauses when hidden or out of view, and releases textures, buffers and listeners on final page exit. Reduced-motion also suppresses optional impact motion; pointer/touch RAFs recenter safely; texture failure and permanent context-loss paths retain the CSS fallback.
- Oracle diagnostics cover 100,000 verdict draws and 100,000 independent presentation selections. All 20 verdict definitions and all 32 routes were exercised with zero title/image/message mismatch, immediate normal repeat, immediate message repeat, immediate route repeat, incompatible route, contradiction, leaked timer or settled environment class.
- PC and 390×844 Oracle checks retained five loaded and visible Naoking witnesses throughout idle, spin and final phases, including fake/revival. The final readable result remained stable; there was no horizontal overflow or console warning/error.
- Hunt tuning was validated with 60,000 total human-like runs. The deliberately difficult curve remains learnable, and late-pattern reachability remains positive rather than frame-perfect.
- Three review passes cover: slot/game presentation and staggered reel rhythm; web-art/motion composition, stable Hero and environment release; frontend/game/QA syntax, asset integrity, responsive bounds, logic isolation, fallback paths, fairness and retry tempo.

## Sound & Chaos / Royal Oracle Expansion

- Added one gesture-gated, dependency-free Web Audio system in `kingdom-audio.js`. A single reusable `AudioContext` owns nine procedural layers (ambient, interface, transition, reel, signal, tension, event, result and game), one master gain, bounded voices and explicit page/visibility cleanup. The compact royal sound control stores ON/OFF and volume locally; compact screens keep the toggle and omit the slider.
- Opening, Hero, 0.82-second dive/surface passage, navigation, Oracle and Hunt all share the same sound vocabulary. Opening audio can only begin after a user gesture; a remembered ON preference resumes on the next gesture rather than attempting blocked autoplay.
- No external audio files or copied game sounds are used. Every tone, current, bubble, pressure pulse, reel motor, stop, blackout, revival, result and warning is synthesized at runtime, so there is no third-party audio license entry for this pass.
- Audited the previous 32 Oracle routes. They covered eleven named families but mostly resolved through two timing skeletons, shared signal/judgment/stop beats and several repeated stop orders; some motion names had no distinct CSS behavior. The audit therefore treated structural sequence, page location, user interaction, reel mechanics and silence as the missing variation axes rather than adding color/copy variants.
- Considered 72 original route concepts across normal, unrelated interruption, broadcast, tribunal, rule change, character intrusion, environment journey, reel breakdown, false object, power failure, revival, premium and secret families. Seventeen high-value routes were implemented or structurally rebuilt, taking the live pool from 32 to 47 routes and normal-route variety from 10 to 18.
- New structural sequences include the King's lunch break, abyss news, emergency council, sixth witness, reel labor strike, unrelated giant-fish traffic, royal commercial, the interactive “do not press” seal, reel-jam repair, surface breach, witness escape, cardboard crown, cracked kingdom tank, closing verdict book, one golden bubble, full coronation and the 4810 vault.
- The frozen-result contract remains authoritative. Each spin emits one draw event, five reel-stop events and exactly one final result event. Early presentation phases never expose result kind; route effects cannot redraw or overwrite title, image or message. Page changes, visibility changes and rapid retries invalidate route/scene timers and stop active audio.
- Oracle sound routes consume semantic phase/beat/stop/result events. Reel speed controls motor pitch, expectation tiers add bounded pressure/pulse layers, fake endings deliberately remove sound, and revival/jackpot restore the whole mix without selecting a second result.
- Hunt now emits semantic audio events for start, pickup, rare pickup, crown, oxygen/pattern/current warnings, near miss, shield, damage, death, clear, game over, retry and exit. Decision windows shorten earlier (4.2/8.4/12.6/16.8 seconds), with speed reaching 432px/s and current 178px/s, while late reachability remains positive.
- Research informed principles rather than copied assets: MDN and Chrome/WebKit autoplay guidance for gesture unlock; Web Audio specifications for scheduling/cleanup; GSAP/interactive-web references for sequencing; official SANKYO, Konami, Sammy and Aristocrat materials for anticipation, staged stops and cabinet-scale reaction. The implementation is original HTML/CSS/JavaScript for NAOKING KINGDOM.
- Verification adds a deterministic audio harness plus expanded Oracle diagnostics for 47 routes, the single-draw/five-stop/single-result event contract, early-result secrecy, route/result compatibility, rapid click, page change, visibility cleanup, probability, history and message bags. The Hunt simulation runs 12,000 trials for each of five human-like models.

## Maintenance notes

- The 26 photo paths have one source of truth in `photo-background.js` and are exposed read-only to the gallery.
- The oracle resolves one frozen result object before animation. Title, image, message and effect are rendered from that same object.
- Oracle page changes invalidate pending timers with a draw token.
- Game patterns are scheduled only after the previous final gate has fully cleared the player plus a safety margin.
- Cache-query versions in `index.html` must be bumped when public CSS or JavaScript changes.
- `deep-sea-redesign` remains the untouched rollback ref and GitHub Pages branch settings are not part of this release.
