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
  setAttribute(name, value) { this[name] = String(value); }
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
const windowMock = {
  setTimeout,
  clearTimeout,
  // Keep lifecycle coverage fast while preserving every scheduled phase.
  matchMedia: () => ({ matches: true }),
  addEventListener(type, listener) {
    const listeners = windowListeners.get(type) || [];
    listeners.push(listener);
    windowListeners.set(type, listeners);
  }
};
const documentMock = {
  hidden: false,
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
if (presentationDiagnostic.routeDefinitions !== 32) failures.push(`presentation route count was ${presentationDiagnostic.routeDefinitions}`);
if (presentationDiagnostic.missingRoutes.length !== 0) failures.push(`uncovered presentation routes: ${presentationDiagnostic.missingRoutes.join(', ')}`);
if (presentationDiagnostic.immediateRouteRepeat !== 0) failures.push(`presentation immediately repeated ${presentationDiagnostic.immediateRouteRepeat} times`);
if (presentationDiagnostic.incompatibleRoutes !== 0) failures.push(`${presentationDiagnostic.incompatibleRoutes} incompatible presentation routes`);
if (presentationDiagnostic.resultPresentationContradictions !== 0) failures.push(`${presentationDiagnostic.resultPresentationContradictions} result/presentation contradictions`);
if (presentationDiagnostic.nonFrozenPresentations !== 0) failures.push(`${presentationDiagnostic.nonFrozenPresentations} presentation objects were mutable`);
if (presentationDiagnostic.normalRouteCount !== 10) failures.push(`only ${presentationDiagnostic.normalRouteCount} of 10 normal routes appeared`);
if (presentationDiagnostic.largestRouteShare > 0.15) failures.push(`largest presentation share was ${presentationDiagnostic.largestRouteShare}`);
if (presentationDiagnostic.minEstimatedRotations < 10) failures.push(`minimum estimated rotations was ${presentationDiagnostic.minEstimatedRotations}`);

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

// Let a reduced-motion draw fully settle. The result remains visible while all
// page-wide route classes and cancellable timers must be gone.
clickListeners[0]?.();
await new Promise(resolve => setTimeout(resolve, 1400));
const afterSettle = debug.getState();
if (afterSettle.busy) failures.push('settled draw remained busy');
if (afterSettle.timerCount !== 0) failures.push(`settled draw left ${afterSettle.timerCount} timers active`);
if (afterSettle.phase !== 'resting') failures.push(`settled draw phase was ${afterSettle.phase}`);
if (afterSettle.environmentClassCount !== 0) failures.push(`settled draw left ${afterSettle.environmentClassCount} high-cost environment classes`);

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

console.log(JSON.stringify({ ...diagnostic, bagDiagnostic, presentationDiagnostic, clickListeners: clickListeners.length, pagechangeListeners: pagechangeListeners.length, visibilityListeners: visibilityListeners.length, resultCount, clickLifecycle: { beforeClick, duringClick, afterPageChange, afterSettle, beforeHide, whileHidden, afterResume, afterVisibilityCancel }, failures }, null, 2));
if (failures.length) process.exitCode = 1;
