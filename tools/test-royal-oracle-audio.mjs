#!/usr/bin/env node

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_ROOT = path.join(ROOT, 'assets', 'audio', 'royal-oracle');
const source = fs.readFileSync(path.join(ROOT, 'roulette-audio.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(AUDIO_ROOT, 'manifest.json'), 'utf8'));
const readme = fs.readFileSync(path.join(AUDIO_ROOT, 'README.md'), 'utf8');
const expectedFiles = [
  'normal-underwater-spin.wav', 'crown-goal.wav', 'naoking-race.wav',
  'power-cut.wav', 'distant-signal.wav', 'restart-surge.wav',
  'revival-rise.wav', 'jackpot-burst.wav', 'premium-crown.wav'
];

assert.equal(manifest.assets.length, expectedFiles.length, 'manifest must list every original sound');
assert.deepEqual(manifest.assets.map(asset => asset.file), expectedFiles, 'manifest order/content changed unexpectedly');
assert.match(manifest.source, /Original deterministic synthesis/i);
assert.match(readme, /no external recording/i);
assert.match(readme, /Third-party license: none/i);

const metrics = new Map();
const hashes = new Set();
for (const asset of manifest.assets) {
  const file = path.join(AUDIO_ROOT, asset.file);
  const data = fs.readFileSync(file);
  assert.ok(data.length > 32_000, `${asset.file} is empty or implausibly small`);
  assert.equal(data.toString('ascii', 0, 4), 'RIFF', `${asset.file} is not RIFF`);
  assert.equal(data.toString('ascii', 8, 12), 'WAVE', `${asset.file} is not WAVE`);
  assert.equal(data.readUInt16LE(20), 1, `${asset.file} must be PCM`);
  assert.equal(data.readUInt16LE(22), 1, `${asset.file} must be mono`);
  assert.equal(data.readUInt32LE(24), 24_000, `${asset.file} must be 24 kHz`);
  assert.equal(data.readUInt16LE(34), 16, `${asset.file} must be 16-bit`);
  const bytes = data.readUInt32LE(40);
  const duration = bytes / (24_000 * 2);
  assert.ok(Math.abs(duration - asset.durationSeconds) < .002, `${asset.file} duration differs from manifest`);

  const samples = new Int16Array(bytes / 2);
  let sumSquares = 0;
  let deltaSquares = 0;
  let peak = 0;
  let zeroCrossings = 0;
  let trailingEnergy = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const value = data.readInt16LE(44 + index * 2) / 32_768;
    samples[index] = Math.round(value * 32_767);
    sumSquares += value * value;
    peak = Math.max(peak, Math.abs(value));
    if (index > 0) {
      const previous = samples[index - 1] / 32_767;
      const delta = value - previous;
      deltaSquares += delta * delta;
      if ((value >= 0) !== (previous >= 0)) zeroCrossings += 1;
    }
    if (index >= samples.length - 2_400) trailingEnergy += value * value;
  }
  const rms = Math.sqrt(sumSquares / samples.length);
  const deltaRms = Math.sqrt(deltaSquares / Math.max(1, samples.length - 1));
  const crossingRate = zeroCrossings / samples.length;
  const trailingRms = Math.sqrt(trailingEnergy / 2_400);
  assert.ok(rms > .015, `${asset.file} is effectively silent`);
  assert.ok(peak > (asset.file === 'distant-signal.wav' ? .12 : .28), `${asset.file} lacks a meaningful transient`);
  assert.ok(deltaRms > .002, `${asset.file} resembles an unchanging low drone`);
  assert.ok(crossingRate > .004, `${asset.file} lacks enough event detail`);
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  assert.ok(!hashes.has(hash), `${asset.file} duplicates another sound`);
  hashes.add(hash);
  metrics.set(asset.file, { duration, rms, peak, deltaRms, crossingRate, trailingRms, bytes:data.length });
}

assert.ok(metrics.get('normal-underwater-spin.wav').duration > 3.8, 'normal spin bed is too short');
assert.ok(metrics.get('power-cut.wav').duration < 1, 'power cut should be a short shutdown accent, not a drone');
assert.ok(metrics.get('power-cut.wav').trailingRms < .001, 'power cut must end in real digital silence');
assert.ok(metrics.get('distant-signal.wav').rms < metrics.get('jackpot-burst.wav').rms, 'distant signal must be quieter than jackpot');
assert.ok(metrics.get('jackpot-burst.wav').deltaRms > metrics.get('normal-underwater-spin.wav').deltaRms, 'jackpot must have more impact than normal spin');

for (const eventName of [
  'naoking:oracledraw', 'naoking:oraclephase', 'naoking:oraclebeat',
  'naoking:oraclestop', 'naoking:oracleresult', 'naoking:oraclecinematic'
]) {
  assert.match(source, new RegExp(eventName), `missing event compatibility: ${eventName}`);
}
for (const [scene, key] of Object.entries({ sports:'sports', race:'race', 'power-failure':'powerCut', 'jackpot-golden':'premium' })) {
  assert.ok(
    source.includes(`${scene}:'${key}'`) || source.includes(`'${scene}':'${key}'`),
    `missing scene mapping ${scene} -> ${key}`
  );
}
assert.match(source, /state\.blackoutStage\s*=\s*['"]silent['"]/);
assert.match(source, /setMaster\(0,\s*0\)/, 'blackout must set the dedicated asset bus to exact zero');
assert.match(source, /primaryHardStop\(\)/, 'blackout must also stop the existing site-wide audio engine');
assert.match(source, /source\.onended/, 'decoded media nodes require end cleanup');
assert.match(source, /visibilitychange/);
assert.match(source, /pagehide/);
assert.doesNotMatch(source, /setInterval\s*\(/, 'audio runtime must not leave a polling interval');

class FakeEventTarget {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, listener) {
    const list = this.listeners.get(type) || [];
    list.push(listener);
    this.listeners.set(type, list);
  }
  dispatchEvent(event) {
    event.target ||= this;
    for (const listener of [...(this.listeners.get(event.type) || [])]) listener.call(this, event);
    return true;
  }
}

class FakeParam {
  constructor(value = 0) { this.value = value; }
  cancelScheduledValues() {}
  setValueAtTime(value) { this.value = value; }
  linearRampToValueAtTime(value) { this.value = value; }
  exponentialRampToValueAtTime(value) { this.value = value; }
}

class FakeNode {
  constructor() {
    this.gain = new FakeParam(1);
    this.threshold = new FakeParam(0);
    this.knee = new FakeParam(0);
    this.ratio = new FakeParam(0);
    this.attack = new FakeParam(0);
    this.release = new FakeParam(0);
    this.playbackRate = new FakeParam(1);
    this.loop = false;
    this.onended = null;
  }
  connect() { return this; }
  disconnect() {}
  start() { this.started = true; }
  stop() { this.stopped = true; this.onended?.(); }
}

class FakeAudioContext {
  static instances = [];
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = new FakeNode();
    FakeAudioContext.instances.push(this);
  }
  createGain() { return new FakeNode(); }
  createDynamicsCompressor() { return new FakeNode(); }
  createBufferSource() { return new FakeNode(); }
  decodeAudioData() { return Promise.resolve({ duration:3 }); }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
}

class FakeCustomEvent {
  constructor(type, options = {}) { this.type = type; this.detail = options.detail; }
}

const windowTarget = new FakeEventTarget();
const documentTarget = new FakeEventTarget();
const pendingTimers = new Map();
let timerId = 1;
function fakeSetTimeout(callback, delay = 0) {
  const id = timerId++;
  pendingTimers.set(id, { callback, delay });
  return id;
}
function fakeClearTimeout(id) { pendingTimers.delete(id); }
function flushTimers(maxDelay = Infinity) {
  const due = [...pendingTimers.entries()].filter(([, timer]) => timer.delay <= maxDelay);
  due.forEach(([id]) => pendingTimers.delete(id));
  due.forEach(([, timer]) => timer.callback());
}

const primaryCalls = { stop:0, layers:[], cues:[] };
let primaryState = { enabled:false, unlocked:false, hidden:false, volume:.64, page:'fortune' };
const NaokingAudio = {
  snapshot:() => ({ ...primaryState }),
  stop:() => { primaryCalls.stop += 1; },
  stopLayer:layer => { primaryCalls.layers.push(layer); },
  cue:(name, options) => { primaryCalls.cues.push([name, options]); }
};
const currentScript = { src:'http://127.0.0.1:4173/roulette-audio.js?v=test' };
const document = Object.assign(documentTarget, {
  hidden:false,
  currentScript,
  body:{ dataset:{ page:'fortune' } }
});
const window = Object.assign(windowTarget, {
  AudioContext:FakeAudioContext,
  webkitAudioContext:FakeAudioContext,
  CustomEvent:FakeCustomEvent,
  NaokingAudio,
  setTimeout:fakeSetTimeout,
  clearTimeout:fakeClearTimeout
});
const sandbox = vm.createContext({
  window,
  document,
  location:{ href:'http://127.0.0.1:4173/', hostname:'127.0.0.1' },
  URL,
  fetch:async () => ({ ok:true, status:200, arrayBuffer:async () => new ArrayBuffer(64) }),
  CustomEvent:FakeCustomEvent,
  console,
  Math,
  Number,
  String,
  Boolean,
  Object,
  Array,
  Map,
  Set,
  Promise
});

vm.runInContext(source, sandbox, { filename:'roulette-audio.js' });
assert.ok(window.NaokingRoyalOracleAudio, 'public asset audio API was not created');
assert.equal(FakeAudioContext.instances.length, 0, 'asset AudioContext must wait for sound consent');

primaryState = { ...primaryState, enabled:true, unlocked:true };
window.dispatchEvent(new FakeCustomEvent('naoking:soundstate', { detail:primaryState }));
for (let index = 0; index < 5; index += 1) await Promise.resolve();
assert.equal(FakeAudioContext.instances.length, 1, 'sound consent should create one asset AudioContext');
await window.NaokingRoyalOracleAudio.preload();
assert.equal(window.NaokingRoyalOracleAudio.snapshot().loadedAssets, expectedFiles.length, 'all original assets should preload');

window.dispatchEvent(new FakeCustomEvent('naoking:oracledraw', { detail:{ route:'crown-goal-challenge' } }));
window.dispatchEvent(new FakeCustomEvent('naoking:oraclephase', { detail:{ phase:'descent', route:'crown-goal-challenge', tier:'hot' } }));
for (let index = 0; index < 4; index += 1) await Promise.resolve();
assert.ok(window.NaokingRoyalOracleAudio.snapshot().activeAssets.includes('spin'), 'descent must start the underwater spin asset');

window.dispatchEvent(new FakeCustomEvent('naoking:oraclebeat', { detail:{ cue:'sports-signal', scene:'sports', beat:'signal', intensity:.8 } }));
for (let index = 0; index < 4; index += 1) await Promise.resolve();
assert.ok(window.NaokingRoyalOracleAudio.snapshot().recentAssets.includes('sports'), 'sports scene did not play its goal asset');

window.dispatchEvent(new FakeCustomEvent('naoking:oraclebeat', { detail:{ cue:'race-signal', scene:'race', beat:'signal', intensity:.8 } }));
for (let index = 0; index < 4; index += 1) await Promise.resolve();
assert.ok(window.NaokingRoyalOracleAudio.snapshot().recentAssets.includes('race'), 'race scene did not play its race asset');

window.dispatchEvent(new FakeCustomEvent('naoking:oraclecinematic', { detail:{ action:'blackout', delayMs:650 } }));
for (let index = 0; index < 4; index += 1) await Promise.resolve();
assert.ok(window.NaokingRoyalOracleAudio.snapshot().recentAssets.includes('powerCut'), 'blackout must begin with the power-cut asset');
flushTimers(650);
let runtimeSnapshot = window.NaokingRoyalOracleAudio.snapshot();
assert.equal(runtimeSnapshot.blackoutStage, 'silent', 'blackout did not enter the real silence stage');
assert.equal(runtimeSnapshot.masterGain, 0, 'blackout asset bus is not exactly zero');
assert.equal(runtimeSnapshot.activeAssets.length, 0, 'blackout left a sample playing');
assert.ok(primaryCalls.stop >= 1, 'blackout did not stop the existing full-site audio engine');

window.dispatchEvent(new FakeCustomEvent('naoking:oraclecinematic', { detail:{ action:'distant-signal' } }));
for (let index = 0; index < 4; index += 1) await Promise.resolve();
assert.equal(window.NaokingRoyalOracleAudio.snapshot().blackoutStage, 'signal');
assert.ok(window.NaokingRoyalOracleAudio.snapshot().recentAssets.includes('distantSignal'));

window.dispatchEvent(new FakeCustomEvent('naoking:oraclecinematic', { detail:{ action:'restart' } }));
for (let index = 0; index < 4; index += 1) await Promise.resolve();
assert.equal(window.NaokingRoyalOracleAudio.snapshot().blackoutStage, '');
assert.ok(window.NaokingRoyalOracleAudio.snapshot().recentAssets.includes('restart'));

window.dispatchEvent(new FakeCustomEvent('naoking:oracleresult', { detail:{ resultKind:'win', effect:'rainbow', tier:'jackpot', route:'golden-ocean-jackpot' } }));
for (let index = 0; index < 4; index += 1) await Promise.resolve();
assert.ok(window.NaokingRoyalOracleAudio.snapshot().recentAssets.includes('jackpot'), 'premium result did not play jackpot asset');

window.dispatchEvent(new FakeCustomEvent('naoking:pagechange', { detail:{ page:'home' } }));
assert.equal(window.NaokingRoyalOracleAudio.snapshot().activeAssets.length, 0, 'page change left decoded audio nodes active');

console.log(JSON.stringify({
  status:'PASS',
  assets:expectedFiles.length,
  totalBytes:[...metrics.values()].reduce((sum, metric) => sum + metric.bytes, 0),
  totalDurationSeconds:[...metrics.values()].reduce((sum, metric) => sum + metric.duration, 0),
  scenes:Object.keys(window.NaokingRoyalOracleAudio.scenes).length,
  runtime:window.NaokingRoyalOracleAudio.snapshot(),
  metrics:Object.fromEntries(metrics)
}, null, 2));
