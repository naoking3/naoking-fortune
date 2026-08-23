# Abyssal Court / 深淵宮廷

`deep-sea-redesign` branch art direction and maintenance notes.

## Direction

- Almost-black abyssal navy carries the quiet, premium part of the brand.
- Cold cyan is reserved for navigation and system information.
- Sovereign gold is reserved for royal authority, primary actions and rare fortune states.
- Large Mincho typography provides the courtly tone; compact mono labels make the kingdom feel like an expedition system.
- Motion follows four verbs: **descend**, **float**, **flow**, and **surface**. Ambient movement stays slow; the fortune machine and game may move quickly.
- Naoking appears as the ruler, guide, oracle and game character—not as decoration on every card.

## Runtime ownership

| Responsibility | File |
| --- | --- |
| Navigation, opening, page state, small easter egg | `site.js` |
| Background and snapshot crossfade | `photo-background.js` |
| Fortune data, draw, effects and result rendering | `roulette-controller.js` |
| Fortune-only visual effects | `roulette.css` |
| Migration game logic and controls | `deep-sea-game.js` / `deep-sea-game.css` |
| Supabase offering form | `submission.js` |
| Shared design system, page and game-shell layouts | `deep-sea.css` |

Only `roulette-controller.js` may bind `#spin`. A fortune click resolves one frozen final result before animation begins.

## Assets

Optimized runtime assets live in `assets/`. Original PNG/JPEG source files remain in the repository. Run `tools/optimize-assets.py` from the repository root after replacing source artwork.

## Page routes

The static single-page site uses hash routes: `#home`, `#videos`, `#fortune`, `#game`, `#submit`, and `#join`. `site.js` owns page visibility and dispatches `naoking:pagechange` for feature modules.
