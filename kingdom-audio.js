(() => {
  'use strict';

  if (window.NaokingAudio) return;

  const VERSION = '1.0.0';
  const STORAGE_ENABLED = 'naoking-kingdom-sound-enabled-v1';
  const STORAGE_VOLUME = 'naoking-kingdom-sound-volume-v1';
  const DEFAULT_VOLUME = 0.64;
  const LAYERS = Object.freeze([
    'ambient', 'reel', 'signal', 'tension', 'event', 'result', 'game', 'opening', 'transition'
  ]);
  const LAYER_LEVELS = Object.freeze({
    ambient: 0.34,
    reel: 0.48,
    signal: 0.58,
    tension: 0.42,
    event: 0.62,
    result: 0.72,
    game: 0.52,
    opening: 0.55,
    transition: 0.46
  });
  const ORACLE_LAYERS = Object.freeze(['reel', 'signal', 'tension', 'event']);
  const PREMIUM_ROUTES = new Set(['royal-audience', 'golden-tide', 'secret-4810', 'palace-open']);

  const state = {
    enabled: readStoredBoolean(STORAGE_ENABLED, false),
    volume: readStoredNumber(STORAGE_VOLUME, DEFAULT_VOLUME, 0, 1),
    unlocked: false,
    hidden: Boolean(document.hidden),
    page: document.body?.dataset?.page || location.hash.slice(1) || 'home',
    oracle: { phase: 'resting', tier: 'normal', route: '', family: '', resultKind: '' },
    silenceUntil: 0,
    stopCount: 0
  };

  let context = null;
  let masterGain = null;
  let sceneGain = null;
  let compressor = null;
  let noiseBuffer = null;
  let ambientVoice = null;
  let reelVoice = null;
  let gameVoice = null;
  let silenceTimer = 0;
  let disableTimer = 0;
  let control = null;
  let toggleButton = null;
  let volumeControl = null;
  const layerGains = new Map();
  const voices = new Set();
  const layerVoices = new Map(LAYERS.map(layer => [layer, new Set()]));
  const timers = new Set();
  const cueTimes = new Map();
  const stats = { cues: 0, dropped: 0, unlocks: 0, suspends: 0, resumes: 0, stops: 0 };

  function readStoredBoolean(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value === '1';
    } catch {
      return fallback;
    }
  }

  function readStoredNumber(key, fallback, minimum, maximum) {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return fallback;
      const value = Number(stored);
      return Number.isFinite(value) ? Math.max(minimum, Math.min(maximum, value)) : fallback;
    } catch {
      return fallback;
    }
  }

  function store(key, value) {
    try { localStorage.setItem(key, String(value)); } catch { /* Private browsing fallback. */ }
  }

  function clamp(value, minimum = 0, maximum = 1) {
    return Math.max(minimum, Math.min(maximum, Number(value) || 0));
  }

  function now() {
    return context?.currentTime || 0;
  }

  function isOpeningActive() {
    const opening = document.querySelector?.('#opening');
    return Boolean(opening && !opening.classList.contains('is-finished'));
  }

  function hasUserActivation(explicitGesture = false) {
    if (explicitGesture) return true;
    return Boolean(navigator.userActivation?.isActive);
  }

  function canPlay() {
    return Boolean(state.enabled && state.unlocked && context && context.state === 'running' && !state.hidden);
  }

  function createMixer() {
    if (context) return context;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    try { context = new AudioContextClass({ latencyHint: 'interactive' }); }
    catch { context = new AudioContextClass(); }
    masterGain = context.createGain();
    sceneGain = context.createGain();
    compressor = typeof context.createDynamicsCompressor === 'function'
      ? context.createDynamicsCompressor()
      : context.createGain();

    masterGain.gain.value = state.volume;
    sceneGain.gain.value = 1;
    if (compressor.threshold) {
      compressor.threshold.value = -18;
      compressor.knee.value = 16;
      compressor.ratio.value = 8;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.24;
    }

    sceneGain.connect(masterGain);
    masterGain.connect(compressor);
    compressor.connect(context.destination);

    LAYERS.forEach(layer => {
      const gain = context.createGain();
      gain.gain.value = LAYER_LEVELS[layer];
      gain.connect(sceneGain);
      layerGains.set(layer, gain);
    });
    return context;
  }

  function silentUnlockPulse() {
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.00001, now());
    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(now());
    oscillator.stop(now() + 0.012);
    oscillator.onended = () => {
      try { oscillator.disconnect(); gain.disconnect(); } catch { /* Already disconnected. */ }
    };
  }

  async function unlock({ gesture = false, force = false } = {}) {
    if (!state.enabled || state.hidden) return false;
    if (!context && !force && !hasUserActivation(gesture)) return false;
    const audioContext = createMixer();
    if (!audioContext) return false;
    try {
      if (audioContext.state !== 'running') await audioContext.resume();
      state.unlocked = audioContext.state === 'running';
      if (!state.unlocked) return false;
      stats.unlocks += 1;
      const stamp = now();
      masterGain.gain.cancelScheduledValues(stamp);
      masterGain.gain.setValueAtTime(state.volume, stamp);
      silentUnlockPulse();
      updateControl();
      if (isOpeningActive()) playOpening({ resumed: true });
      else startAmbient(state.page);
      emitState();
      return true;
    } catch {
      state.unlocked = false;
      updateControl();
      return false;
    }
  }

  function makeVoice(layer = 'event') {
    if (!canPlay() || !layerGains.has(layer)) return null;
    const output = context.createGain();
    output.gain.value = 1;
    output.connect(layerGains.get(layer));
    const entry = {
      layer,
      output,
      nodes: new Set([output]),
      sources: new Set(),
      cleaned: false,
      persistent: false,
      addNode(node) { this.nodes.add(node); return node; },
      addSource(source) {
        this.sources.add(source);
        this.nodes.add(source);
        source.onended = () => {
          this.sources.delete(source);
          if (!this.persistent && this.sources.size === 0) this.cleanup();
        };
        return source;
      },
      stop(when = 0) {
        if (this.cleaned) return;
        const stopAt = now() + Math.max(0, when);
        this.sources.forEach(source => {
          try { source.stop(stopAt); } catch { /* Source already stopped. */ }
        });
        this.cleanup();
      },
      cleanup() {
        if (this.cleaned) return;
        this.cleaned = true;
        this.nodes.forEach(node => { try { node.disconnect(); } catch { /* Already disconnected. */ } });
        this.nodes.clear();
        this.sources.clear();
        voices.delete(this);
        layerVoices.get(this.layer)?.delete(this);
        if (ambientVoice === this) ambientVoice = null;
        if (reelVoice === this) reelVoice = null;
        if (gameVoice === this) gameVoice = null;
      }
    };
    voices.add(entry);
    layerVoices.get(layer)?.add(entry);
    return entry;
  }

  function scheduleTimer(callback, delay, group = 'general') {
    const timer = { id: 0, group };
    timer.id = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, Math.max(0, delay));
    timers.add(timer);
    return timer;
  }

  function clearTimers(group = '') {
    Array.from(timers).forEach(timer => {
      if (group && timer.group !== group) return;
      window.clearTimeout(timer.id);
      timers.delete(timer);
    });
  }

  function stopLayer(layer) {
    Array.from(layerVoices.get(layer) || []).forEach(voice => voice.stop());
  }

  function stopOracleScene({ includeResult = false } = {}) {
    ORACLE_LAYERS.forEach(stopLayer);
    if (includeResult) stopLayer('result');
    clearTimers('oracle');
  }

  function stopAll({ keepTransition = false } = {}) {
    Array.from(voices).forEach(voice => {
      if (keepTransition && voice.layer === 'transition') return;
      voice.stop();
    });
    clearTimers();
    clearSilence(true);
    stats.stops += 1;
  }

  function allowCue(key, minimumGap = 45) {
    const stamp = Date.now();
    const previous = cueTimes.get(key) || 0;
    if (stamp - previous < minimumGap) {
      stats.dropped += 1;
      return false;
    }
    cueTimes.set(key, stamp);
    stats.cues += 1;
    return true;
  }

  function connectWithPan(node, voice, pan = 0) {
    if (typeof context.createStereoPanner !== 'function') {
      node.connect(voice.output);
      return;
    }
    const panner = voice.addNode(context.createStereoPanner());
    panner.pan.value = clamp(pan, -1, 1);
    node.connect(panner);
    panner.connect(voice.output);
  }

  function tone({
    layer = 'signal', frequency = 440, endFrequency = frequency, type = 'sine', duration = 0.2,
    attack = 0.008, release = 0.12, gain = 0.18, delay = 0, detune = 0, pan = 0
  } = {}) {
    const voice = makeVoice(layer);
    if (!voice) return null;
    const start = now() + Math.max(0, delay);
    const end = start + Math.max(0.025, duration);
    const oscillator = voice.addSource(context.createOscillator());
    oscillator.type = type;
    oscillator.detune.value = detune;
    oscillator.frequency.setValueAtTime(Math.max(18, frequency), start);
    if (endFrequency !== frequency) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(18, endFrequency), end);
    }
    voice.output.gain.setValueAtTime(0.0001, start);
    voice.output.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + Math.max(0.004, attack));
    voice.output.gain.setValueAtTime(Math.max(0.0002, gain), Math.max(start + attack, end - release));
    voice.output.gain.exponentialRampToValueAtTime(0.0001, end);
    connectWithPan(oscillator, voice, pan);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
    return voice;
  }

  function getNoiseBuffer() {
    if (noiseBuffer || !context) return noiseBuffer;
    const length = Math.max(1, Math.floor(context.sampleRate * 2));
    noiseBuffer = context.createBuffer(1, length, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let index = 0; index < length; index += 1) {
      const white = Math.random() * 2 - 1;
      last = last * 0.72 + white * 0.28;
      data[index] = last;
    }
    return noiseBuffer;
  }

  function noise({
    layer = 'event', duration = 0.3, gain = 0.13, delay = 0, filterType = 'bandpass',
    frequency = 900, endFrequency = frequency, q = 0.7, pan = 0, loop = false
  } = {}) {
    const voice = makeVoice(layer);
    if (!voice) return null;
    const start = now() + Math.max(0, delay);
    const end = start + Math.max(0.035, duration);
    const source = voice.addSource(context.createBufferSource());
    const filter = voice.addNode(context.createBiquadFilter());
    source.buffer = getNoiseBuffer();
    source.loop = Boolean(loop || duration > 1.9);
    filter.type = filterType;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(Math.max(25, frequency), start);
    if (endFrequency !== frequency) filter.frequency.exponentialRampToValueAtTime(Math.max(25, endFrequency), end);
    voice.output.gain.setValueAtTime(0.0001, start);
    voice.output.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + Math.min(0.08, duration * 0.2));
    voice.output.gain.exponentialRampToValueAtTime(0.0001, end);
    source.connect(filter);
    connectWithPan(filter, voice, pan);
    source.start(start, Math.random() * 0.8);
    source.stop(end + 0.02);
    return voice;
  }

  function chord(frequencies, options = {}) {
    const spread = options.spread ?? 0.035;
    return frequencies.map((frequency, index) => tone({
      ...options,
      frequency,
      endFrequency: options.endRatio ? frequency * options.endRatio : (options.endFrequency || frequency),
      delay: (options.delay || 0) + index * spread,
      pan: options.pan ?? ((index - (frequencies.length - 1) / 2) * 0.22)
    }));
  }

  function uiTick(strength = 0.45) {
    if (!allowCue('ui', 70)) return;
    tone({ layer: 'signal', frequency: 670, endFrequency: 820, duration: 0.07, gain: 0.08 * strength, release: 0.045 });
  }

  function waterWhoosh(direction = 'dive', intensity = 0.55, layer = 'transition') {
    const dive = direction !== 'surface';
    noise({ layer, duration: 0.72, gain: 0.19 * intensity, filterType: 'bandpass', frequency: dive ? 1500 : 380, endFrequency: dive ? 260 : 1550, q: 0.56 });
    tone({ layer, frequency: dive ? 150 : 82, endFrequency: dive ? 58 : 188, duration: 0.68, type: 'sine', gain: 0.13 * intensity, attack: 0.035, release: 0.2 });
  }

  function bubble({ layer = 'ambient', delay = 0, pan = 0, size = 0.5 } = {}) {
    const start = 320 + (1 - size) * 260;
    tone({ layer, frequency: start, endFrequency: start * 2.3, duration: 0.09 + size * 0.09, gain: 0.04 + size * 0.045, delay, pan, attack: 0.006, release: 0.07 });
  }

  function lowPulse(intensity = 0.5, delay = 0, layer = 'tension') {
    tone({ layer, frequency: 82 + intensity * 18, endFrequency: 38 + intensity * 8, duration: 0.36 + intensity * 0.18, type: 'sine', gain: 0.14 * intensity, delay, attack: 0.018, release: 0.22 });
  }

  function royalBell(intensity = 0.6, delay = 0, layer = 'signal') {
    const base = 330 + intensity * 70;
    chord([base, base * 1.5, base * 2.02], {
      layer, duration: 1.15 + intensity * 0.55, gain: 0.075 * intensity, attack: 0.008,
      release: 0.8, delay, spread: 0.026
    });
  }

  function impact(intensity = 0.65, layer = 'event', delay = 0) {
    tone({ layer, frequency: 145 + intensity * 45, endFrequency: 34, duration: 0.48, gain: 0.24 * intensity, attack: 0.004, release: 0.34, delay });
    noise({ layer, duration: 0.18, gain: 0.14 * intensity, frequency: 1300, endFrequency: 180, q: 0.5, delay });
  }

  function sillyKing(intensity = 0.55) {
    tone({ layer: 'event', frequency: 270, endFrequency: 78, duration: 0.31, type: 'triangle', gain: 0.14 * intensity, release: 0.2 });
    tone({ layer: 'event', frequency: 510, endFrequency: 390, duration: 0.1, type: 'square', gain: 0.035 * intensity, delay: 0.19, release: 0.06 });
  }

  function glitch(intensity = 0.5) {
    [0, 0.055, 0.12].forEach((delay, index) => tone({
      layer: 'event', frequency: 180 + index * 310, endFrequency: 90 + index * 125,
      duration: 0.045, type: 'square', gain: 0.038 * intensity, delay, release: 0.025, pan: index - 1
    }));
  }

  function alarm(intensity = 0.6, layer = 'event') {
    [0, 0.28].forEach(delay => tone({ layer, frequency: 410, endFrequency: 360, duration: 0.18, type: 'sawtooth', gain: 0.075 * intensity, delay, release: 0.09 }));
  }

  function reelLaunch(intensity = 0.62) {
    if (!allowCue('reel:launch', 180)) return;
    noise({ layer: 'reel', duration: 0.42, gain: 0.16 * intensity, frequency: 210, endFrequency: 1600, q: 0.6 });
    tone({ layer: 'reel', frequency: 58, endFrequency: 230, duration: 0.36, type: 'sawtooth', gain: 0.085 * intensity, attack: 0.02, release: 0.12 });
    startReelLoop('launch', intensity);
  }

  function startReelLoop(mode = 'cruise', intensity = 0.55) {
    if (!canPlay()) return;
    if (reelVoice) reelVoice.stop();
    const voice = makeVoice('reel');
    if (!voice) return;
    voice.persistent = true;
    const base = mode === 'launch' ? 78 : mode === 'brake' ? 54 : 112;
    const oscillator = voice.addSource(context.createOscillator());
    const harmonic = voice.addSource(context.createOscillator());
    const filter = voice.addNode(context.createBiquadFilter());
    oscillator.type = 'sawtooth';
    harmonic.type = 'triangle';
    oscillator.frequency.value = base;
    harmonic.frequency.value = base * 2.04;
    filter.type = 'lowpass';
    filter.frequency.value = mode === 'brake' ? 430 : 920;
    filter.Q.value = 0.8;
    voice.output.gain.value = 0.035 + intensity * 0.024;
    oscillator.connect(filter);
    harmonic.connect(filter);
    filter.connect(voice.output);
    oscillator.start(); harmonic.start();
    reelVoice = voice;
  }

  function setReelMode(mode, intensity = 0.55) {
    if (!reelVoice || reelVoice.cleaned) {
      startReelLoop(mode, intensity);
      return;
    }
    const oscillators = Array.from(reelVoice.sources).filter(source => source.frequency);
    const target = mode === 'anticipation' ? 136 : mode === 'brake' ? 56 : mode === 'reverse' ? 168 : 112;
    oscillators.forEach((oscillator, index) => {
      oscillator.frequency.cancelScheduledValues(now());
      oscillator.frequency.exponentialRampToValueAtTime(target * (index ? 2.04 : 1), now() + 0.24);
    });
  }

  function reelStop(index = 0, total = 5, final = false) {
    const position = total > 1 ? index / (total - 1) : 1;
    if (!allowCue(`reel:stop:${index}`, 80)) return;
    tone({ layer: 'reel', frequency: 188 - position * 50, endFrequency: 68, duration: final ? 0.28 : 0.16, type: 'triangle', gain: final ? 0.18 : 0.105, attack: 0.004, release: final ? 0.2 : 0.1, pan: (position - 0.5) * 1.1 });
    noise({ layer: 'reel', duration: 0.065, gain: final ? 0.13 : 0.075, frequency: 950, endFrequency: 240, pan: (position - 0.5) * 1.1 });
    if (final && reelVoice) reelVoice.stop(0.05);
  }

  function startAmbient(page = 'home') {
    if (!canPlay() || state.hidden || isOpeningActive()) return false;
    if (ambientVoice) ambientVoice.stop();
    const voice = makeVoice('ambient');
    if (!voice) return false;
    voice.persistent = true;
    const depth = { home: 0.55, videos: 0.45, fortune: 0.68, game: 0.76, submit: 0.48, join: 0.42 }[page] || 0.5;
    const source = voice.addSource(context.createBufferSource());
    const filter = voice.addNode(context.createBiquadFilter());
    const hum = voice.addSource(context.createOscillator());
    const shimmer = voice.addSource(context.createOscillator());
    const shimmerGain = voice.addNode(context.createGain());
    source.buffer = getNoiseBuffer(); source.loop = true;
    filter.type = 'lowpass'; filter.frequency.value = 260 + (1 - depth) * 260; filter.Q.value = 0.55;
    hum.type = 'sine'; hum.frequency.value = 39 + depth * 13;
    shimmer.type = 'sine'; shimmer.frequency.value = 115 + (1 - depth) * 48;
    shimmerGain.gain.value = 0.11;
    voice.output.gain.value = 0.052;
    source.connect(filter); filter.connect(voice.output);
    hum.connect(voice.output); shimmer.connect(shimmerGain); shimmerGain.connect(voice.output);
    source.start(); hum.start(); shimmer.start();
    ambientVoice = voice;
    [0.15, 1.4, 3.1].forEach((delay, index) => bubble({ layer: 'ambient', delay, pan: index - 1, size: 0.25 + index * 0.17 }));
    return true;
  }

  function startGameLoop(intensity = 0.5) {
    if (!canPlay()) return;
    if (gameVoice) gameVoice.stop();
    const voice = makeVoice('game');
    if (!voice) return;
    voice.persistent = true;
    const hum = voice.addSource(context.createOscillator());
    const pulse = voice.addSource(context.createOscillator());
    const pulseGain = voice.addNode(context.createGain());
    const lfo = voice.addSource(context.createOscillator());
    const lfoGain = voice.addNode(context.createGain());
    hum.type = 'sine'; hum.frequency.value = 54;
    pulse.type = 'triangle'; pulse.frequency.value = 108;
    lfo.type = 'sine'; lfo.frequency.value = 1.65;
    lfoGain.gain.value = 0.025 * intensity;
    pulseGain.gain.value = 0.055;
    voice.output.gain.value = 0.045;
    hum.connect(voice.output); pulse.connect(pulseGain); pulseGain.connect(voice.output);
    lfo.connect(lfoGain); lfoGain.connect(pulseGain.gain);
    hum.start(); pulse.start(); lfo.start();
    gameVoice = voice;
  }

  function silence(duration = 650, { fade = 0.035, depth = 0 } = {}) {
    if (!canPlay() || !sceneGain) return false;
    window.clearTimeout(silenceTimer);
    const stamp = now();
    sceneGain.gain.cancelScheduledValues(stamp);
    sceneGain.gain.setValueAtTime(Math.max(0, sceneGain.gain.value), stamp);
    sceneGain.gain.linearRampToValueAtTime(clamp(depth), stamp + Math.max(0.008, fade));
    state.silenceUntil = Date.now() + duration;
    silenceTimer = window.setTimeout(() => clearSilence(false), Math.max(40, duration));
    return true;
  }

  function clearSilence(immediate = false) {
    window.clearTimeout(silenceTimer);
    silenceTimer = 0;
    state.silenceUntil = 0;
    if (!sceneGain || !context) return;
    const stamp = now();
    sceneGain.gain.cancelScheduledValues(stamp);
    sceneGain.gain.setValueAtTime(Math.max(0, sceneGain.gain.value), stamp);
    if (immediate) sceneGain.gain.setValueAtTime(1, stamp);
    else sceneGain.gain.linearRampToValueAtTime(1, stamp + 0.18);
  }

  function playOpening({ resumed = false } = {}) {
    if (!canPlay() || !isOpeningActive() || !allowCue('opening', 2800)) return false;
    stopLayer('opening');
    noise({ layer: 'opening', duration: 2.85, gain: 0.18, filterType: 'lowpass', frequency: 2300, endFrequency: 190, q: 0.55 });
    tone({ layer: 'opening', frequency: 164, endFrequency: 43, duration: 2.65, gain: 0.18, attack: 0.08, release: 0.48 });
    [0.28, 0.55, 0.92, 1.44].forEach((delay, index) => bubble({ layer: 'opening', delay, pan: index % 2 ? 0.6 : -0.5, size: 0.35 + index * 0.1 }));
    royalBell(0.55, resumed ? 1.45 : 2.1, 'opening');
    return true;
  }

  function playTransition(direction = document.body?.dataset?.travelDirection || 'dive') {
    if (!canPlay() || !allowCue(`transition:${direction}`, 260)) return false;
    stopLayer('transition');
    waterWhoosh(direction, 0.72, 'transition');
    bubble({ layer: 'transition', delay: 0.24, pan: direction === 'surface' ? -0.35 : 0.35, size: 0.42 });
    return true;
  }

  function tierIntensity(tier = 'normal') {
    return ({ normal: 0.28, signal: 0.42, hot: 0.62, superhot: 0.78, extreme: 0.92, jackpot: 1, 'fake-loss': 0.45, revival: 1 })[tier] || 0.46;
  }

  function routeVariation(route = '') {
    let hash = 0;
    for (let index = 0; index < route.length; index += 1) hash = (hash * 31 + route.charCodeAt(index)) >>> 0;
    return { pitch: 0.92 + (hash % 17) / 100, pan: ((hash % 19) - 9) / 18 };
  }

  function resultSound(detail = {}) {
    if (!allowCue('oracle:result', 260)) return false;
    stopLayer('reel');
    stopLayer('tension');
    clearSilence(false);
    const result = detail.result || {};
    const kind = detail.resultKind || detail.kind || result.kind || state.oracle.resultKind || 'normal';
    const effect = detail.effect || result.effect || '';
    const tier = detail.tier || state.oracle.tier || 'normal';
    if (kind === 'win') {
      const premium = tier === 'jackpot' || effect === 'rainbow' || PREMIUM_ROUTES.has(detail.route || state.oracle.route);
      impact(premium ? 1 : 0.78, 'result');
      chord(premium ? [196, 247, 294, 392, 494] : [220, 277, 330, 440], {
        layer: 'result', duration: premium ? 2.7 : 1.8, gain: premium ? 0.115 : 0.085,
        attack: 0.018, release: premium ? 1.7 : 1.1, delay: 0.08, spread: 0.075
      });
      if (premium) {
        noise({ layer: 'result', duration: 1.9, gain: 0.13, frequency: 180, endFrequency: 2600, q: 0.46, delay: 0.05 });
        [0.18, 0.42, 0.73, 1.08].forEach((delay, index) => royalBell(0.62 + index * 0.08, delay, 'result'));
      }
    } else if (kind === 'loss') {
      tone({ layer: 'result', frequency: 186, endFrequency: 54, duration: 0.85, type: 'triangle', gain: 0.13, release: 0.56 });
      noise({ layer: 'result', duration: 0.34, gain: 0.07, frequency: 760, endFrequency: 120 });
    } else {
      chord([294, 392], { layer: 'result', duration: 0.72, gain: 0.055, attack: 0.012, release: 0.45, spread: 0.06 });
    }
    return true;
  }

  function revivalSound(intensity = 1) {
    clearSilence(true);
    noise({ layer: 'event', duration: 1.25, gain: 0.14 * intensity, frequency: 130, endFrequency: 2300, q: 0.5 });
    chord([146, 196, 247, 330], { layer: 'result', duration: 1.65, gain: 0.085 * intensity, attack: 0.025, release: 0.9, spread: 0.11, endRatio: 1.24 });
    royalBell(0.78, 0.52, 'result');
  }

  function handleOraclePhase(event) {
    const detail = event?.detail || {};
    const phase = detail.phase || '';
    const earlyPhase = ['descent', 'cruise', 'signal', 'anomaly', 'judgment', 'verdict', 'fake', 'locked'].includes(phase);
    const explicitResultKind = typeof detail.resultKind === 'string' ? detail.resultKind : '';
    state.oracle = {
      phase, tier: detail.tier || 'normal', route: detail.route || '',
      family: detail.family || '', resultKind: earlyPhase ? '' : (explicitResultKind || state.oracle.resultKind || '')
    };
    if (!canPlay()) return;
    const intensity = tierIntensity(state.oracle.tier);
    switch (state.oracle.phase) {
      case 'descent':
        stopOracleScene({ includeResult: true });
        clearSilence(true);
        state.stopCount = 0;
        reelLaunch(intensity);
        break;
      case 'cruise':
        setReelMode('cruise', intensity);
        break;
      case 'signal':
        setReelMode(detail.route?.includes('reverse') ? 'reverse' : 'anticipation', intensity);
        if (intensity > 0.72) lowPulse(intensity * 0.55, 0.06);
        break;
      case 'anomaly':
        setReelMode(/reverse|rewind/.test(detail.route || '') ? 'reverse' : 'anticipation', intensity);
        lowPulse(Math.max(0.36, intensity * 0.58), 0, 'tension');
        break;
      case 'judgment':
        setReelMode('brake', intensity);
        lowPulse(Math.max(0.42, intensity));
        if (intensity > 0.7) royalBell(intensity * 0.54, 0.15, 'tension');
        break;
      case 'verdict':
        lowPulse(0.38, 0, 'tension');
        break;
      case 'fake':
        stopLayer('reel');
        stopLayer('tension');
        impact(0.28, 'event');
        silence(880);
        scheduleTimer(() => tone({ layer: 'event', frequency: 112, endFrequency: 96, duration: 0.55, gain: 0.055, release: 0.42 }), 760, 'oracle');
        break;
      case 'revival':
        revivalSound(intensity);
        break;
      case 'revealed':
        stopLayer('reel');
        stopLayer('tension');
        break;
      case 'locked':
        stopOracleScene({ includeResult: true });
        glitch(0.68);
        impact(0.42, 'event', 0.08);
        scheduleTimer(() => silence(900), 180, 'oracle');
        break;
      case 'resting':
      case '':
        stopOracleScene();
        break;
      default:
        break;
    }
  }

  function handleOracleStop(event) {
    if (!canPlay()) return;
    const detail = event?.detail || {};
    const total = Math.max(1, Number(detail.total ?? detail.count) || 5);
    const suppliedIndex = detail.index ?? detail.stopIndex;
    const index = Math.max(0, Number.isFinite(Number(suppliedIndex)) ? Number(suppliedIndex) : state.stopCount);
    const suppliedOrder = detail.order ?? detail.orderIndex;
    const order = Math.max(0, Number.isFinite(Number(suppliedOrder)) ? Number(suppliedOrder) : state.stopCount);
    const final = Boolean(detail.final ?? detail.isLast ?? detail.last ?? (order >= total - 1));
    state.stopCount = Math.min(total, order + 1);
    reelStop(index, total, final);
  }

  function handleOracleBeat(event) {
    const detail = event?.detail || {};
    if (detail.silenceMs) {
      silence(Number(detail.silenceMs));
      return;
    }
    cue(detail.cue || detail.name || 'signal', detail);
  }

  function handleGameAudio(event) {
    const detail = event?.detail || {};
    const name = String(detail.cue || '');
    const intensity = clamp(detail.intensity ?? 0.58, 0.15, 1);
    if (!canPlay() || !name || !allowCue(`game:${name}`, name === 'pickup' ? 55 : 120)) return;
    switch (name) {
      case 'start':
      case 'retry':
        stopLayer('game');
        waterWhoosh('dive', 0.46, 'game');
        royalBell(0.32, 0.12, 'game');
        startGameLoop(intensity);
        break;
      case 'pickup':
        tone({ layer: 'game', frequency: 520, endFrequency: 760, duration: 0.08, gain: 0.065 * intensity, release: 0.05, pan: detail.pan || 0 });
        break;
      case 'rare-pickup':
        chord([520, 660, 880], { layer: 'game', duration: 0.34, gain: 0.058 * intensity, release: 0.24, spread: 0.045 });
        break;
      case 'crown':
        royalBell(0.75 * intensity, 0, 'game');
        impact(0.38, 'game', 0.04);
        break;
      case 'oxygen-warning': {
        const oxygen = Number(detail.oxygen);
        const urgency = Number.isFinite(oxygen) ? clamp(1 - oxygen / 45, 0.35, 1) : intensity;
        alarm(urgency, 'game');
        lowPulse(urgency, 0.12, 'game');
        break;
      }
      case 'pattern-warning':
        [0, 0.17].forEach(delay => tone({ layer: 'game', frequency: 310 + intensity * 170, endFrequency: 390 + intensity * 210, duration: 0.09, gain: 0.055 * intensity, delay, release: 0.06 }));
        break;
      case 'current-warning':
        waterWhoosh(detail.direction === 'right' ? 'surface' : 'dive', 0.48 * intensity, 'game');
        break;
      case 'near-miss':
        noise({ layer: 'game', duration: 0.18, gain: 0.07 * intensity, frequency: 1500, endFrequency: 480, pan: detail.pan || 0 });
        break;
      case 'shield-hit':
        chord([440, 660, 990], { layer: 'game', duration: 0.25, gain: 0.045 * intensity, release: 0.18, spread: 0.018 });
        break;
      case 'damage':
      case 'death':
        impact(name === 'death' ? 0.82 : 0.55, 'game');
        if (name === 'death' && gameVoice) gameVoice.stop(0.03);
        break;
      case 'clear':
        if (gameVoice) gameVoice.stop(0.04);
        chord([220, 277, 330, 440], { layer: 'game', duration: 1.75, gain: 0.085, release: 1.05, spread: 0.07 });
        royalBell(0.7, 0.36, 'game');
        break;
      case 'game-over':
        if (gameVoice) gameVoice.stop(0.04);
        tone({ layer: 'game', frequency: 176, endFrequency: 48, duration: 0.92, gain: 0.13, release: 0.64 });
        break;
      case 'exit':
        stopLayer('game');
        clearTimers('game');
        break;
      default:
        uiTick(intensity * 0.55);
        break;
    }
  }

  function cue(name, options = {}) {
    if (!canPlay() || !name) return false;
    const intensity = clamp(options.intensity ?? 0.58, 0.1, 1);
    const normalized = String(name).trim().toLowerCase().replace(/[\s_.:/]+/g, '-');
    switch (normalized) {
      case 'ui': uiTick(intensity); break;
      case 'opening': playOpening(options); break;
      case 'transition': playTransition(options.direction); break;
      case 'bubble': bubble({ layer: options.layer || 'event', pan: options.pan || 0, size: intensity }); break;
      case 'signal': royalBell(intensity, 0, options.layer || 'signal'); break;
      case 'pulse': lowPulse(intensity, 0, options.layer || 'tension'); break;
      case 'impact': impact(intensity, options.layer || 'event'); break;
      case 'intrusion': sillyKing(intensity); break;
      case 'royal-seal-pressed':
        sillyKing(intensity);
        impact(0.28 * intensity, 'event', 0.06);
        break;
      case 'glitch': glitch(intensity); break;
      case 'alarm': alarm(intensity, options.layer || 'event'); break;
      case 'blackout':
      case 'freeze':
        impact(0.32 * intensity, 'event');
        scheduleTimer(() => silence(Number(options.duration) || 720), 110, 'oracle');
        break;
      case 'abyssal-blackout':
        stopOracleScene({ includeResult: true });
        impact(0.22 * intensity, 'event');
        silence(4300, { fade:0.055, depth:0 });
        break;
      case 'abyssal-distant-signal':
        tone({ layer:'signal', frequency:78, endFrequency:122, duration:1.35, type:'sine', gain:0.038 * intensity, attack:.45, release:.72 });
        bubble({ layer:'signal', delay:.68, pan:-.16, size:.22 });
        break;
      case 'abyssal-reboot':
        clearSilence(true);
        waterWhoosh('surface', 0.74 * intensity, 'event');
        royalBell(0.88 * intensity, .18, 'result');
        lowPulse(0.68 * intensity, .06, 'tension');
        break;
      case 'reverse':
        noise({ layer: 'event', duration: 0.58, gain: 0.13 * intensity, frequency: 190, endFrequency: 1900, q: 0.65 });
        tone({ layer: 'event', frequency: 74, endFrequency: 260, duration: 0.5, type: 'triangle', gain: 0.1 * intensity });
        break;
      case 'crown': royalBell(0.8 * intensity, 0, options.layer || 'result'); break;
      case 'revival': revivalSound(intensity); break;
      case 'jackpot': resultSound({ resultKind: 'win', effect: 'rainbow', tier: 'jackpot', route: options.route }); break;
      case 'lose': resultSound({ resultKind: 'loss', effect: options.effect, tier: options.tier }); break;
      case 'normal-result': resultSound({ resultKind: 'normal', tier: 'normal' }); break;
      case 'silence': silence(Number(options.duration) || 650); break;
      case 'ambient-start': startAmbient(options.page || state.page); break;
      case 'ambient-stop': stopLayer('ambient'); break;
      case 'reel-launch': reelLaunch(intensity); break;
      case 'reel-stop': reelStop(options.index || 0, options.total || 5, Boolean(options.final)); break;
      case 'reel-brake': setReelMode('brake', intensity); break;
      default:
        if (/blackout|power|shutdown|silence|freeze|fake-end|lights-out/.test(normalized)) {
          impact(0.3 * intensity, 'event');
          scheduleTimer(() => silence(Number(options.duration) || 720), 90, 'oracle');
        } else if (/intrusion|naoking|king-|escape|lunch|meeting|news|trial|advert|commercial|sleep|fish|crown-search/.test(normalized)) {
          sillyKing(intensity);
        } else if (/reverse|rewind|respin|extra-spin|reboot|restart/.test(normalized)) {
          noise({ layer: options.layer || 'event', duration: 0.58, gain: 0.13 * intensity, frequency: 190, endFrequency: 1900, q: 0.65 });
          tone({ layer: options.layer || 'event', frequency: 74, endFrequency: 260, duration: 0.5, type: 'triangle', gain: 0.1 * intensity });
        } else if (/jam|break|crack|tank|glitch|malfunction|anomaly/.test(normalized)) {
          glitch(intensity);
          impact(0.34 * intensity, options.layer || 'event', 0.07);
        } else if (/jackpot|premium|palace|gold|royal|crown|seal/.test(normalized)) {
          royalBell(0.82 * intensity, 0, options.layer || 'result');
        } else if (/alarm|emergency|warning/.test(normalized)) {
          alarm(intensity, options.layer || 'event');
        } else if (/bubble|water|flood|drain|current|surface|dive/.test(normalized)) {
          waterWhoosh(options.direction || 'dive', 0.62 * intensity, options.layer || 'event');
          bubble({ layer: options.layer || 'event', delay: 0.16, pan: options.pan || 0, size: intensity });
        } else if (/impact|hit|slam|knock|drop/.test(normalized)) {
          impact(intensity, options.layer || 'event');
        } else if (/pulse|pressure|tension|heartbeat/.test(normalized)) {
          lowPulse(intensity, 0, options.layer || 'tension');
        } else {
          const variation = routeVariation(normalized);
          tone({ layer: options.layer || 'signal', frequency: 380 * variation.pitch, endFrequency: 540 * variation.pitch, duration: 0.2, gain: 0.075 * intensity, pan: variation.pan, release: 0.13 });
        }
        break;
    }
    return true;
  }

  async function enable({ gesture = false } = {}) {
    window.clearTimeout(disableTimer);
    state.enabled = true;
    store(STORAGE_ENABLED, '1');
    updateControl();
    const ready = await unlock({ gesture });
    if (ready) {
      tone({ layer: 'signal', frequency: 390, endFrequency: 650, duration: 0.18, gain: 0.08, release: 0.11 });
    }
    emitState();
    return ready;
  }

  function disable({ immediate = false } = {}) {
    state.enabled = false;
    store(STORAGE_ENABLED, '0');
    updateControl();
    const finish = () => {
      stopAll();
      if (context?.state === 'running') context.suspend().catch(() => {});
      emitState();
    };
    if (immediate || !context) finish();
    else {
      const stamp = now();
      masterGain.gain.cancelScheduledValues(stamp);
      masterGain.gain.setValueAtTime(Math.max(0.0001, masterGain.gain.value), stamp);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, stamp + 0.06);
      disableTimer = window.setTimeout(finish, 75);
    }
    return true;
  }

  function toggle({ gesture = false } = {}) {
    return state.enabled ? disable() : enable({ gesture });
  }

  function setVolume(value) {
    state.volume = clamp(value);
    store(STORAGE_VOLUME, state.volume.toFixed(2));
    if (masterGain && context) {
      const stamp = now();
      masterGain.gain.cancelScheduledValues(stamp);
      masterGain.gain.setTargetAtTime(state.volume, stamp, 0.025);
    }
    updateControl();
    emitState();
    return state.volume;
  }

  function updateControl() {
    if (!control || !toggleButton || !volumeControl) return;
    const live = state.enabled && state.unlocked && !state.hidden;
    control.dataset.sound = state.enabled ? (live ? 'on' : 'armed') : 'off';
    toggleButton.setAttribute('aria-pressed', String(state.enabled));
    toggleButton.setAttribute('aria-label', state.enabled ? '王国の音を消す' : '王国の音を入れる');
    const label = toggleButton.querySelector?.('.kingdom-sound-label');
    const status = toggleButton.querySelector?.('.kingdom-sound-status');
    if (label) label.textContent = state.enabled ? 'SOUND ON' : 'SOUND OFF';
    if (status) status.textContent = live ? 'LIVE' : state.enabled ? 'TAP TO WAKE' : 'MUTED';
    volumeControl.value = String(Math.round(state.volume * 100));
    volumeControl.disabled = !state.enabled;
  }

  function createControl() {
    if (document.getElementById?.('kingdom-sound-control')) return;
    const style = document.createElement('style');
    style.id = 'kingdom-audio-styles';
    style.textContent = `
      .kingdom-sound-control{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:10020;display:flex;align-items:center;gap:9px;padding:6px 9px 6px 6px;border:1px solid rgba(158,232,244,.24);background:rgba(2,28,40,.9);box-shadow:0 8px 28px rgba(0,17,28,.3),inset 0 1px rgba(218,250,255,.07);color:#dff9ff;font:700 10px/1.1 system-ui,sans-serif;letter-spacing:.08em;transition:border-color .2s ease,opacity .2s ease}
      .kingdom-sound-control::before{content:"";position:absolute;inset:3px;border-left:1px solid rgba(117,221,234,.22);pointer-events:none}
      .kingdom-sound-toggle{display:grid;grid-template-columns:20px auto;grid-template-rows:auto auto;column-gap:7px;align-items:center;min-width:92px;padding:5px 7px;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer}
      .kingdom-sound-mark{grid-row:1/3;position:relative;width:17px;height:17px;border:1px solid currentColor;border-radius:50%;opacity:.84}
      .kingdom-sound-mark::before,.kingdom-sound-mark::after{content:"";position:absolute;left:5px;top:4px;width:4px;height:7px;border-right:1px solid currentColor;border-radius:50%;transform-origin:left center}
      .kingdom-sound-mark::after{transform:scale(1.8);opacity:.48}
      [data-sound="off"] .kingdom-sound-mark::before,[data-sound="off"] .kingdom-sound-mark::after{display:none}
      [data-sound="off"] .kingdom-sound-mark{opacity:.48}
      .kingdom-sound-status{font-size:8px;letter-spacing:.13em;color:#78c6d2}
      [data-sound="on"]{border-color:rgba(147,238,246,.58)}
      [data-sound="on"] .kingdom-sound-status{color:#f0d376}
      .kingdom-sound-volume{width:58px;height:18px;accent-color:#8edce8;cursor:pointer}
      .kingdom-sound-volume:disabled{opacity:.25;cursor:default}
      .kingdom-sound-toggle:focus-visible,.kingdom-sound-volume:focus-visible{outline:2px solid #eff090;outline-offset:2px}
      body.is-opening-active .kingdom-sound-control{top:max(14px,env(safe-area-inset-top));bottom:auto}
      @media(max-width:600px){.kingdom-sound-control{right:max(9px,env(safe-area-inset-right));bottom:max(9px,env(safe-area-inset-bottom));padding:4px}.kingdom-sound-toggle{min-width:82px;padding:4px 5px}.kingdom-sound-volume{display:none}}
      @media(prefers-reduced-motion:reduce){.kingdom-sound-control{transition:none}}
    `;
    document.head?.append(style);

    control = document.createElement('div');
    control.id = 'kingdom-sound-control';
    control.className = 'kingdom-sound-control';
    control.setAttribute('role', 'group');
    control.setAttribute('aria-label', '王国サウンド設定');

    toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'kingdom-sound-toggle';
    toggleButton.innerHTML = '<i class="kingdom-sound-mark" aria-hidden="true"></i><span class="kingdom-sound-label">SOUND OFF</span><small class="kingdom-sound-status">MUTED</small>';
    toggleButton.addEventListener('click', event => toggle({ gesture: event.isTrusted !== false }));

    volumeControl = document.createElement('input');
    volumeControl.className = 'kingdom-sound-volume';
    volumeControl.type = 'range';
    volumeControl.min = '0'; volumeControl.max = '100'; volumeControl.step = '5';
    volumeControl.setAttribute('aria-label', '王国サウンドの音量');
    volumeControl.addEventListener('input', event => setVolume(Number(event.currentTarget.value) / 100));
    volumeControl.addEventListener('change', () => uiTick(0.34));

    control.append(toggleButton, volumeControl);
    document.body?.append(control);
    updateControl();
  }

  function emitState() {
    if (typeof window.CustomEvent !== 'function') return;
    window.dispatchEvent(new CustomEvent('naoking:soundstate', { detail: snapshot() }));
  }

  function snapshot() {
    const byLayer = {};
    LAYERS.forEach(layer => { byLayer[layer] = layerVoices.get(layer)?.size || 0; });
    return Object.freeze({
      version: VERSION,
      enabled: state.enabled,
      unlocked: state.unlocked,
      hidden: state.hidden,
      page: state.page,
      contextState: context?.state || 'uncreated',
      volume: state.volume,
      activeVoices: voices.size,
      voicesByLayer: Object.freeze(byLayer),
      timers: timers.size,
      silenceActive: state.silenceUntil > Date.now(),
      oracle: Object.freeze({ ...state.oracle }),
      stopCount: state.stopCount,
      stats: Object.freeze({ ...stats })
    });
  }

  function handleVisibility() {
    state.hidden = Boolean(document.hidden);
    if (state.hidden) {
      stopAll();
      if (context?.state === 'running') {
        context.suspend().then(() => { stats.suspends += 1; updateControl(); }).catch(() => {});
      }
      updateControl();
      return;
    }
    if (!state.enabled || !state.unlocked || !context) {
      updateControl();
      return;
    }
    context.resume().then(() => {
      stats.resumes += 1;
      updateControl();
      startAmbient(state.page);
    }).catch(() => { state.unlocked = false; updateControl(); });
  }

  function handlePageChange(event) {
    state.page = event?.detail?.page || document.body?.dataset?.page || 'home';
    stopOracleScene({ includeResult: true });
    stopLayer('game');
    stopLayer('opening');
    stopLayer('ambient');
    clearSilence(true);
    state.oracle = { phase: 'resting', tier: 'normal', route: '', family: '', resultKind: '' };
    state.stopCount = 0;
    clearTimers('page');
    if (canPlay()) scheduleTimer(() => startAmbient(state.page), 90, 'page');
  }

  function onUserGesture() {
    if (state.enabled && (!state.unlocked || context?.state !== 'running')) unlock({ gesture: true });
  }

  function onDocumentClick(event) {
    const target = event.target?.closest?.('[data-tab],#menu-button,#skip-opening,.action,button');
    if (!target || target.closest?.('#kingdom-sound-control')) return;
    if (target.matches?.('[data-tab]')) {
      playTransition(document.body?.dataset?.travelDirection || 'dive');
      return;
    }
    if (target.id === 'skip-opening') {
      stopLayer('opening');
      waterWhoosh('dive', 0.42, 'transition');
      return;
    }
    uiTick(0.34);
  }

  window.addEventListener('naoking:pagechange', handlePageChange);
  window.addEventListener('naoking:oraclephase', handleOraclePhase);
  window.addEventListener('naoking:oraclestop', handleOracleStop);
  window.addEventListener('naoking:oracleresult', event => resultSound(event.detail || {}));
  window.addEventListener('naoking:oraclebeat', handleOracleBeat);
  window.addEventListener('naoking:gameaudio', handleGameAudio);
  window.addEventListener('naoking:opening', event => playOpening(event.detail || {}));
  window.addEventListener('naoking:transition', event => playTransition(event.detail?.direction));
  window.addEventListener('naoking:audio', event => {
    const detail = event.detail || {};
    if (detail.action === 'stop') stopLayer(detail.layer || 'event');
    else if (detail.action === 'silence') silence(Number(detail.duration) || 650);
    else cue(detail.cue || detail.name, detail);
  });
  document.addEventListener('visibilitychange', handleVisibility);
  document.addEventListener('pointerdown', onUserGesture, { capture: true, passive: true });
  document.addEventListener('touchend', onUserGesture, { capture: true, passive: true });
  document.addEventListener('keydown', onUserGesture, { capture: true });
  document.addEventListener('click', onDocumentClick);
  window.addEventListener('pagehide', () => {
    stopAll();
    if (context?.state === 'running') context.suspend().catch(() => {});
  });

  const api = {
    version: VERSION,
    layers: LAYERS,
    get enabled() { return state.enabled; },
    get unlocked() { return state.unlocked; },
    get volume() { return state.volume; },
    enable,
    disable,
    toggle,
    unlock,
    setVolume,
    cue,
    silence,
    freeze: silence,
    clearSilence,
    playOpening,
    playTransition,
    stop: stopAll,
    stopLayer,
    snapshot
  };
  window.NaokingAudio = Object.freeze(api);

  const localHost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (localHost) {
    window.NaokingAudioDebug = Object.freeze({
      snapshot,
      forceUnlock: () => unlock({ force: true }),
      cue: (name, options) => cue(name, options),
      oraclePhase: detail => handleOraclePhase({ detail }),
      game: detail => handleGameAudio({ detail }),
      stress: (name = 'ui', count = 20) => {
        for (let index = 0; index < Math.min(100, Math.max(1, count)); index += 1) cue(name, { intensity: 0.25 });
        return snapshot();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createControl, { once: true });
  else createControl();
})();
