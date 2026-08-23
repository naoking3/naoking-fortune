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
  }
  append(...children) { this.children.push(...children); }
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
  ['#spin', new Element()], ['#blast', new Element()], ['#fortune-history', new Element()]
]);
const windowListeners = new Map();
const windowMock = {
  setTimeout,
  clearTimeout,
  addEventListener(type, listener) {
    const listeners = windowListeners.get(type) || [];
    listeners.push(listener);
    windowListeners.set(type, listeners);
  }
};
const context = {
  window: windowMock,
  document: {
    querySelector: selector => selectors.get(selector) || null,
    createElement: () => new Element()
  },
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
const clickListeners = selectors.get('#spin').listeners.get('click') || [];
const pagechangeListeners = windowListeners.get('naoking:pagechange') || [];
const resultCount = Object.keys(diagnostic.byResult).length;
const failures = [];

if (clickListeners.length !== 1) failures.push(`spin listener count was ${clickListeners.length}`);
if (pagechangeListeners.length !== 1) failures.push(`pagechange listener count was ${pagechangeListeners.length}`);
if (diagnostic.repeatedNormal !== 0) failures.push(`normal result repeated ${diagnostic.repeatedNormal} times`);
if (diagnostic.immediateMessageRepeat !== 0) failures.push(`message repeated ${diagnostic.immediateMessageRepeat} times`);
if (resultCount !== 20) failures.push(`only ${resultCount} of 20 result definitions appeared`);
if (diagnostic.rates.loss < 0.07 || diagnostic.rates.loss > 0.11) failures.push(`loss rate ${diagnostic.rates.loss}`);
if (diagnostic.rates.normal < 0.61 || diagnostic.rates.normal > 0.72) failures.push(`normal rate ${diagnostic.rates.normal}`);
if (diagnostic.rates.win < 0.18 || diagnostic.rates.win > 0.29) failures.push(`win rate ${diagnostic.rates.win}`);

console.log(JSON.stringify({ ...diagnostic, clickListeners: clickListeners.length, pagechangeListeners: pagechangeListeners.length, resultCount, failures }, null, 2));
if (failures.length) process.exitCode = 1;
