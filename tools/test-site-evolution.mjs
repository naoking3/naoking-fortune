import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const html = read('index.html');
const world = read('kingdom-world.js');
const worldCss = read('kingdom-world.css');
const experience = read('kingdom-experience.js');
const site = read('site.js');
const catalogSource = read('photo-catalog.js');
const dataSource = read('kingdom-world-data.js');

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepEqual(duplicateIds, [], 'HTML must not contain duplicate ids');

const pages = [...html.matchAll(/<section class="page(?: is-active)?" id="([^"]+)"[^>]*data-district="([^"]+)"[^>]*data-transition="([^"]+)"/g)]
  .map(([, id, district, transition]) => ({ id, district, transition }));
assert.deepEqual(pages, [
  { id: 'home', district: 'home', transition: 'tide' },
  { id: 'videos', district: 'record', transition: 'shutter' },
  { id: 'fortune', district: 'oracle', transition: 'pressure' },
  { id: 'game', district: 'game', transition: 'emergency' },
  { id: 'submit', district: 'workshop', transition: 'portal' },
  { id: 'join', district: 'bureau', transition: 'stamp' }
], 'Every primary route needs a district and transition identity');

const expectedScripts = [
  'site.js',
  'photo-catalog.js',
  'photo-background.js',
  'kingdom-world-data.js',
  'kingdom-experience.js',
  'kingdom-audio.js',
  'kingdom-world.js',
  'roulette-entertainment.js',
  'roulette-controller.js',
  'deep-sea-game.js'
];
const scriptSources = [...html.matchAll(/<script src="([^"?]+)/g)].map(([, source]) => source);
for (let index = 1; index < expectedScripts.length; index += 1) {
  assert.ok(
    scriptSources.indexOf(expectedScripts[index - 1]) < scriptSources.indexOf(expectedScripts[index]),
    `${expectedScripts[index - 1]} must load before ${expectedScripts[index]}`
  );
}
assert.match(html, /kingdom-world\.css\?v=/, 'world stylesheet must be loaded');
assert.match(html, /id="kingdom-logbook"[^>]*aria-labelledby="kingdom-logbook-title"/, 'logbook needs a labelled dialog');
assert.match(html, /id="kingdom-logbook-open"[^>]*aria-haspopup="dialog"/, 'logbook opener needs dialog semantics');

assert.doesNotMatch(experience, /scheduleEnvironmentEvent|is-shoal-passing|is-current-glint|is-royal-wake/, 'superseded ambient timer must be removed');
assert.match(experience, /NaokingWorldData\?\.getDailyContext/, 'daily decree must consume the canonical daily model');
assert.match(site, /naoking:pagechange/, 'navigation must publish one page-change event');
assert.equal((site.match(/dispatchEvent\(new CustomEvent\('naoking:pagechange'/g) || []).length, 1, 'page change event must have one publisher');

assert.match(world, /selectSurprise/, 'site-wide surprise registry must be consumed');
assert.match(world, /document\.hidden/, 'world lifecycle must respect Page Visibility');
assert.match(world, /prefers-reduced-motion/, 'world lifecycle must respect reduced motion');
assert.doesNotMatch(world, /specialWinScale\s*=|specialLoseScale\s*=|revivalScale\s*=/, 'world presentation cannot mutate Oracle probabilities');

assert.match(worldCss, /body\[data-page="videos"\]/, 'record district needs its own visual identity');
assert.match(worldCss, /body\[data-page="fortune"\]/, 'oracle district needs its own visual identity');
assert.match(worldCss, /body\[data-page="game"\]/, 'game district needs its own visual identity');
assert.match(worldCss, /body\[data-page="submit"\]/, 'workshop district needs its own visual identity');
assert.match(worldCss, /body\[data-page="join"\]/, 'bureau district needs its own visual identity');
assert.match(worldCss, /@media \(max-width:\s*820px\)/, 'tablet/mobile breakpoint is required');
assert.match(worldCss, /@media \(max-width:\s*560px\)/, 'compact mobile breakpoint is required');
assert.match(worldCss, /prefers-reduced-motion:\s*reduce/, 'reduced-motion fallback is required');
assert.match(worldCss, /forced-colors:\s*active/, 'forced-colors fallback is required');

const catalogSandbox = { window: {} };
vm.runInNewContext(catalogSource, catalogSandbox, { filename: 'photo-catalog.js' });
assert.equal(catalogSandbox.window.NaokingPhotoCatalog.length, 26, '26 linked photos must remain intact');
assert.ok(Object.isFrozen(catalogSandbox.window.NaokingPhotoCatalog), 'photo catalog must be immutable');

const dataSandbox = {};
vm.runInNewContext(dataSource, dataSandbox, { filename: 'kingdom-world-data.js' });
const context = dataSandbox.NaokingWorldData.getDailyContext('2026-08-31', { photoCount: 26 });
assert.equal(context.probabilityPolicy.oracleSpecialWinScale, 1);
assert.equal(context.probabilityPolicy.oracleSpecialLoseScale, 1);
assert.equal(context.probabilityPolicy.oracleRevivalScale, 1);
assert.equal(context.probabilityPolicy.gameRewardScale, 1);

console.log(JSON.stringify({
  status: 'PASS',
  pages,
  scripts: scriptSources,
  ids: ids.length,
  photos: catalogSandbox.window.NaokingPhotoCatalog.length,
  worldState: context.worldStateId,
  probabilityPolicy: context.probabilityPolicy
}, null, 2));
