import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const dataSource = await readFile(new URL('../kingdom-world-data.js', import.meta.url), 'utf8');
const controllerSource = await readFile(new URL('../kingdom-world.js', import.meta.url), 'utf8');
new vm.Script(controllerSource, { filename: 'kingdom-world.js' });

const dataSandbox = {};
vm.createContext(dataSandbox);
vm.runInContext(dataSource, dataSandbox, { filename: 'kingdom-world-data.js' });
const baseModel = dataSandbox.NaokingWorldDataFactory();
const compact = value => JSON.parse(JSON.stringify(value));

const dateKeyAt = offset => new Date(Date.UTC(2026, 0, 1 + offset)).toISOString().slice(0, 10);
let dateKey = '';
for (let offset = 0; offset < 500; offset += 1) {
  const candidate = dateKeyAt(offset);
  const events = new Set(baseModel.errandsFor(candidate).map(item => item.completionEvent));
  if (events.has('game:bubbles-3') && events.has('gallery:favorite')) {
    dateKey = candidate;
    break;
  }
}
assert.ok(dateKey, 'test needs a deterministic day containing the three-pickup errand');

let visitorDateKey = '';
for (let offset = 0; offset < 500; offset += 1) {
  const candidate = dateKeyAt(offset);
  if (baseModel.errandsFor(candidate).some(item => item.completionEvent === 'discovery:daily-visitor')) {
    visitorDateKey = candidate;
    break;
  }
}
assert.ok(visitorDateKey, 'test needs a deterministic day containing the quiet-creature errand');

class FakeEventTarget {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, listener, options = {}) {
    const entries = this.listeners.get(type) || [];
    entries.push({ listener, once: Boolean(options?.once) });
    this.listeners.set(type, entries);
  }
  dispatchEvent(event) {
    event.target ||= this;
    event.currentTarget = this;
    const entries = [...(this.listeners.get(event.type) || [])];
    entries.forEach(entry => {
      entry.listener.call(this, event);
      if (entry.once) this.listeners.set(event.type, (this.listeners.get(event.type) || []).filter(item => item !== entry));
    });
    return true;
  }
}

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...values) { values.forEach(value => this.values.add(value)); }
  remove(...values) { values.forEach(value => this.values.delete(value)); }
  contains(value) { return this.values.has(value); }
  toggle(value, force) {
    const next = force === undefined ? !this.values.has(value) : Boolean(force);
    next ? this.values.add(value) : this.values.delete(value);
    return next;
  }
}

class FakeElement extends FakeEventTarget {
  constructor() {
    super();
    this.classList = new FakeClassList();
    this.dataset = {};
    this.style = { setProperty() {}, removeProperty() {} };
    this.attributes = new Map();
    this.open = false;
    this.textContent = '';
    this.disabled = false;
    this.children = [];
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
  querySelector() { return null; }
  replaceChildren(...children) { this.children = children; }
  showModal() { this.open = true; }
  close() { this.open = false; this.dispatchEvent({ type: 'close' }); }
  focus() {}
}

class FakeCustomEvent {
  constructor(type, init = {}) { this.type = type; this.detail = init.detail; }
}

function createControllerScenario({
  scenarioDate = visitorDateKey,
  reduced = false,
  compactViewport = false,
  forcedColors = false,
  hidden = false,
  forcedSurpriseId = null,
  forcedPresentationMode = null
} = {}) {
  const scenarioRegistry = new Map([
    ['kingdom-actor', new FakeElement()],
    ['kingdom-surprise', new FakeElement()]
  ]);
  const surpriseTitle = new FakeElement();
  const surpriseDetail = new FakeElement();
  scenarioRegistry.get('kingdom-surprise').querySelector = selector => (
    selector === 'b' ? surpriseTitle : selector === 'span' ? surpriseDetail : null
  );

  const scenarioBody = new FakeElement();
  scenarioBody.dataset.page = 'home';
  const scenarioDocument = Object.assign(new FakeEventTarget(), {
    body: scenarioBody,
    hidden,
    createElement() { return new FakeElement(); },
    getElementById(id) { return id === 'home' ? new FakeElement() : scenarioRegistry.get(id) || null; },
    querySelector(selector) {
      if (selector.startsWith('#')) return scenarioRegistry.get(selector.slice(1)) || null;
      return null;
    }
  });

  let scenarioNextTimer = 1;
  const scenarioTimers = new Map();
  const setScenarioTimer = (callback, delay = 0) => {
    const id = scenarioNextTimer++;
    scenarioTimers.set(id, { callback, delay });
    return id;
  };
  const clearScenarioTimer = id => scenarioTimers.delete(id);
  const scenarioStorage = new Map();
  const scenarioLocalStorage = {
    getItem: key => scenarioStorage.has(key) ? scenarioStorage.get(key) : null,
    setItem: (key, value) => scenarioStorage.set(key, String(value)),
    removeItem: key => scenarioStorage.delete(key)
  };
  scenarioStorage.set(baseModel.STORAGE_KEY, JSON.stringify(baseModel.createProgression(scenarioDate)));

  const reducedQuery = { matches: reduced, addEventListener() {}, removeEventListener() {} };
  const compactQuery = { matches: compactViewport, addEventListener() {}, removeEventListener() {} };
  const forcedColorsQuery = { matches: forcedColors, addEventListener() {}, removeEventListener() {} };
  const scenarioAudio = [];
  const scenarioModel = {
    ...baseModel,
    toLocalDateKey: () => scenarioDate,
    selectSurprise: forcedSurpriseId
      ? () => {
          const item = baseModel.indexes.surprises[forcedSurpriseId];
          assert.ok(item, `forced surprise ${forcedSurpriseId} must exist`);
          return {
            ...item,
            presentationMode: forcedPresentationMode || (reduced ? 'reduced' : 'full')
          };
        }
      : baseModel.selectSurprise
  };
  const scenarioWindow = Object.assign(new FakeEventTarget(), {
    localStorage: scenarioLocalStorage,
    NaokingWorldData: scenarioModel,
    NaokingPhotoCatalog: Array.from({ length: 26 }, (_, index) => ({ id: String(index + 1) })),
    NaokingPhotos: { current: () => 0, isPaused: () => false, select: () => Promise.resolve(true) },
    NaokingAudio: {
      world: detail => { scenarioAudio.push(detail); return true; },
      snapshot: () => ({ enabled: true })
    },
    NaokingRoyalPassport: { reset() {} },
    matchMedia: query => query.includes('max-width')
      ? compactQuery
      : query.includes('forced-colors')
        ? forcedColorsQuery
        : reducedQuery,
    setTimeout: setScenarioTimer,
    clearTimeout: clearScenarioTimer,
    requestAnimationFrame: callback => { callback(); return 1; },
    confirm: () => true
  });
  const scenarioSandbox = vm.createContext({
    window: scenarioWindow,
    document: scenarioDocument,
    localStorage: scenarioLocalStorage,
    CustomEvent: FakeCustomEvent,
    Date,
    Math,
    Object,
    Map,
    Set,
    WeakSet,
    Number,
    String,
    Boolean,
    Array,
    Promise,
    console
  });
  vm.runInContext(controllerSource, scenarioSandbox, { filename: 'kingdom-world.js' });

  return {
    actor: scenarioRegistry.get('kingdom-actor'),
    controller: scenarioWindow.NaokingKingdomWorld,
    document: scenarioDocument,
    surprise: scenarioRegistry.get('kingdom-surprise'),
    audio: scenarioAudio,
    timers: scenarioTimers,
    fireActorSchedule() {
      const timer = [...scenarioTimers.entries()].find(([, entry]) => entry.delay >= 10000 && entry.delay < 15000);
      assert.ok(timer, 'ambient life must schedule the quiet-creature appearance');
      scenarioTimers.delete(timer[0]);
      timer[1].callback();
    }
  };
}

const registry = new Map([
  ['daily-stamp', new FakeElement()],
  ['kingdom-gallery', new FakeElement()],
  ['gallery-image', new FakeElement()],
  ['gallery-favorite', new FakeElement()],
  ['photo-gallery-open', new FakeElement()],
  ['kingdom-logbook-clear', new FakeElement()],
  ['logbook-discoveries', new FakeElement()]
]);
const body = new FakeElement();
body.dataset.page = 'home';
const document = Object.assign(new FakeEventTarget(), {
  body,
  hidden: false,
  createElement() { return new FakeElement(); },
  getElementById(id) { return ['home', 'game'].includes(id) ? new FakeElement() : registry.get(id) || null; },
  querySelector(selector) {
    if (selector.startsWith('#')) return registry.get(selector.slice(1)) || null;
    if (selector === 'dialog[open]') return registry.get('kingdom-gallery').open ? registry.get('kingdom-gallery') : null;
    return null;
  }
});

let nextTimer = 1;
const pendingTimers = new Map();
function setTimeoutFake(callback, delay = 0) {
  const id = nextTimer++;
  pendingTimers.set(id, { callback, delay });
  return id;
}
function clearTimeoutFake(id) { pendingTimers.delete(id); }
function flushDelay(delay) {
  const matches = [...pendingTimers.entries()].filter(([, timer]) => timer.delay === delay);
  matches.forEach(([id, timer]) => { pendingTimers.delete(id); timer.callback(); });
}

const storage = new Map();
const localStorage = {
  getItem: key => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key)
};

const initialState = baseModel.sanitizeProgression({
  ...baseModel.createProgression(dateKey),
  pinnedPhotoId: 7,
  daily: { dateKey, completedErrandIds: [], chosenErrandId: null, acknowledged: false }
});
storage.set(baseModel.STORAGE_KEY, JSON.stringify(initialState));
storage.set('naokingRoyalPassportV1', JSON.stringify({ stamps: ['2025-12-30'] }));

const selectedPhotos = [];
const worldAudio = [];
let passportResets = 0;
const matchMedia = {
  matches: false,
  addEventListener() {},
  removeEventListener() {}
};
const window = Object.assign(new FakeEventTarget(), {
  localStorage,
  NaokingWorldData: { ...baseModel, toLocalDateKey: () => dateKey },
  NaokingPhotoCatalog: Array.from({ length: 26 }, (_, index) => ({ id: String(index + 1) })),
  NaokingPhotos: {
    current: () => selectedPhotos.at(-1) ?? 0,
    isPaused: () => false,
    select: index => { selectedPhotos.push(index); return Promise.resolve(true); }
  },
  NaokingAudio: {
    world: detail => { worldAudio.push(detail); return true; },
    snapshot: () => ({ enabled: true })
  },
  NaokingRoyalPassport: { reset: () => { passportResets += 1; localStorage.removeItem('naokingRoyalPassportV1'); } },
  matchMedia: () => matchMedia,
  setTimeout: setTimeoutFake,
  clearTimeout: clearTimeoutFake,
  requestAnimationFrame: callback => { callback(); return 1; },
  confirm: () => true
});

const sandbox = vm.createContext({
  window,
  document,
  localStorage,
  CustomEvent: FakeCustomEvent,
  Date,
  Math,
  Object,
  Map,
  Set,
  WeakSet,
  Number,
  String,
  Boolean,
  Array,
  Promise,
  console
});
vm.runInContext(controllerSource, sandbox, { filename: 'kingdom-world.js' });

const controller = window.NaokingKingdomWorld;
assert.ok(controller, 'controller API must be exposed');
assert.equal(controller.progression().visitedDistricts.includes('home'), true, 'the home route must map to its real GATE-00 district');
assert.equal(controller.progression().visitedDistricts.includes('daily'), false, 'the embedded daily signal must not replace the home district');

flushDelay(180);
assert.equal(selectedPhotos[0], 7, 'a pinned favorite must override the daily photo on return');
assert.equal(worldAudio.length, 0, 'daily state audio must wait for an explicit audience action');

const pickupErrand = baseModel.errandsFor(dateKey).find(item => item.completionEvent === 'game:bubbles-3');
window.dispatchEvent(new FakeCustomEvent('naoking:gameaudio', { detail: { cue: 'pickup' } }));
window.dispatchEvent(new FakeCustomEvent('naoking:gameaudio', { detail: { cue: 'rare-pickup' } }));
assert.equal(controller.progression().daily.completedErrandIds.includes(pickupErrand.id), false, 'two pickups must not complete a three-pickup errand');
window.dispatchEvent(new FakeCustomEvent('naoking:gameaudio', { detail: { cue: 'pickup' } }));
assert.equal(controller.progression().daily.completedErrandIds.includes(pickupErrand.id), true, 'the third pickup must complete the errand');

const completionBeforeStamp = [...controller.progression().daily.completedErrandIds];
registry.get('daily-stamp').dispatchEvent({ type: 'click' });
assert.deepEqual(
  [...controller.progression().daily.completedErrandIds],
  completionBeforeStamp,
  'audience stamp must preserve errands completed earlier that day'
);
assert.equal(controller.progression().daily.acknowledged, true);
assert.deepEqual(compact(worldAudio.at(-1)), {
  action: 'world',
  type: 'state',
  state: controller.daily.worldStateId
}, 'daily state audio must use the semantic world-event shape');

const gallery = registry.get('kingdom-gallery');
window.dispatchEvent(new FakeCustomEvent('naoking:photochange', { detail: { index: 3 } }));
assert.equal(controller.progression().discoveries.includes('photo-04'), false, 'ambient background rotation must not count as a viewed memory');
gallery.open = true;
window.dispatchEvent(new FakeCustomEvent('naoking:photochange', { detail: { index: 3 } }));
assert.equal(controller.progression().discoveries.includes('photo-04'), true, 'an open gallery may record its visible memory');

const favoriteErrand = baseModel.errandsFor(dateKey).find(item => item.completionEvent === 'gallery:favorite');
registry.get('gallery-image').dataset.photoIndex = '9';
registry.get('gallery-favorite').dispatchEvent({ type: 'click' });
assert.ok(controller.progression().favoritePhotoIds.includes(9), 'favorite must use the atomically displayed gallery index');
assert.equal(controller.progression().pinnedPhotoId, 9);
assert.ok(controller.progression().daily.completedErrandIds.includes(favoriteErrand.id), 'favoriting a displayed memory must complete its reachable errand');

controller.discover('controller-test-signal');
assert.deepEqual(compact(worldAudio.at(-1)), {
  action: 'world',
  type: 'discovery',
  discovery: 'controller-test-signal'
}, 'discovery audio must use one unambiguous semantic identity field');

controller.discover('royal-maintenance');
const discoveryRows = registry.get('logbook-discoveries').children;
assert.ok(discoveryRows.some(row => /王国整備中/.test(row.textContent)), 'surprise discoveries must use their Japanese catalog title');
assert.ok(discoveryRows.every(row => !/royal-maintenance|未分類記録/.test(row.textContent)), 'logbook copy must never expose internal discovery IDs');

gallery.open = false;
const timersBeforeNavigation = pendingTimers.size;
window.dispatchEvent(new FakeCustomEvent('naoking:pagechange', { detail: { page: 'game' } }));
const timersAfterOneNavigation = pendingTimers.size;
window.dispatchEvent(new FakeCustomEvent('naoking:pagechange', { detail: { page: 'game' } }));
assert.equal(pendingTimers.size, timersAfterOneNavigation, 'repeated navigation must replace, not accumulate, ambient schedules');
assert.ok(timersAfterOneNavigation <= timersBeforeNavigation, 'leaving home should also cancel its quiet-visit timer');

registry.get('kingdom-logbook-clear').dispatchEvent({ type: 'click' });
assert.equal(storage.has('naokingRoyalPassportV1'), false, 'reset must remove legacy stamps so they cannot be re-imported on reload');
assert.equal(passportResets, 1, 'reset must refresh the legacy passport UI in the same tab');
assert.equal(controller.progression().totalVisits, 1, 'reset must count only the active visit once');
assert.equal(controller.progression().daily.completedErrandIds.length, 0);
assert.equal(controller.progression().pinnedPhotoId, null);

const visitorErrand = baseModel.errandsFor(visitorDateKey).find(item => item.completionEvent === 'discovery:daily-visitor');
for (const fallback of [
  { label: 'reduced motion', reduced: true, compactViewport: false, activation: 'click' },
  { label: 'compact viewport', reduced: false, compactViewport: true, activation: 'keyboard' },
  { label: 'forced colors', reduced: false, compactViewport: false, forcedColors: true, activation: 'click' }
]) {
  const scenario = createControllerScenario(fallback);
  scenario.fireActorSchedule();
  assert.equal(
    scenario.actor.classList.contains('is-static-fallback'),
    true,
    `${fallback.label} must display a stationary, findable actor`
  );
  assert.equal(scenario.actor.attributes.get('aria-hidden'), 'false');
  assert.equal(scenario.actor.attributes.get('role'), 'button');
  assert.equal(
    scenario.controller.progression().daily.completedErrandIds.includes(visitorErrand.id),
    false,
    `${fallback.label} must not auto-complete an invisible discovery`
  );
  if (fallback.activation === 'click') {
    scenario.actor.dispatchEvent({ type: 'click' });
  } else {
    let prevented = false;
    scenario.actor.dispatchEvent({ type: 'keydown', key: 'Enter', preventDefault() { prevented = true; } });
    assert.equal(prevented, true, 'keyboard discovery must consume Enter');
  }
  assert.equal(
    scenario.controller.progression().discoveries.includes('daily-visitor'),
    true,
    `${fallback.label} actor must be discoverable by audience action`
  );
  assert.equal(
    scenario.controller.progression().daily.completedErrandIds.includes(visitorErrand.id),
    true,
    `${fallback.label} must keep find-quiet-creature reachable`
  );
}

const reducedSurprise = createControllerScenario({
  reduced: true,
  forcedSurpriseId: 'royal-crossing',
  forcedPresentationMode: 'reduced'
});
reducedSurprise.controller.surprise();
assert.equal(reducedSurprise.surprise.classList.contains('is-active'), true, 'reduced surprise must still become visible');
assert.equal(reducedSurprise.surprise.dataset.mode, 'reduced', 'reduced surprise must select the stationary CSS route');
assert.equal(
  reducedSurprise.audio.some(detail => detail.type === 'surprise' && detail.surprise === 'royal-crossing'),
  true,
  'reduced visual fallback must preserve an eligible surprise sound'
);

const silentSurprise = createControllerScenario({
  forcedSurpriseId: 'quiet-power-nap',
  forcedPresentationMode: 'full'
});
silentSurprise.controller.surprise();
assert.equal(silentSurprise.surprise.classList.contains('is-active'), true, 'quiet power nap must still render');
assert.equal(silentSurprise.surprise.dataset.kind, 'quiet-power-nap');
assert.equal(
  silentSurprise.audio.some(detail => detail.type === 'surprise'),
  false,
  'quiet-power-nap must remain silent even when sound is enabled'
);

const initiallyHidden = createControllerScenario({ hidden: true });
assert.equal(
  [...initiallyHidden.timers.values()].some(timer => timer.delay >= 10000),
  false,
  'an initially hidden document must not schedule actor or surprise timers'
);

document.hidden = true;
document.dispatchEvent({ type: 'visibilitychange' });
assert.equal(pendingTimers.size, 0, 'hidden documents must not retain world timers');

console.log(JSON.stringify({
  status: 'PASS',
  dateKey,
  pickupErrand: pickupErrand.id,
  worldAudioEvents: worldAudio.length,
  pinnedPhotoRestored: selectedPhotos[0],
  timersAfterCleanup: pendingTimers.size
}, null, 2));
