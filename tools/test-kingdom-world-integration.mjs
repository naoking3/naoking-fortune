import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const css = await readFile(new URL('kingdom-world.css', root), 'utf8');

const all = (pattern, source = html) => [...source.matchAll(pattern)];
const ids = all(/\bid="([^"]+)"/g).map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'index.html must not contain duplicate IDs');
const idSet = new Set(ids);

for (const match of all(/\b(?:aria-controls|aria-labelledby|aria-describedby)="([^"]+)"/g)) {
  for (const reference of match[1].trim().split(/\s+/)) {
    assert.ok(idSet.has(reference), `ARIA reference #${reference} does not exist`);
  }
}

for (const match of all(/<button\b[^>]*>/gi)) {
  assert.match(match[0], /\btype="(?:button|submit|reset)"/i, 'every button needs an explicit type');
}
for (const match of all(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)) {
  assert.doesNotMatch(match[1], /<(?:a|button|input|select|textarea)\b/i, 'interactive elements must not be nested in buttons');
}
for (const match of all(/<img\b[^>]*>/gi)) {
  assert.match(match[0], /\balt="[^"]*"/i, 'every image needs an alt attribute');
}

const pages = all(/<section\b[^>]*\bclass="[^"]*\bpage\b[^"]*"[^>]*>/gi).map(match => match[0]);
assert.equal(pages.length, 6, 'all six top-level destinations must remain present');
pages.forEach((page, index) => {
  assert.match(page, /\bdata-depth="[^"]+"/, 'each destination needs a depth');
  assert.match(page, /\bdata-district="[^"]+"/, 'each destination needs a district identity');
  assert.match(page, /\bdata-transition="[^"]+"/, 'each destination needs a transition identity');
  assert.match(page, /\baria-labelledby="[^"]+"/, 'each destination needs an accessible heading reference');
  if (index > 0) assert.match(page, /\bhidden\b/, 'inactive destinations must be initially hidden');
});

const logbookButton = html.match(/<button\b[^>]*\bid="kingdom-logbook-open"[^>]*>/i)?.[0] || '';
assert.match(logbookButton, /\baria-label="王国手帳を開く"/, 'logbook toggle needs a stable accessible name');
assert.match(logbookButton, /\baria-controls="kingdom-logbook"/, 'logbook toggle must reference its dialog');
assert.match(html, /id="kingdom-discovery-count"\s+aria-hidden="true"/, 'visual discovery count must not pollute the button name');
assert.match(html, /<dialog\b[^>]*\bid="kingdom-logbook"[^>]*\baria-describedby="kingdom-logbook-intro"/, 'logbook dialog needs its explanatory description');

const indexOf = token => {
  const index = html.indexOf(token);
  assert.notEqual(index, -1, `${token} must be loaded`);
  return index;
};
assert.ok(indexOf('photo-catalog.js') < indexOf('photo-background.js'), 'photo catalog must load before its consumer');
assert.ok(indexOf('kingdom-world-data.js') < indexOf('kingdom-world.js'), 'world data must load before the world controller');
assert.ok(indexOf('kingdom-audio.js') < indexOf('kingdom-world.js'), 'sound API must load before world discoveries can use it');
assert.ok(indexOf('kingdom-world.css') > indexOf('kingdom-experience.css'), 'district overrides must load after the established experience styles');

assert.match(css, /body\.menu-open\s+\.kingdom-logbook-toggle\s*\{[^}]*visibility:\s*hidden/s, 'mobile navigation must suppress the floating logbook control');
assert.match(css, /bottom:\s*calc\(max\(18px,\s*env\(safe-area-inset-bottom\)\)\s*\+\s*58px\)/, 'mobile logbook must clear the fixed sound control');
assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.decree-seal\.is-stamped\s*\{\s*animation:\s*none\s*!important;/, 'reduced motion must disable the stamp animation');
assert.match(css, /@media\s*\(max-width:\s*560px\)[\s\S]*?mix-blend-mode:\s*normal;/, 'small screens should avoid the full-screen blend pass');
assert.match(css, /\.kingdom-actor\.is-static-fallback\s*\{[^}]*display:\s*block\s*!important;[^}]*pointer-events:\s*auto;/s, 'the compact/reduced actor fallback must remain visible and interactive');
assert.match(css, /@media\s*\(max-width:\s*820px\)[\s\S]*?\.kingdom-actor:not\(\.is-static-fallback\)\s*\{\s*display:\s*none;/, 'compact screens must hide only animated actors');
assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.kingdom-actor:not\(\.is-static-fallback\)\s*\{\s*display:\s*none\s*!important;/, 'reduced motion must hide only animated actors');
assert.match(css, /@media\s*\(forced-colors:\s*active\)[\s\S]*?\.kingdom-actor:not\(\.is-static-fallback\)[^}]*display:\s*none;[\s\S]*?\.kingdom-actor\.is-static-fallback\s*\{[^}]*display:\s*block\s*!important;/, 'forced colors must retain a high-contrast static discovery actor');

console.log('kingdom world integration tests passed: IDs, ARIA, markup, load order and responsive safeguards verified');
