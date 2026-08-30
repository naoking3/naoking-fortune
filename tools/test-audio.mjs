import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'kingdom-audio.js'), 'utf8');

new vm.Script(source, { filename: 'kingdom-audio.js' });

const requiredLayers = ['ambient', 'reel', 'signal', 'tension', 'event', 'result', 'game', 'opening', 'transition'];
const requiredEvents = [
  'naoking:pagechange', 'naoking:oraclephase', 'naoking:oraclestop', 'naoking:oracleresult',
  'naoking:oraclebeat', 'naoking:gameaudio', 'naoking:opening', 'naoking:transition', 'naoking:audio'
];
const gameCues = [
  'start', 'retry', 'pickup', 'rare-pickup', 'crown', 'oxygen-warning', 'pattern-warning',
  'current-warning', 'near-miss', 'shield-hit', 'damage', 'death', 'clear', 'game-over', 'exit'
];
const eventSceneCues = [
  'battle-signal','battle-twist','sports-signal','sports-twist','court-signal','court-twist',
  'news-signal','news-twist','commercial-signal','commercial-twist','repair-signal','repair-twist',
  'abandon-signal','abandon-twist','chase-signal','chase-twist','lunch-signal','lunch-twist',
  'gravity-signal','gravity-twist','giant-signal','giant-twist','pixel-signal','pixel-twist'
];

requiredLayers.forEach(layer => assert.match(source, new RegExp(`['"]${layer}['"]`), `missing audio layer: ${layer}`));
requiredEvents.forEach(eventName => assert.match(source, new RegExp(eventName), `missing integration event: ${eventName}`));
gameCues.forEach(cue => assert.match(source, new RegExp(`['"]${cue}['"]`), `missing game cue: ${cue}`));
eventSceneCues.forEach(cue => {
  const [scene, phase] = cue.split('-');
  assert.match(source, new RegExp(`['"]${scene}['"]`), `missing event sound scene: ${scene}`);
  assert.match(source, new RegExp(`['"]${phase}['"]`), `missing event sound phase: ${phase}`);
});
assert.match(source, /pixel-palace-bonus/, 'premium route sound classification is missing pixel palace');
assert.doesNotMatch(source, /new\s+Audio\s*\(|\.mp3\b|\.wav\b|\.ogg\b|fetch\s*\(/i, 'audio must remain procedural and asset-free');
assert.match(source, /visibilitychange/);
assert.match(source, /pagehide/);
assert.match(source, /localStorage/);
assert.match(source, /userActivation/);
assert.match(source, /webkitAudioContext/);

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
  contains(value) { return this.values.has(value); }
  add(...values) { values.forEach(value => this.values.add(value)); }
  remove(...values) { values.forEach(value => this.values.delete(value)); }
}

class FakeElement extends FakeEventTarget {
  constructor(tagName, registry) {
    super();
    this.tagName = tagName.toUpperCase();
    this.registry = registry;
    this.children = [];
    this.dataset = {};
    this.classList = new FakeClassList();
    this.style = { setProperty() {}, removeProperty() {} };
    this.attributes = new Map();
    this.value = '';
    this.disabled = false;
    this.textContent = '';
    this.innerHTML = '';
  }
  set id(value) { this._id = value; if (value) this.registry.set(value, this); }
  get id() { return this._id || ''; }
  set className(value) { this._className = value; this.classList.values = new Set(String(value).split(/\s+/).filter(Boolean)); }
  get className() { return this._className || ''; }
  append(...children) { this.children.push(...children); children.forEach(child => { child.parentElement = this; }); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
  querySelector(selector) {
    if (selector.startsWith('.')) {
      const className = selector.slice(1);
      return this.walk().find(item => item.classList?.contains(className)) || null;
    }
    if (selector.startsWith('#')) return this.registry.get(selector.slice(1)) || null;
    return null;
  }
  *walk() { for (const child of this.children) { yield child; yield* child.walk(); } }
  matches(selector) {
    if (selector === '[data-tab]') return Object.hasOwn(this.dataset, 'tab');
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    return false;
  }
  closest(selector) {
    if (selector === '#kingdom-sound-control') {
      let current = this;
      while (current) { if (current.id === 'kingdom-sound-control') return current; current = current.parentElement; }
      return null;
    }
    return this.matches(selector) ? this : null;
  }
}

class FakeParam {
  constructor(value = 0) { this.value = value; }
  setValueAtTime(value) { this.value = value; }
  exponentialRampToValueAtTime(value) { this.value = value; }
  linearRampToValueAtTime(value) { this.value = value; }
  setTargetAtTime(value) { this.value = value; }
  cancelScheduledValues() {}
}

class FakeNode {
  constructor() {
    this.gain = new FakeParam(1);
    this.frequency = new FakeParam(440);
    this.detune = new FakeParam(0);
    this.pan = new FakeParam(0);
    this.Q = new FakeParam(0);
    this.threshold = new FakeParam(0);
    this.knee = new FakeParam(0);
    this.ratio = new FakeParam(0);
    this.attack = new FakeParam(0);
    this.release = new FakeParam(0);
  }
  connect() { return this; }
  disconnect() {}
  start() {}
  stop() {}
}

class FakeAudioContext {
  static instances = [];
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.sampleRate = 4000;
    this.destination = new FakeNode();
    FakeAudioContext.instances.push(this);
  }
  createGain() { return new FakeNode(); }
  createDynamicsCompressor() { return new FakeNode(); }
  createOscillator() { return new FakeNode(); }
  createBufferSource() { const node = new FakeNode(); node.loop = false; return node; }
  createBiquadFilter() { const node = new FakeNode(); node.type = 'lowpass'; return node; }
  createStereoPanner() { return new FakeNode(); }
  createBuffer(_channels, length) {
    const data = new Float32Array(length);
    return { getChannelData: () => data };
  }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
}

const registry = new Map();
const documentTarget = new FakeEventTarget();
const document = Object.assign(documentTarget, {
  readyState: 'complete',
  hidden: false,
  body: new FakeElement('body', registry),
  head: new FakeElement('head', registry),
  createElement: tagName => new FakeElement(tagName, registry),
  getElementById: id => registry.get(id) || null,
  querySelector: selector => selector.startsWith('#') ? registry.get(selector.slice(1)) || null : null
});
document.body.dataset.page = 'home';

const windowTarget = new FakeEventTarget();
let nextTimer = 1;
const pendingTimers = new Map();
function fakeSetTimeout(callback, delay = 0) {
  const id = nextTimer++;
  pendingTimers.set(id, { callback, delay });
  return id;
}
function fakeClearTimeout(id) { pendingTimers.delete(id); }
function flushTimers() {
  const batch = [...pendingTimers.entries()];
  pendingTimers.clear();
  batch.forEach(([, timer]) => timer.callback());
}

const storage = new Map();
const localStorage = {
  getItem: key => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value))
};
class FakeCustomEvent {
  constructor(type, init = {}) { this.type = type; this.detail = init.detail; }
}

const window = Object.assign(windowTarget, {
  AudioContext: FakeAudioContext,
  webkitAudioContext: FakeAudioContext,
  CustomEvent: FakeCustomEvent,
  setTimeout: fakeSetTimeout,
  clearTimeout: fakeClearTimeout
});

const sandbox = vm.createContext({
  window,
  document,
  localStorage,
  navigator: { userActivation: { isActive: true } },
  location: { hostname: 'localhost', hash: '' },
  CustomEvent: FakeCustomEvent,
  Element: FakeElement,
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

vm.runInContext(source, sandbox, { filename: 'kingdom-audio.js' });
assert.equal(FakeAudioContext.instances.length, 0, 'AudioContext must not be created without a user gesture');
assert.equal(window.NaokingAudio.enabled, false, 'first visit must start muted');
assert.equal(window.NaokingAudio.volume, 0.64, 'missing storage must use the intended default volume');

const soundControl = registry.get('kingdom-sound-control');
assert.ok(soundControl, 'sound control should be created by the standalone script');
const soundToggle = soundControl.children[0];
soundToggle.dispatchEvent({ type: 'click', isTrusted: true, target: soundToggle });
await Promise.resolve(); await Promise.resolve();
assert.equal(FakeAudioContext.instances.length, 1, 'one trusted toggle click should create exactly one AudioContext');
assert.equal(window.NaokingAudio.enabled, true);
assert.equal(window.NaokingAudio.unlocked, true);
assert.equal(storage.get('naoking-kingdom-sound-enabled-v1'), '1');

window.dispatchEvent(new FakeCustomEvent('naoking:oraclephase', {
  detail: { phase: 'descent', tier: 'hot', route: 'royal-intrusion', family: 'intrusion', resultKind: 'win' }
}));
assert.ok(window.NaokingAudio.snapshot().voicesByLayer.reel >= 1, 'oracle descent should start the reel layer');

for (let index = 0; index < 5; index += 1) {
  window.dispatchEvent(new FakeCustomEvent('naoking:oraclestop', { detail: { index, total: 5, final: index === 4 } }));
}
assert.equal(window.NaokingAudio.snapshot().stopCount, 5, 'five stop events must produce a complete five-witness stop count');

window.dispatchEvent(new FakeCustomEvent('naoking:oraclebeat', { detail: { cue: 'abyssal-blackout', intensity: 0.18 } }));
assert.equal(window.NaokingAudio.snapshot().silenceActive, true, 'abyssal blackout must silence the entire oracle scene');
window.dispatchEvent(new FakeCustomEvent('naoking:oraclebeat', { detail: { cue: 'abyssal-distant-signal', intensity: 0.22 } }));
window.dispatchEvent(new FakeCustomEvent('naoking:oraclebeat', { detail: { cue: 'abyssal-reboot', intensity: 1 } }));
assert.equal(window.NaokingAudio.snapshot().silenceActive, false, 'abyssal reboot must release the blackout silence');

for (const sceneCue of eventSceneCues) {
  window.dispatchEvent(new FakeCustomEvent('naoking:oraclebeat', { detail: { cue: sceneCue, intensity: 0.7 } }));
}
assert.ok(window.NaokingAudio.snapshot().voicesByLayer.event > 0, 'event-specific sound scenes did not create procedural voices');
window.dispatchEvent(new FakeCustomEvent('naoking:oraclebeat', { detail: { cue: 'abyssal-reboot', intensity: 1 } }));
assert.equal(window.NaokingAudio.snapshot().silenceActive, false, 'event-scene silence did not release for the next scene');

window.dispatchEvent(new FakeCustomEvent('naoking:gameaudio', { detail: { cue: 'start', intensity: 0.6 } }));
for (let index = 0; index < 10; index += 1) {
  window.dispatchEvent(new FakeCustomEvent('naoking:gameaudio', { detail: { cue: 'retry', intensity: 0.6 } }));
}
assert.ok(window.NaokingAudio.snapshot().stats.dropped > 0, 'rapid retry cues should be rate-limited');

window.dispatchEvent(new FakeCustomEvent('naoking:pagechange', { detail: { page: 'videos' } }));
let pageSnapshot = window.NaokingAudio.snapshot();
assert.equal(pageSnapshot.voicesByLayer.reel, 0, 'page change must release reel audio');
assert.equal(pageSnapshot.voicesByLayer.game, 0, 'page change must release game audio');

window.dispatchEvent(new FakeCustomEvent('naoking:oraclephase', { detail: { phase: 'resting', tier: 'jackpot', resultKind: 'win' } }));
window.dispatchEvent(new FakeCustomEvent('naoking:oraclephase', { detail: { phase: 'descent', tier: 'normal', route: 'quiet-tide' } }));
assert.equal(window.NaokingAudio.snapshot().oracle.resultKind, '', 'a new descent must not retain the previous result kind');
window.NaokingAudio.stop();
window.dispatchEvent(new FakeCustomEvent('naoking:oraclephase', { detail: { phase: 'revealed', tier: 'jackpot', resultKind: 'win' } }));
assert.equal(window.NaokingAudio.snapshot().voicesByLayer.result, 0, 'phase reveal alone must not choose a result sound');
window.dispatchEvent(new FakeCustomEvent('naoking:oracleresult', { detail: { resultKind: 'win', effect: 'rainbow', tier: 'jackpot' } }));
assert.ok(window.NaokingAudio.snapshot().voicesByLayer.result > 0, 'only explicit oracle result data should choose the result sound');

window.NaokingAudio.disable({ immediate: true });
assert.equal(window.NaokingAudio.snapshot().activeVoices, 0, 'immediate SOUND OFF must release every voice');
const cueCountWhileOff = window.NaokingAudio.snapshot().stats.cues;
window.dispatchEvent(new FakeCustomEvent('naoking:oraclephase', { detail: { phase: 'descent', tier: 'jackpot' } }));
window.dispatchEvent(new FakeCustomEvent('naoking:gameaudio', { detail: { cue: 'start' } }));
assert.equal(window.NaokingAudio.snapshot().stats.cues, cueCountWhileOff, 'SOUND OFF must not schedule cues');

await window.NaokingAudio.enable({ gesture: true });
document.hidden = true;
document.dispatchEvent({ type: 'visibilitychange', target: document });
await Promise.resolve();
assert.equal(window.NaokingAudio.snapshot().activeVoices, 0, 'hidden page must release active voices');
assert.equal(FakeAudioContext.instances[0].state, 'suspended', 'hidden page must suspend the AudioContext');

document.hidden = false;
document.dispatchEvent({ type: 'visibilitychange', target: document });
await Promise.resolve(); await Promise.resolve();
assert.equal(FakeAudioContext.instances[0].state, 'running', 'visible page may resume an already user-unlocked context');
assert.ok(window.NaokingAudio.snapshot().voicesByLayer.ambient >= 1, 'ambient layer should resume after visibility returns');

window.NaokingAudio.stop();
flushTimers();
assert.equal(window.NaokingAudio.snapshot().activeVoices, 0, 'final stop must leave no active voice');

console.log(JSON.stringify({
  status: 'PASS',
  layers: requiredLayers.length,
  events: requiredEvents.length,
  gameCues: gameCues.length,
  eventSceneCues: eventSceneCues.length,
  contextsCreated: FakeAudioContext.instances.length,
  final: window.NaokingAudio.snapshot()
}, null, 2));
