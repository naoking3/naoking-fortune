import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalogSource = readFileSync(join(root, 'photo-catalog.js'), 'utf8');
const backgroundSource = readFileSync(join(root, 'photo-background.js'), 'utf8');
const experienceSource = readFileSync(join(root, 'kingdom-experience.js'), 'utf8');
const deepSeaSource = readFileSync(join(root, 'deep-sea.css'), 'utf8');

function classList() {
  const values = new Set();
  return {
    add: (...names) => names.forEach(name => values.add(name)),
    remove: (...names) => names.forEach(name => values.delete(name)),
    contains: name => values.has(name)
  };
}

function element() {
  const properties = new Map();
  return {
    className: '',
    classList: classList(),
    style: {
      backgroundImage: '',
      objectPosition: '',
      setProperty: (name, value) => properties.set(name, value),
      getPropertyValue: name => properties.get(name) || ''
    }
  };
}

const background = { append() {} };
const dispatched = [];
const windowObject = {
  matchMedia: () => ({ matches: true, addEventListener() {} }),
  clearInterval() {},
  setInterval: () => 1,
  dispatchEvent: event => dispatched.push(event)
};
const documentObject = {
  hidden: false,
  querySelector: selector => selector === '#photo-background' ? background : null,
  querySelectorAll: () => [],
  createElement: element,
  addEventListener() {}
};
class TestImage {
  set src(value) {
    this.value = value;
    this.onload?.();
  }
}
class TestCustomEvent {
  constructor(type, init) {
    this.type = type;
    this.detail = init?.detail;
  }
}

const context = vm.createContext({
  window: windowObject,
  document: documentObject,
  Image: TestImage,
  CustomEvent: TestCustomEvent,
  console
});
vm.runInContext(catalogSource, context, { filename: 'photo-catalog.js' });

const catalog = windowObject.NaokingPhotoCatalog;
assert.ok(Array.isArray(catalog), 'catalog should be an array');
assert.equal(catalog.length, 26, 'catalog should contain the exact 26 existing photos');
assert.ok(Object.isFrozen(catalog), 'catalog array should be immutable');

const expectedSources = Array.from(
  { length: 26 },
  (_, index) => `assets/backgrounds/vrchat-${String(index + 1).padStart(2, '0')}.webp`
);
assert.deepEqual([...catalog].map(record => record.source), expectedSources, 'catalog order changed');
assert.equal(new Set(catalog.map(record => record.source)).size, 26, 'photo sources should be unique');

for (const [index, record] of catalog.entries()) {
  assert.ok(Object.isFrozen(record), `record ${index + 1} should be immutable`);
  assert.ok(Object.isFrozen(record.tags), `record ${index + 1} tags should be immutable`);
  assert.equal(record.id, String(index + 1).padStart(2, '0'), `record ${index + 1} id mismatch`);
  assert.ok(existsSync(join(root, record.source)), `${record.source} does not exist`);
  assert.ok(existsSync(join(root, record.thumbnail)), `${record.thumbnail} does not exist`);
  assert.ok(statSync(join(root, record.thumbnail)).size < statSync(join(root, record.source)).size, `${record.thumbnail} should be smaller than its full image`);
  assert.match(record.alt, /[ぁ-んァ-ヶ一-龠]/u, `record ${record.id} needs Japanese alt text`);
  assert.match(record.caption, /[ぁ-んァ-ヶ一-龠]/u, `record ${record.id} needs a Japanese caption`);
  assert.ok(Number.isFinite(record.focalX) && record.focalX >= 0 && record.focalX <= 100, `record ${record.id} focalX is invalid`);
  assert.ok(Number.isFinite(record.focalY) && record.focalY >= 0 && record.focalY <= 100, `record ${record.id} focalY is invalid`);
  assert.ok(record.tone.length > 0, `record ${record.id} needs a tone`);
  assert.ok(record.tags.length >= 2, `record ${record.id} needs useful tags`);
}

assert.throws(() => { catalog[0].caption = '変更'; }, { name: 'TypeError' }, 'record mutation should fail');
assert.throws(() => { catalog.push(catalog[0]); }, { name: 'TypeError' }, 'catalog mutation should fail');

assert.match(backgroundSource, /const catalog = window\.NaokingPhotoCatalog;/, 'background should consume the catalog');
assert.doesNotMatch(backgroundSource, /Array\.from\(\{ length: 26 \}/, 'background should not recreate the source list');
assert.match(backgroundSource, /window\.NaokingPhotos = Object\.freeze/, 'legacy NaokingPhotos API is missing');
assert.match(backgroundSource, /while \(next === currentIndex && photos\.length > 1\)/, 'no-consecutive rotation guard is missing');
assert.match(backgroundSource, /record\.alt/, 'snapshot alt text should come from the selected record');
assert.match(backgroundSource, /record\.focalX/, 'background focal metadata should be wired');
assert.match(backgroundSource, /record\.focalY/, 'vertical background focal metadata should be wired');
assert.match(deepSeaSource, /var\(--photo-y, 50%\)/, 'background CSS should render the vertical focal metadata');

assert.match(experienceSource, /const photoCatalog = window\.NaokingPhotoCatalog \|\| \[\];/, 'gallery should consume the catalog');
assert.match(experienceSource, /record\.thumbnail/, 'gallery strip should use lightweight thumbnail derivatives');
assert.match(experienceSource, /galleryLoadToken/, 'gallery selection should guard asynchronous image races');
assert.match(experienceSource, /naoking:galleryselection/, 'gallery should publish its atomically committed selection');
assert.match(experienceSource, /galleryCaption\.textContent = record\.caption;/, 'gallery caption should come from the selected record');
assert.match(experienceSource, /galleryImage\.alt = record\.alt;/, 'gallery alt text should come from the selected record');
assert.doesNotMatch(experienceSource, /const galleryCaptions = \[/, 'duplicated gallery captions still exist');

vm.runInContext(backgroundSource, context, { filename: 'photo-background.js' });
const api = windowObject.NaokingPhotos;
assert.ok(api && Object.isFrozen(api), 'NaokingPhotos API should still be exposed and frozen');
assert.deepEqual([...api.sources], expectedSources, 'NaokingPhotos.sources should preserve all source paths and order');
assert.ok(Object.isFrozen(api.sources), 'NaokingPhotos.sources should be read-only');
for (const method of ['current', 'select', 'isPaused', 'pause', 'resume']) {
  assert.equal(typeof api[method], 'function', `NaokingPhotos.${method} should remain available`);
}
api.pause();
assert.equal(api.isPaused(), true, 'pause should still work');
api.resume();
assert.equal(api.isPaused(), false, 'resume should still work');
await api.select(4);
assert.equal(api.current(), 4, 'select/current should still use zero-based indices');
assert.equal(dispatched.at(-1)?.detail?.record, catalog[4], 'photochange should carry the same selected record');

console.log('photo catalog tests passed: 26 immutable records, files, metadata, consumers and legacy API verified');
