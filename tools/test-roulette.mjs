import fs from 'node:fs';
import vm from 'node:vm';

class ClassList {
  constructor() { this.values = new Set(); }
  add(...values) { values.forEach(value => this.values.add(value)); }
  remove(...values) { values.forEach(value => this.values.delete(value)); }
  toggle(value, force) {
    if (force === true) { this.values.add(value); return true; }
    if (force === false) { this.values.delete(value); return false; }
    if (this.values.has(value)) { this.values.delete(value); return false; }
    this.values.add(value); return true;
  }
  contains(value) { return this.values.has(value); }
}

class Element {
  constructor() {
    this.dataset = {};
    this.classList = new ClassList();
    this.className = '';
    this.textContent = '';
    this.innerHTML = '';
    this.hidden = false;
    this.listeners = new Map();
    this.children = [];
    const properties = new Map();
    this.style = {
      setProperty: (name, value) => properties.set(name, String(value)),
      removeProperty: name => properties.delete(name),
      getPropertyValue: name => properties.get(name) || ''
    };
  }
  append(...children) { this.children.push(...children); }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  setAttribute(name, value) { this[name] = String(value); }
  removeAttribute(name) { delete this[name]; }
  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }
}

const selectors = new Map([
  ['#card', new Element()], ['#slot', new Element()], ['#reel', new Element()],
  ['#fortune-name', new Element()], ['#message', new Element()], ['#roulette-status', new Element()],
  ['#spin', new Element()], ['#blast', new Element()], ['#fortune-history', new Element()],
  ['.result', new Element()]
]);
const windowListeners = new Map();
const documentListeners = new Map();
const dispatchedEvents = [];
class CustomEventMock {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail || {};
  }
}
const windowMock = {
  setTimeout,
  clearTimeout,
  CustomEvent: CustomEventMock,
  location: { hostname: 'localhost' },
  // Keep lifecycle coverage fast while preserving every scheduled phase.
  matchMedia: () => ({ matches: true }),
  addEventListener(type, listener) {
    const listeners = windowListeners.get(type) || [];
    listeners.push(listener);
    windowListeners.set(type, listeners);
  },
  dispatchEvent(event) {
    dispatchedEvents.push({ type:event.type, detail:{ ...(event.detail || {}) } });
    (windowListeners.get(event.type) || []).forEach(listener => listener(event));
    return true;
  }
};
const documentElement = new Element();
const body = new Element();
const documentMock = {
  hidden: false,
  documentElement,
  body,
  querySelector: selector => selectors.get(selector) || null,
  createElement: () => new Element(),
  addEventListener(type, listener) {
    const listeners = documentListeners.get(type) || [];
    listeners.push(listener);
    documentListeners.set(type, listeners);
  }
};
const context = {
  window: windowMock,
  document: documentMock,
  console,
  Math,
  Map,
  Set,
  Object,
  Date
};

const source = fs.readFileSync(new URL('../roulette-controller.js', import.meta.url), 'utf8');
vm.runInNewContext(source, context, { filename: 'roulette-controller.js' });
// A second evaluation represents a stale duplicate script tag. The dataset
// guard must prevent it from registering another click/pagechange handler.
vm.runInNewContext(source, context, { filename: 'roulette-controller.js' });

const debug = windowMock.NaokingRouletteDebug;
if (!debug) throw new Error('NaokingRouletteDebug was not installed.');
const diagnostic = debug.runDiagnostics(100000);
const bagDiagnostic = debug.runMessageBagDiagnostics();
const presentationDiagnostic = debug.runPresentationDiagnostics(100000);
const sessionDiagnostic = debug.runPresentationDiagnostics(200);
const cutinDiagnostic = debug.runCutinDiagnostics();
const clickListeners = selectors.get('#spin').listeners.get('click') || [];
const pagechangeListeners = windowListeners.get('naoking:pagechange') || [];
const resultCount = Object.keys(diagnostic.byResult).length;
const failures = [];

if (clickListeners.length !== 1) failures.push(`spin listener count was ${clickListeners.length}`);
if (pagechangeListeners.length !== 1) failures.push(`pagechange listener count was ${pagechangeListeners.length}`);
if (diagnostic.repeatedNormal !== 0) failures.push(`normal result repeated ${diagnostic.repeatedNormal} times`);
if (diagnostic.immediateMessageRepeat !== 0) failures.push(`message repeated ${diagnostic.immediateMessageRepeat} times`);
if (diagnostic.integrityMismatches !== 0) failures.push(`result integrity mismatched ${diagnostic.integrityMismatches} times`);
if (diagnostic.nonFrozenResults !== 0) failures.push(`${diagnostic.nonFrozenResults} result objects were mutable`);
if (bagDiagnostic.duplicateWithinBag !== 0) failures.push(`message bag duplicated ${bagDiagnostic.duplicateWithinBag} times before exhaustion`);
if (bagDiagnostic.boundaryRepeats !== 0) failures.push(`message bag repeated ${bagDiagnostic.boundaryRepeats} times at a cycle boundary`);
if (resultCount !== 20) failures.push(`only ${resultCount} of 20 result definitions appeared`);
if (diagnostic.rates.loss < 0.07 || diagnostic.rates.loss > 0.11) failures.push(`loss rate ${diagnostic.rates.loss}`);
if (diagnostic.rates.normal < 0.61 || diagnostic.rates.normal > 0.72) failures.push(`normal rate ${diagnostic.rates.normal}`);
if (diagnostic.rates.win < 0.18 || diagnostic.rates.win > 0.29) failures.push(`win rate ${diagnostic.rates.win}`);
if (presentationDiagnostic.routeDefinitions !== 62) failures.push(`presentation route count was ${presentationDiagnostic.routeDefinitions}; expected 62`);
if (presentationDiagnostic.missingRoutes.length !== 0) failures.push(`uncovered presentation routes: ${presentationDiagnostic.missingRoutes.join(', ')}`);
if (presentationDiagnostic.immediateRouteRepeat !== 0) failures.push(`presentation immediately repeated ${presentationDiagnostic.immediateRouteRepeat} times`);
if (presentationDiagnostic.incompatibleRoutes !== 0) failures.push(`${presentationDiagnostic.incompatibleRoutes} incompatible presentation routes`);
if (presentationDiagnostic.resultPresentationContradictions !== 0) failures.push(`${presentationDiagnostic.resultPresentationContradictions} result/presentation contradictions`);
if (presentationDiagnostic.endingContradictions !== 0) failures.push(`${presentationDiagnostic.endingContradictions} event ending contradictions`);
if (presentationDiagnostic.nonFrozenPresentations !== 0) failures.push(`${presentationDiagnostic.nonFrozenPresentations} presentation objects were mutable`);
if (presentationDiagnostic.normalRouteCount !== 31) failures.push(`only ${presentationDiagnostic.normalRouteCount} of 31 normal routes appeared`);
if (presentationDiagnostic.largestRouteShare > 0.15) failures.push(`largest presentation share was ${presentationDiagnostic.largestRouteShare}`);
if (presentationDiagnostic.minEstimatedRotations < 10) failures.push(`minimum estimated rotations was ${presentationDiagnostic.minEstimatedRotations}`);
if (presentationDiagnostic.textCutinShare > 0.16) failures.push(`text cut-in share was ${presentationDiagnostic.textCutinShare}`);
if (presentationDiagnostic.fullEventShare < 0.15 || presentationDiagnostic.fullEventShare > 0.28) failures.push(`full event share was ${presentationDiagnostic.fullEventShare}`);
if (presentationDiagnostic.immediateCategoryRepeat / presentationDiagnostic.iterations > 0.08) failures.push(`category immediately repeated ${presentationDiagnostic.immediateCategoryRepeat} times`);
for (const category of ['environment','reel-event','intrusion','character-cutin','full-event','chaos-event','premium','text-cutin','rule-change']) {
  if (!presentationDiagnostic.categories[category]) failures.push(`presentation category ${category} was never selected`);
}
if (sessionDiagnostic.endingContradictions !== 0 || sessionDiagnostic.incompatibleRoutes !== 0) failures.push('200-spin session found a route/result contradiction');
if (cutinDiagnostic.sceneCount !== 31) failures.push(`scene route count was ${cutinDiagnostic.sceneCount}; expected 31`);
if (cutinDiagnostic.routeCount !== 62) failures.push(`cut-in diagnostics covered ${cutinDiagnostic.routeCount} routes`);
if (cutinDiagnostic.shortestSignalDwell < 3700) failures.push(`shortest signal cut-in was only ${cutinDiagnostic.shortestSignalDwell}ms`);
if (cutinDiagnostic.shortestTwistDwell < 3500) failures.push(`shortest twist cut-in was only ${cutinDiagnostic.shortestTwistDwell}ms`);
if (cutinDiagnostic.shortestSceneSignalDwell < 4000) failures.push(`shortest character cut-in was only ${cutinDiagnostic.shortestSceneSignalDwell}ms`);
if (cutinDiagnostic.shortestSceneTwistDwell < 3800) failures.push(`shortest character twist cut-in was only ${cutinDiagnostic.shortestSceneTwistDwell}ms`);
if (cutinDiagnostic.shortestSignalToTwist < 4380) failures.push(`a signal cut-in was replaced after only ${cutinDiagnostic.shortestSignalToTwist}ms`);
if (cutinDiagnostic.restartRoute.id !== 'abyssal-blackout-revival') failures.push('missing abyssal blackout revival route');
if (cutinDiagnostic.restartRoute.signalDwell < 5000) failures.push(`abyssal revival setup only lasted ${cutinDiagnostic.restartRoute.signalDwell}ms`);
if (cutinDiagnostic.netLossImage !== 'assets/characters/naoking-panic.webp') failures.push(`net loss image was ${cutinDiagnostic.netLossImage}`);

const fullEventRoutes = cutinDiagnostic.routes.filter(route => route.family === 'full-event');
if (fullEventRoutes.length !== 11) failures.push(`full event route count was ${fullEventRoutes.length}; expected 11`);
for (const route of fullEventRoutes) {
  const missingOutcomes = ['normal','win','loss','revival'].filter(outcome => !route.endingOutcomes.includes(outcome));
  if (missingOutcomes.length) failures.push(`${route.id} missing endings: ${missingOutcomes.join(', ')}`);
  if (route.endingVariantCount < 8) failures.push(`${route.id} had only ${route.endingVariantCount} ending variants`);
  if (!route.audioScene) failures.push(`${route.id} had no dedicated audio scene`);
}
const requiredChaosScenes = ['crown-goal','news-live','commercial-takeover','repair-disaster','abandon','cctv-chase','lunch-show','council-deadlock','upside-down','giant-naoking','pixel-palace'];
for (const sceneId of requiredChaosScenes) {
  if (!cutinDiagnostic.routes.some(route => route.sceneId === sceneId)) failures.push(`missing chaos expansion scene: ${sceneId}`);
}
const pixelPremium = cutinDiagnostic.routes.find(route => route.id === 'pixel-palace-bonus');
if (!pixelPremium || pixelPremium.category !== 'premium' || pixelPremium.endingVariantCount < 4 || pixelPremium.audioScene !== 'pixel') failures.push('pixel palace premium contract was incomplete');

const beforeClick = debug.getState();
clickListeners[0]?.();
clickListeners[0]?.();
const duringClick = debug.getState();
if (duringClick.resolvedDraws - beforeClick.resolvedDraws !== 1) failures.push('a busy second click resolved another draw');
if (!duringClick.busy) failures.push('draw was not marked busy while timers were active');
if (duringClick.timerCount < 1) failures.push('draw created no cancellable timers');
pagechangeListeners[0]?.({ detail: { page: 'home' } });
const afterPageChange = debug.getState();
if (afterPageChange.busy) failures.push('page change did not clear busy state');
if (afterPageChange.timerCount !== 0) failures.push(`page change left ${afterPageChange.timerCount} timers active`);
if (afterPageChange.phase !== '') failures.push(`page change left phase ${afterPageChange.phase}`);

// A cancelled draw may have emitted its initial descent cue, but none of its
// scheduled callbacks may publish a stop or result after page navigation.
const cancelledEventCount = dispatchedEvents.length;
const cancelledStopCount = dispatchedEvents.filter(event => event.type === 'naoking:oraclestop').length;
const cancelledResultCount = dispatchedEvents.filter(event => event.type === 'naoking:oracleresult').length;
await new Promise(resolve => setTimeout(resolve, 900));
if (dispatchedEvents.length !== cancelledEventCount) failures.push('page change allowed a stale roulette event to fire');
if (dispatchedEvents.filter(event => event.type === 'naoking:oraclestop').length !== cancelledStopCount) failures.push('page change allowed a stale reel stop');
if (dispatchedEvents.filter(event => event.type === 'naoking:oracleresult').length !== cancelledResultCount) failures.push('page change allowed a stale result reveal');

// Let a reduced-motion draw fully settle. The result remains visible while all
// page-wide route classes and cancellable timers must be gone.
dispatchedEvents.length = 0;
const beforeSettledDraw = debug.getState();
clickListeners[0]?.();
await new Promise(resolve => setTimeout(resolve, 1400));
const afterSettle = debug.getState();
if (afterSettle.busy) failures.push('settled draw remained busy');
if (afterSettle.timerCount !== 0) failures.push(`settled draw left ${afterSettle.timerCount} timers active`);
if (afterSettle.phase !== 'resting') failures.push(`settled draw phase was ${afterSettle.phase}`);
if (afterSettle.environmentClassCount !== 0) failures.push(`settled draw left ${afterSettle.environmentClassCount} high-cost environment classes`);

// One click must freeze and reveal one result. All five reel stops and every
// sound/phase cue must belong to that same presentation route.
const settledDrawEvents = [...dispatchedEvents];
const drawEvents = settledDrawEvents.filter(event => event.type === 'naoking:oracledraw');
const resultEvents = settledDrawEvents.filter(event => event.type === 'naoking:oracleresult');
const stopEvents = settledDrawEvents.filter(event => event.type === 'naoking:oraclestop');
const beatEvents = settledDrawEvents.filter(event => event.type === 'naoking:oraclebeat');
const phaseEvents = settledDrawEvents.filter(event => event.type === 'naoking:oraclephase');
const settledRoute = afterSettle.route;
if (afterSettle.resolvedDraws - beforeSettledDraw.resolvedDraws !== 1) failures.push('one settled click did not resolve exactly one draw');
if (drawEvents.length !== 1) failures.push(`one click emitted ${drawEvents.length} draw events`);
if (resultEvents.length !== 1) failures.push(`one click emitted ${resultEvents.length} result events`);
if (stopEvents.length !== 5) failures.push(`one click emitted ${stopEvents.length} reel-stop events instead of 5`);

if (stopEvents.length === 5) {
  const stopIndexes = stopEvents.map(event => Number(event.detail.index));
  if (new Set(stopIndexes).size !== 5 || stopIndexes.some(index => index < 0 || index > 4)) failures.push(`reel-stop indexes were not the five unique witnesses: ${stopIndexes.join(', ')}`);
  if (stopEvents.some(event => Number(event.detail.total) !== 5)) failures.push('a reel-stop event did not report total=5');
  if (stopEvents.filter(event => event.detail.final === true).length !== 1) failures.push('reel-stop events did not identify exactly one final stop');
}

const earlyPhases = new Set(['descent', 'cruise', 'signal', 'anomaly', 'twist', 'judgment']);
const earlyLeaks = phaseEvents.filter(event => earlyPhases.has(event.detail.phase) && Boolean(event.detail.resultKind));
if (earlyLeaks.length !== 0) failures.push(`${earlyLeaks.length} early phase events leaked resultKind before verdict`);

const routedEvents = settledDrawEvents.filter(event => ['naoking:oracledraw', 'naoking:oraclephase', 'naoking:oraclebeat', 'naoking:oraclestop', 'naoking:oracleresult'].includes(event.type) && event.detail.route);
const wrongRouteEvents = routedEvents.filter(event => event.detail.route !== settledRoute);
const contractEvents = settledDrawEvents.filter(event => ['naoking:oraclephase', 'naoking:oraclebeat', 'naoking:oraclestop', 'naoking:oracleresult'].includes(event.type));
const missingRouteEvents = contractEvents.filter(event => typeof event.detail.route !== 'string' || event.detail.route.trim() === '');
if (wrongRouteEvents.length !== 0) failures.push(`${wrongRouteEvents.length} draw/audio events referenced a route other than ${settledRoute}`);
if (missingRouteEvents.length !== 0) failures.push(`${missingRouteEvents.length} draw/audio events omitted their frozen presentation route`);
if (beatEvents.some(event => typeof event.detail.cue !== 'string' || event.detail.cue.trim() === '')) failures.push('an oracle beat emitted without a cue name');
if (resultEvents[0]) {
  if (!['normal', 'win', 'loss'].includes(resultEvents[0].detail.resultKind)) failures.push(`result event had invalid resultKind ${resultEvents[0].detail.resultKind}`);
  if (resultEvents[0].detail.route !== settledRoute) failures.push(`result event route ${resultEvents[0].detail.route} did not match ${settledRoute}`);
}

// Hiding a tab pauses the route clock rather than letting stale callbacks
// reveal or overwrite a verdict off-screen. Showing it resumes the same token.
const visibilityListeners = documentListeners.get('visibilitychange') || [];
clickListeners[0]?.();
const beforeHide = debug.getState();
documentMock.hidden = true;
visibilityListeners.forEach(listener => listener());
await new Promise(resolve => setTimeout(resolve, 180));
const whileHidden = debug.getState();
if (visibilityListeners.length !== 1) failures.push(`visibility listener count was ${visibilityListeners.length}`);
if (whileHidden.phase !== beforeHide.phase) failures.push(`hidden draw advanced from ${beforeHide.phase} to ${whileHidden.phase}`);
if (whileHidden.resolvedDraws !== beforeHide.resolvedDraws) failures.push('hidden draw resolved an additional result');
documentMock.hidden = false;
visibilityListeners.forEach(listener => listener());
const afterResume = debug.getState();
if (afterResume.timerCount < 1) failures.push('visible draw did not resume its paused timers');
pagechangeListeners[0]?.({ detail: { page: 'home' } });
const afterVisibilityCancel = debug.getState();
if (afterVisibilityCancel.timerCount !== 0 || afterVisibilityCancel.busy || afterVisibilityCancel.phase !== '') failures.push('page change after visibility resume did not fully cancel the draw');

// The intentional three-tap ROYAL LOCK may keep its locked machine copy, but
// page-wide currents/bubbles must still stop after the short lock impact.
clickListeners[0]?.();
clickListeners[0]?.();
clickListeners[0]?.();
await new Promise(resolve => setTimeout(resolve, 500));
const afterRoyalLock = debug.getState();
if (!afterRoyalLock.locked || afterRoyalLock.phase !== 'locked') failures.push('three taps did not preserve the ROYAL LOCK state');
if (afterRoyalLock.busy) failures.push('ROYAL LOCK left a draw busy');
if (afterRoyalLock.timerCount !== 0) failures.push(`ROYAL LOCK left ${afterRoyalLock.timerCount} timers active`);
if (afterRoyalLock.environmentClassCount !== 0) failures.push(`ROYAL LOCK left ${afterRoyalLock.environmentClassCount} high-cost environment classes`);
pagechangeListeners[0]?.({ detail: { page: 'home' } });
const afterLockPageChange = debug.getState();
if (afterLockPageChange.locked || afterLockPageChange.phase !== '' || afterLockPageChange.timerCount !== 0) failures.push('page change did not release ROYAL LOCK');

console.log(JSON.stringify({ ...diagnostic, bagDiagnostic, presentationDiagnostic, cutinDiagnostic, clickListeners: clickListeners.length, pagechangeListeners: pagechangeListeners.length, visibilityListeners: visibilityListeners.length, resultCount, eventLifecycle:{ drawEvents:drawEvents.length, resultEvents:resultEvents.length, stopEvents:stopEvents.length, beatEvents:beatEvents.length, phaseEvents:phaseEvents.length, earlyLeaks:earlyLeaks.length, settledRoute }, clickLifecycle: { beforeClick, duringClick, afterPageChange, afterSettle, beforeHide, whileHidden, afterResume, afterVisibilityCancel, afterRoyalLock, afterLockPageChange }, failures }, null, 2));
if (failures.length) process.exitCode = 1;
