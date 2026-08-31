(() => {
  'use strict';

  if (window.NaokingAudio) return;

  const VERSION = '1.1.0';
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
  const PREMIUM_ROUTES = new Set(['royal-audience', 'golden-tide', 'secret-4810', 'palace-open', 'pixel-palace-bonus']);
  const DISTRICT_AUDIO_PROFILES = Object.freeze({
    home: Object.freeze({
      noiseType:'bandpass', noiseFrequency:620, noiseQ:.34, noiseLevel:.72,
      bedFrequency:174, bedType:'sine', bedLevel:.19, harmonicRatio:1.5, harmonicLevel:.055,
      modulationRate:.075, modulationDepth:.022, outputLevel:.038,
      motif:[261.63, 329.63, 392], motifGain:.021, motifDuration:.74,
      bubbles:[{ delay:.18, pan:-.72, size:.25 }, { delay:1.55, pan:.62, size:.36 }]
    }),
    videos: Object.freeze({
      noiseType:'lowpass', noiseFrequency:430, noiseQ:.5, noiseLevel:.78,
      bedFrequency:98, bedType:'triangle', bedLevel:.15, harmonicRatio:2.02, harmonicLevel:.035,
      modulationRate:.115, modulationDepth:.018, outputLevel:.035,
      motif:[196, 146.83, 220], motifGain:.018, motifDuration:.92,
      bubbles:[{ delay:.7, pan:-.46, size:.18 }, { delay:2.25, pan:.42, size:.22 }]
    }),
    fortune: Object.freeze({
      noiseType:'bandpass', noiseFrequency:255, noiseQ:.68, noiseLevel:.82,
      bedFrequency:55, bedType:'sine', bedLevel:.26, harmonicRatio:1.5, harmonicLevel:.045,
      modulationRate:.052, modulationDepth:.028, outputLevel:.037,
      motif:[110, 164.81, 123.47], motifGain:.018, motifDuration:1.22,
      bubbles:[{ delay:1.15, pan:-.2, size:.46 }]
    }),
    game: Object.freeze({
      noiseType:'bandpass', noiseFrequency:385, noiseQ:.48, noiseLevel:.76,
      bedFrequency:63, bedType:'triangle', bedLevel:.21, harmonicRatio:2, harmonicLevel:.052,
      modulationRate:.42, modulationDepth:.032, outputLevel:.037,
      motif:[126, 168, 189], motifGain:.018, motifDuration:.48,
      bubbles:[{ delay:.32, pan:-.74, size:.2 }, { delay:1.05, pan:.7, size:.3 }]
    }),
    submit: Object.freeze({
      noiseType:'bandpass', noiseFrequency:760, noiseQ:.3, noiseLevel:.63,
      bedFrequency:146.83, bedType:'sine', bedLevel:.15, harmonicRatio:2, harmonicLevel:.04,
      modulationRate:.095, modulationDepth:.016, outputLevel:.034,
      motif:[293.66, 369.99, 440], motifGain:.019, motifDuration:.66,
      bubbles:[{ delay:.24, pan:.58, size:.2 }, { delay:1.82, pan:-.62, size:.27 }]
    }),
    join: Object.freeze({
      noiseType:'lowpass', noiseFrequency:520, noiseQ:.38, noiseLevel:.64,
      bedFrequency:130.81, bedType:'sine', bedLevel:.16, harmonicRatio:1.5, harmonicLevel:.042,
      modulationRate:.065, modulationDepth:.015, outputLevel:.034,
      motif:[261.63, 392, 523.25], motifGain:.019, motifDuration:1.08,
      bubbles:[{ delay:1.35, pan:.18, size:.2 }]
    }),
    gallery: Object.freeze({
      noiseType:'bandpass', noiseFrequency:890, noiseQ:.28, noiseLevel:.56,
      bedFrequency:220, bedType:'sine', bedLevel:.13, harmonicRatio:1.5, harmonicLevel:.046,
      modulationRate:.045, modulationDepth:.014, outputLevel:.032,
      motif:[440, 554.37, 659.25], motifGain:.017, motifDuration:1.36,
      bubbles:[{ delay:.48, pan:-.8, size:.16 }, { delay:2.6, pan:.76, size:.24 }]
    })
  });

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
  let oracleSceneGain = null;
  let compressor = null;
  let noiseBuffer = null;
  let ambientVoice = null;
  let ambientDistrict = '';
  let currentWorldState = document.body?.dataset?.worldState || '';
  let worldStateAnnounced = false;
  let reelVoice = null;
  let gameVoice = null;
  let gameRunning = false;
  let gameIntensity = 0.5;
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
  const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') || { matches: false };
  const compactAudioQuery = window.matchMedia?.('(max-width: 620px)') || { matches: false };
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

  function scheduleWorldStateCue(delay = 720) {
    const worldState = currentWorldState || document.body?.dataset?.worldState || '';
    if (!worldState || worldStateAnnounced) return;
    currentWorldState = worldState;
    scheduleTimer(() => {
      if (worldStateAnnounced || currentWorldState !== worldState) return;
      worldStateAnnounced = playWorldSemanticCue('state', { state:worldState, intensity:.34 });
    }, delay, 'world');
  }

  function createMixer() {
    if (context) return context;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    try { context = new AudioContextClass({ latencyHint: 'interactive' }); }
    catch { context = new AudioContextClass(); }
    masterGain = context.createGain();
    sceneGain = context.createGain();
    oracleSceneGain = context.createGain();
    compressor = typeof context.createDynamicsCompressor === 'function'
      ? context.createDynamicsCompressor()
      : context.createGain();

    masterGain.gain.value = state.volume;
    sceneGain.gain.value = 1;
    oracleSceneGain.gain.value = 1;
    if (compressor.threshold) {
      compressor.threshold.value = -18;
      compressor.knee.value = 16;
      compressor.ratio.value = 8;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.24;
    }

    sceneGain.connect(masterGain);
    oracleSceneGain.connect(sceneGain);
    masterGain.connect(compressor);
    compressor.connect(context.destination);

    LAYERS.forEach(layer => {
      const gain = context.createGain();
      gain.gain.value = LAYER_LEVELS[layer];
      gain.connect(ORACLE_LAYERS.includes(layer) ? oracleSceneGain : sceneGain);
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
      if (isOpeningActive()) {
        playOpening({ resumed: true });
      } else {
        startAmbient(state.page);
        scheduleWorldStateCue();
      }
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
    const mobile = Boolean(compactAudioQuery.matches);
    const layerLimit = layer === 'event' ? (mobile ? 8 : 12) : (mobile ? 7 : 10);
    const totalLimit = mobile ? 18 : 28;
    const evictOne = candidates => {
      const voice = Array.from(candidates).find(item => !item.persistent);
      if (!voice) return false;
      voice.stop();
      return true;
    };
    if ((layerVoices.get(layer)?.size || 0) >= layerLimit && !evictOne(layerVoices.get(layer))) return null;
    if (voices.size >= totalLimit && !evictOne(voices)) return null;
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
        if (ambientVoice === this) {
          ambientVoice = null;
          ambientDistrict = '';
        }
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
    if (layer === 'ambient') ambientDistrict = '';
  }

  function stopOracleScene({ includeResult = false } = {}) {
    ORACLE_LAYERS.forEach(stopLayer);
    if (includeResult) stopLayer('result');
    clearTimers('oracle');
    clearSilence(true);
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

  /* Every Random Event Show family owns a recognisable procedural sound scene. */
  function playEventSoundScene(scene, phase, intensity = 0.6) {
    const twist = phase === 'twist';
    switch (scene) {
      case 'battle':
        if (twist) {
          impact(0.86 * intensity, 'event');
          noise({ layer:'event', duration:.62, gain:.14 * intensity, frequency:1800, endFrequency:130, pan:-.55 });
          noise({ layer:'event', duration:.62, gain:.14 * intensity, frequency:1800, endFrequency:130, pan:.55, delay:.11 });
        } else {
          lowPulse(.82 * intensity, 0, 'tension'); lowPulse(.68 * intensity, .38, 'tension');
          tone({ layer:'event', frequency:58, endFrequency:44, duration:1.4, gain:.1 * intensity, release:.7 });
        }
        break;
      case 'sports':
        if (twist) {
          tone({ layer:'event', frequency:1240, endFrequency:960, duration:.11, type:'sine', gain:.08 * intensity, release:.06 });
          chord([330,495,660], { layer:'event', duration:.55, gain:.05 * intensity, delay:.22, release:.32, spread:.02 });
          noise({ layer:'event', duration:.75, gain:.055 * intensity, frequency:520, endFrequency:900, delay:.18 });
        } else {
          tone({ layer:'event', frequency:1320, endFrequency:1540, duration:.34, type:'sine', gain:.08 * intensity, release:.24 });
          tone({ layer:'event', frequency:1320, endFrequency:1120, duration:.18, type:'sine', gain:.055 * intensity, delay:.42, release:.12 });
        }
        break;
      case 'court':
        if (twist) {
          impact(.72 * intensity, 'event');
          tone({ layer:'event', frequency:210, endFrequency:78, duration:.38, type:'triangle', gain:.12 * intensity, release:.22 });
        } else {
          noise({ layer:'event', duration:.55, gain:.045 * intensity, frequency:2200, endFrequency:900, q:1.1 });
          chord([196,247,294], { layer:'event', duration:.72, gain:.04 * intensity, release:.48, spread:.08 });
        }
        break;
      case 'news':
        if (twist) {
          glitch(.46 * intensity);
          chord([392,523,659], { layer:'event', duration:.62, gain:.06 * intensity, delay:.12, release:.38, spread:.04 });
        } else {
          chord([262,392,523], { layer:'event', duration:.42, type:'square', gain:.035 * intensity, release:.2, spread:.055 });
          tone({ layer:'event', frequency:990, endFrequency:760, duration:.12, gain:.05 * intensity, delay:.42, release:.08 });
        }
        break;
      case 'commercial':
        if (twist) {
          tone({ layer:'event', frequency:880, endFrequency:882, duration:.055, type:'square', gain:.028 * intensity, release:.03 });
          scheduleTimer(() => silence(520, { fade:.015, depth:0 }), 90, 'oracle');
        } else {
          [0,.14,.28,.42].forEach((delay,index) => tone({ layer:'event', frequency:[330,440,392,523][index], duration:.12, type:'square', gain:.035 * intensity, delay, release:.07, pan:index % 2 ? .35 : -.35 }));
          sillyKing(.42 * intensity);
        }
        break;
      case 'repair':
        if (twist) {
          impact(.52 * intensity, 'event'); glitch(.38 * intensity);
          tone({ layer:'event', frequency:118, endFrequency:72, duration:.52, type:'sawtooth', gain:.075 * intensity, delay:.18, release:.32 });
        } else {
          [0,.11,.23,.38].forEach((delay,index) => tone({ layer:'event', frequency:760 - index * 95, endFrequency:410 - index * 35, duration:.09, type:'triangle', gain:.045 * intensity, delay, release:.05, pan:(index - 1.5) / 2 }));
          noise({ layer:'event', duration:.42, gain:.045 * intensity, frequency:2400, endFrequency:620, delay:.46 });
        }
        break;
      case 'abandon':
        if (twist) {
          stopOracleScene();
          silence(1650, { fade:.045, depth:0 });
        } else {
          [0,.28,.6].forEach((delay,index) => tone({ layer:'event', frequency:180 - index * 22, endFrequency:82, duration:.18, type:'triangle', gain:.05 * intensity, delay, release:.12, pan:-.2 + index * .28 }));
          scheduleTimer(() => silence(900, { fade:.08, depth:0 }), 780, 'oracle');
        }
        break;
      case 'chase':
        if (twist) {
          noise({ layer:'event', duration:.75, gain:.12 * intensity, frequency:160, endFrequency:2100, pan:-.8 });
          noise({ layer:'event', duration:.72, gain:.1 * intensity, frequency:1900, endFrequency:240, pan:.8, delay:.18 });
        } else {
          [0,.18,.36,.54].forEach((delay,index) => tone({ layer:'event', frequency:170 + index * 36, endFrequency:260 + index * 44, duration:.1, type:'triangle', gain:.05 * intensity, delay, release:.05, pan:-.8 + index * .52 }));
        }
        break;
      case 'lunch':
        if (twist) {
          tone({ layer:'event', frequency:520, endFrequency:180, duration:.22, type:'triangle', gain:.05 * intensity, release:.16 });
          sillyKing(.32 * intensity);
        } else {
          [0,.12,.25].forEach((delay,index) => tone({ layer:'event', frequency:920 + index * 140, endFrequency:620 + index * 70, duration:.08, type:'sine', gain:.035 * intensity, delay, release:.045, pan:index - 1 }));
          bubble({ layer:'event', delay:.38, pan:.2, size:.32 });
        }
        break;
      case 'gravity':
        if (twist) {
          noise({ layer:'event', duration:.9, gain:.13 * intensity, frequency:1900, endFrequency:120, q:.45 });
          impact(.68 * intensity, 'event', .34);
        } else {
          tone({ layer:'event', frequency:74, endFrequency:35, duration:1.35, type:'sine', gain:.13 * intensity, release:.75 });
          noise({ layer:'event', duration:1.05, gain:.07 * intensity, frequency:240, endFrequency:1100 });
        }
        break;
      case 'giant':
        if (twist) {
          impact(.48 * intensity, 'event');
          tone({ layer:'event', frequency:48, endFrequency:31, duration:1.1, gain:.13 * intensity, release:.68 });
          sillyKing(.24 * intensity);
        } else {
          noise({ layer:'event', duration:1.4, gain:.09 * intensity, filterType:'lowpass', frequency:260, endFrequency:92, q:.5 });
          lowPulse(.72 * intensity, .36, 'tension');
        }
        break;
      case 'pixel':
        if (twist) {
          [0,.09,.18,.27,.36].forEach((delay,index) => tone({ layer:'event', frequency:[262,330,392,523,784][index], duration:.075, type:'square', gain:.035 * intensity, delay, release:.04, pan:index % 2 ? .45 : -.45 }));
          royalBell(.62 * intensity, .52, 'event');
        } else {
          [0,.13,.26,.39].forEach((delay,index) => tone({ layer:'event', frequency:[131,196,262,330][index], endFrequency:[196,262,330,392][index], duration:.1, type:'square', gain:.03 * intensity, delay, release:.055 }));
        }
        break;
      default:
        return false;
    }
    return true;
  }

  /*
   * Declarative sound scenes are intentionally data-only at the route boundary.
   * They let future shows request a recognisable score without teaching the
   * roulette controller how Web Audio is assembled.
   */
  const SOUND_SCENES = Object.freeze({
    'fish-school':Object.freeze({
      signal:[
        { kind:'tone', frequency:720, endFrequency:1180, duration:.16, delay:0, pan:-.78 },
        { kind:'tone', frequency:860, endFrequency:1360, duration:.14, delay:.12, pan:-.35 },
        { kind:'tone', frequency:1040, endFrequency:1510, duration:.13, delay:.25, pan:.12 },
        { kind:'tone', frequency:920, endFrequency:1420, duration:.15, delay:.39, pan:.56 }
      ],
      twist:[
        { kind:'noise', frequency:1700, endFrequency:540, duration:.62, gain:.065, pan:.72 },
        { kind:'tone', frequency:1320, endFrequency:690, duration:.24, delay:.08, pan:.6 },
        { kind:'tone', frequency:1180, endFrequency:620, duration:.22, delay:.26, pan:-.55 }
      ]
    }),
    race:Object.freeze({
      signal:[
        { kind:'tone', type:'triangle', frequency:420, endFrequency:470, duration:.07, delay:0, pan:-.65 },
        { kind:'tone', type:'triangle', frequency:470, endFrequency:540, duration:.065, delay:.18, pan:-.2 },
        { kind:'tone', type:'triangle', frequency:540, endFrequency:630, duration:.06, delay:.32, pan:.3 },
        { kind:'tone', frequency:1480, endFrequency:1760, duration:.18, delay:.48, pan:.72 }
      ],
      twist:[
        { kind:'noise', frequency:420, endFrequency:1380, duration:.72, gain:.072, pan:-.7 },
        { kind:'noise', frequency:1500, endFrequency:470, duration:.68, delay:.13, gain:.064, pan:.7 },
        { kind:'impact', intensity:.42, delay:.62 }
      ]
    }),
    school:Object.freeze({
      signal:[
        { kind:'chord', frequencies:[392,523,659], duration:.38, gain:.045, spread:.055 },
        { kind:'noise', frequency:2600, endFrequency:1300, duration:.26, delay:.38, gain:.032 }
      ],
      twist:[
        { kind:'tone', type:'triangle', frequency:659, endFrequency:523, duration:.2, pan:-.3 },
        { kind:'tone', type:'triangle', frequency:784, endFrequency:659, duration:.2, delay:.28, pan:.35 },
        { kind:'chord', frequencies:[392,494,659], duration:.5, delay:.58, gain:.04, spread:.035 }
      ]
    }),
    dive:Object.freeze({
      signal:[
        { kind:'noise', frequency:1800, endFrequency:260, duration:.9, gain:.085 },
        { kind:'tone', type:'triangle', frequency:260, endFrequency:142, duration:.42, delay:.34, gain:.045 }
      ],
      twist:[
        { kind:'noise', frequency:420, endFrequency:1900, duration:.78, gain:.078, pan:-.35 },
        { kind:'tone', frequency:180, endFrequency:240, duration:.22, delay:.5, gain:.038, pan:.4 }
      ]
    }),
    portal:Object.freeze({
      signal:[
        { kind:'chord', frequencies:[440,660,990], duration:.82, gain:.042, spread:.08 },
        { kind:'noise', frequency:2400, endFrequency:1100, duration:.34, delay:.28, gain:.035, pan:.65 }
      ],
      twist:[
        { kind:'tone', type:'square', frequency:880, endFrequency:1760, duration:.055, pan:-.7 },
        { kind:'tone', type:'square', frequency:1320, endFrequency:660, duration:.045, delay:.11, pan:.7 },
        { kind:'chord', frequencies:[330,495,742], duration:.72, delay:.22, gain:.047, spread:.06 }
      ]
    }),
    'power-failure':Object.freeze({
      signal:[
        { kind:'tone', type:'square', frequency:1240, endFrequency:180, duration:.055, gain:.035 },
        { kind:'noise', frequency:1500, endFrequency:90, duration:.3, delay:.07, gain:.06 },
        { kind:'silence', durationMs:720, delayMs:190 }
      ],
      twist:[
        { kind:'silence', durationMs:520 },
        { kind:'tone', frequency:58, endFrequency:92, duration:.19, delay:.48, gain:.055 },
        { kind:'chord', frequencies:[196,294,392], duration:.48, delay:.62, gain:.045, spread:.045 }
      ]
    }),
    'ui-failure':Object.freeze({
      signal:[
        { kind:'tone', type:'square', frequency:980, endFrequency:240, duration:.045, pan:-.8 },
        { kind:'tone', type:'square', frequency:370, endFrequency:1110, duration:.04, delay:.08, pan:.65 },
        { kind:'tone', type:'square', frequency:1460, endFrequency:510, duration:.035, delay:.17, pan:-.2 }
      ],
      twist:[
        { kind:'noise', frequency:2200, endFrequency:380, duration:.22, gain:.045 },
        { kind:'tone', type:'square', frequency:220, endFrequency:1760, duration:.05, delay:.09, pan:.8 },
        { kind:'silence', durationMs:260, delayMs:180 }
      ]
    }),
    'jackpot-golden':Object.freeze({
      reveal:[{ kind:'silence', durationMs:140 },{ kind:'impact', intensity:.8, delay:.13 },{ kind:'chord', frequencies:[196,247,294,392,494], duration:1.8, delay:.2, gain:.085, spread:.07 },{ kind:'bell', intensity:.72, delay:.48 }]
    }),
    'jackpot-fish':Object.freeze({
      reveal:[{ kind:'silence', durationMs:120 },{ kind:'tone', frequency:760, endFrequency:1420, duration:.18, delay:.11, pan:-.75 },{ kind:'tone', frequency:940, endFrequency:1660, duration:.18, delay:.23, pan:.72 },{ kind:'chord', frequencies:[220,330,440,660], duration:1.55, delay:.34, gain:.072, spread:.08 }]
    }),
    'jackpot-dawn':Object.freeze({
      reveal:[{ kind:'silence', durationMs:180 },{ kind:'noise', frequency:240, endFrequency:2600, duration:1.45, delay:.17, gain:.075 },{ kind:'chord', frequencies:[247,330,415,554], duration:2.05, delay:.28, gain:.075, spread:.1 },{ kind:'bell', intensity:.68, delay:.8 }]
    }),
    'jackpot-overload':Object.freeze({
      reveal:[{ kind:'tone', type:'square', frequency:880, endFrequency:1760, duration:.045, pan:-.8 },{ kind:'tone', type:'square', frequency:1320, endFrequency:330, duration:.04, delay:.07, pan:.8 },{ kind:'impact', intensity:.9, delay:.14 },{ kind:'chord', frequencies:[196,294,392,588,784], duration:1.7, delay:.22, gain:.078, spread:.045 }]
    })
  });

  function playDeclarativeSoundScene(detail = {}) {
    const scene = SOUND_SCENES[String(detail.scene || '')];
    if (!scene) return false;
    const beat = String(detail.beat || 'signal');
    const entries = scene[beat] || scene.signal;
    if (!entries?.length) return false;
    const requestedDuration = Math.max(0, Number(detail.durationMs) || 0);
    const compact = Boolean(detail.reducedMotion || reducedMotionQuery.matches || requestedDuration && requestedDuration < 650);
    const scale = compact ? Math.max(.18, Math.min(.42, requestedDuration ? requestedDuration / 1500 : .32)) : 1;
    const intensity = clamp(detail.intensity ?? .62, .15, 1);
    const limit = compactAudioQuery.matches ? 6 : 10;
    entries.slice(0, limit).forEach(entry => {
      const delay = Math.max(0, Number(entry.delay) || 0) * scale;
      const gain = (entry.gain ?? .052) * intensity;
      if (entry.kind === 'tone') tone({ ...entry, layer:'event', delay, duration:Math.max(.035, entry.duration * scale), release:Math.max(.025, (entry.release ?? entry.duration * .55) * scale), gain });
      else if (entry.kind === 'noise') noise({ ...entry, layer:'event', delay, duration:Math.max(.05, entry.duration * scale), gain });
      else if (entry.kind === 'chord') chord(entry.frequencies, { ...entry, layer:'event', delay, duration:Math.max(.08, entry.duration * scale), release:Math.max(.06, (entry.release ?? entry.duration * .65) * scale), gain });
      else if (entry.kind === 'impact') scheduleTimer(() => impact((entry.intensity ?? .6) * intensity, 'event'), delay * 1000, 'oracle');
      else if (entry.kind === 'bell') royalBell((entry.intensity ?? .6) * intensity, delay, 'event');
      else if (entry.kind === 'silence') scheduleTimer(() => silence(Math.max(80, entry.durationMs * scale), { fade:.02, depth:0 }), Math.max(0, Number(entry.delayMs) || 0) * scale, 'oracle');
    });
    return true;
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

  function normalizeDistrict(page = 'home') {
    const name = String(page || 'home').trim().toLowerCase();
    if (/^(record|records|archive|video|videos)$/.test(name)) return 'videos';
    if (/^(oracle|fortune)$/.test(name)) return 'fortune';
    if (/^(vrchat|workshop|offering|submit)$/.test(name)) return 'submit';
    if (/^(decree|entry|join)$/.test(name)) return 'join';
    if (/^(gallery|photos?|scenery|memory)$/.test(name)) return 'gallery';
    return DISTRICT_AUDIO_PROFILES[name] ? name : 'home';
  }

  function startAmbient(page = 'home') {
    if (!canPlay() || state.hidden || isOpeningActive()) return false;
    const district = normalizeDistrict(page);
    if (ambientVoice && ambientDistrict === district) return true;
    stopLayer('ambient');
    clearTimers('ambient');
    const voice = makeVoice('ambient');
    if (!voice) return false;
    voice.persistent = true;
    const profile = DISTRICT_AUDIO_PROFILES[district];
    const source = voice.addSource(context.createBufferSource());
    const filter = voice.addNode(context.createBiquadFilter());
    const noiseGain = voice.addNode(context.createGain());
    const bed = voice.addSource(context.createOscillator());
    const bedGain = voice.addNode(context.createGain());
    const harmonic = voice.addSource(context.createOscillator());
    const harmonicGain = voice.addNode(context.createGain());
    const drift = voice.addSource(context.createOscillator());
    const driftGain = voice.addNode(context.createGain());
    source.buffer = getNoiseBuffer(); source.loop = true;
    filter.type = profile.noiseType;
    filter.frequency.value = profile.noiseFrequency;
    filter.Q.value = profile.noiseQ;
    noiseGain.gain.value = profile.noiseLevel;
    bed.type = profile.bedType;
    bed.frequency.value = profile.bedFrequency;
    bedGain.gain.value = profile.bedLevel;
    harmonic.type = 'sine';
    harmonic.frequency.value = profile.bedFrequency * profile.harmonicRatio;
    harmonicGain.gain.value = profile.harmonicLevel;
    drift.type = 'sine';
    drift.frequency.value = profile.modulationRate;
    driftGain.gain.value = profile.modulationDepth;
    voice.output.gain.value = profile.outputLevel;
    source.connect(filter); filter.connect(noiseGain); connectWithPan(noiseGain, voice, -.08);
    bed.connect(bedGain); connectWithPan(bedGain, voice, -.22);
    harmonic.connect(harmonicGain); connectWithPan(harmonicGain, voice, .24);
    drift.connect(driftGain); driftGain.connect(bedGain.gain);
    source.start(); bed.start(); harmonic.start(); drift.start();
    ambientVoice = voice;
    ambientDistrict = district;
    profile.motif.forEach((frequency, index) => tone({
      layer:'ambient', frequency, endFrequency:frequency * (index === profile.motif.length - 1 ? 1.008 : 1),
      duration:profile.motifDuration, gain:profile.motifGain, delay:.24 + index * .34,
      attack:.16, release:profile.motifDuration * .58, pan:(index - 1) * .34
    }));
    profile.bubbles.forEach(options => bubble({ layer:'ambient', ...options }));
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
    if (!canPlay() || !oracleSceneGain) return false;
    window.clearTimeout(silenceTimer);
    const stamp = now();
    oracleSceneGain.gain.cancelScheduledValues(stamp);
    oracleSceneGain.gain.setValueAtTime(Math.max(0, oracleSceneGain.gain.value), stamp);
    oracleSceneGain.gain.linearRampToValueAtTime(clamp(depth), stamp + Math.max(0.008, fade));
    state.silenceUntil = Date.now() + duration;
    silenceTimer = window.setTimeout(() => clearSilence(false), Math.max(40, duration));
    return true;
  }

  function clearSilence(immediate = false) {
    window.clearTimeout(silenceTimer);
    silenceTimer = 0;
    state.silenceUntil = 0;
    if (!oracleSceneGain || !context) return;
    const stamp = now();
    oracleSceneGain.gain.cancelScheduledValues(stamp);
    oracleSceneGain.gain.setValueAtTime(Math.max(0, oracleSceneGain.gain.value), stamp);
    if (immediate) oracleSceneGain.gain.setValueAtTime(1, stamp);
    else oracleSceneGain.gain.linearRampToValueAtTime(1, stamp + 0.18);
  }

  function playOpening({ resumed = false } = {}) {
    if (!canPlay() || !isOpeningActive() || (!resumed && !allowCue('opening', 2800))) return false;
    stopLayer('opening');
    noise({ layer: 'opening', duration: 2.85, gain: 0.18, filterType: 'lowpass', frequency: 2300, endFrequency: 190, q: 0.55 });
    tone({ layer: 'opening', frequency: 164, endFrequency: 43, duration: 2.65, gain: 0.18, attack: 0.08, release: 0.48 });
    [0.28, 0.55, 0.92, 1.44].forEach((delay, index) => bubble({ layer: 'opening', delay, pan: index % 2 ? 0.6 : -0.5, size: 0.35 + index * 0.1 }));
    royalBell(0.55, resumed ? 1.45 : 2.1, 'opening');
    return true;
  }

  function handleOpeningAudio(event) {
    const phase = String(event?.detail?.phase || '').toLowerCase();
    if (/^(finish|finished|complete|completed|skip)$/.test(phase)) {
      stopLayer('opening');
      if (canPlay()) {
        startAmbient(state.page);
        scheduleWorldStateCue(520);
      }
      return true;
    }
    return playOpening(event?.detail || {});
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
    if (detail.scene && detail.beat && playDeclarativeSoundScene(detail)) return;
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
    if (['start', 'retry'].includes(name)) {
      gameRunning = true;
      gameIntensity = intensity;
    } else if (['death', 'clear', 'game-over', 'exit'].includes(name)) {
      gameRunning = false;
    }
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

  function playWorldSemanticCue(type, options = {}) {
    if (!canPlay()) return false;
    const semanticType = String(type || 'state').toLowerCase();
    const identity = String(options.state || options.worldState || options.discovery || options.surprise || options.kind || 'current')
      .toLowerCase().replace(/[\s_.:/]+/g, '-');
    const intensity = clamp(options.intensity ?? .46, .12, .82);
    if (!allowCue(`world:${semanticType}:${identity}`, semanticType === 'state' ? 900 : 220)) return false;

    if (semanticType === 'discovery') {
      const variation = routeVariation(identity);
      const base = 293.66 * variation.pitch;
      chord([base, base * 1.25, base * 1.5], {
        layer:'signal', duration:.72, gain:.045 * intensity, attack:.02, release:.46,
        spread:.11, pan:variation.pan * .42
      });
      bubble({ layer:'signal', delay:.34, pan:-variation.pan, size:.2 + intensity * .22 });
      return true;
    }

    if (semanticType === 'surprise') {
      if (/crossing|intrusion|naoking|king|sleep|lunch/.test(identity)) {
        sillyKing(.7 * intensity);
        waterWhoosh('surface', .32 * intensity, 'event');
      } else if (/shadow|giant|leviathan|pressure/.test(identity)) {
        noise({ layer:'event', duration:1.15, gain:.075 * intensity, filterType:'lowpass', frequency:260, endFrequency:88, q:.4 });
        lowPulse(.62 * intensity, .28, 'event');
      } else if (/crown|royal|festival|palace/.test(identity)) {
        royalBell(.64 * intensity, 0, 'signal');
      } else if (/migration|jelly|fish|bubble/.test(identity)) {
        waterWhoosh('surface', .28 * intensity, 'event');
        [-.66, -.08, .62].forEach((pan, index) => bubble({ layer:'event', delay:.12 + index * .17, pan, size:.18 + index * .1 }));
      } else if (/reverse|glitch|anomaly|lost/.test(identity)) {
        noise({ layer:'event', duration:.52, gain:.065 * intensity, frequency:330, endFrequency:1480, q:.55 });
        tone({ layer:'event', frequency:196, endFrequency:294, duration:.34, type:'triangle', gain:.05 * intensity, pan:.4 });
      } else {
        royalBell(.38 * intensity, 0, 'signal');
        bubble({ layer:'signal', delay:.12, pan:.36, size:.28 });
      }
      return true;
    }

    if (/luminous|dawn|bright|surface/.test(identity)) {
      waterWhoosh('surface', .28 * intensity, 'ambient');
      chord([261.63, 329.63, 392], { layer:'signal', duration:1.08, gain:.026 * intensity, release:.72, spread:.08 });
    } else if (/quiet|sleep|still|trench/.test(identity)) {
      tone({ layer:'signal', frequency:146.83, endFrequency:130.81, duration:1.4, gain:.032 * intensity, attack:.24, release:.86 });
    } else if (/reverse|anomaly|storm|rough/.test(identity)) {
      noise({ layer:'ambient', duration:.78, gain:.052 * intensity, frequency:360, endFrequency:1280, q:.46 });
      tone({ layer:'signal', frequency:110, endFrequency:164.81, duration:.58, gain:.038 * intensity, release:.34 });
    } else if (/festival|royal|crown|palace/.test(identity)) {
      royalBell(.48 * intensity, 0, 'signal');
    } else if (/migration|jelly|fish/.test(identity)) {
      [-.58, .08, .64].forEach((pan, index) => bubble({ layer:'signal', delay:index * .16, pan, size:.17 + index * .08 }));
    } else if (/archive|memory|record|bloom/.test(identity)) {
      chord([196, 293.66], { layer:'signal', duration:1.12, gain:.026 * intensity, release:.76, spread:.18 });
    } else {
      tone({ layer:'signal', frequency:220, endFrequency:277.18, duration:.7, gain:.028 * intensity, release:.44 });
      bubble({ layer:'signal', delay:.22, pan:.24, size:.22 });
    }
    return true;
  }

  function world(detail = {}) {
    const type = String(detail.type || detail.semantic || detail.kind || 'state').toLowerCase();
    if (type === 'state') {
      const nextState = String(detail.state || detail.worldState || '').trim();
      if (nextState && nextState !== currentWorldState) worldStateAnnounced = false;
      if (nextState) currentWorldState = nextState;
      if (!canPlay()) return false;
      const played = playWorldSemanticCue('state', { ...detail, state:currentWorldState || nextState });
      if (played) worldStateAnnounced = true;
      return played;
    }
    return playWorldSemanticCue(type, detail);
  }

  function cue(name, options = {}) {
    if (!canPlay() || !name) return false;
    const intensity = clamp(options.intensity ?? 0.58, 0.1, 1);
    const normalized = String(name).trim().toLowerCase().replace(/[\s_.:/]+/g, '-');
    const eventScene = normalized.match(/^(battle|sports|court|news|commercial|repair|abandon|chase|lunch|gravity|giant|pixel)-(signal|twist)$/);
    if (eventScene) return playEventSoundScene(eventScene[1], eventScene[2], intensity);
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
      case 'world-state': world({ ...options, type:'state' }); break;
      case 'world-discovery':
      case 'discovery': world({ ...options, type:'discovery' }); break;
      case 'world-surprise':
      case 'surprise': world({ ...options, type:'surprise' }); break;
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
      ambientDistrict,
      gameRunning,
      worldState: currentWorldState,
      worldStateAnnounced,
      contextState: context?.state || 'uncreated',
      volume: state.volume,
      activeVoices: voices.size,
      voicesByLayer: Object.freeze(byLayer),
      timers: timers.size,
      silenceActive: state.silenceUntil > Date.now(),
      oracleBusGain: oracleSceneGain?.gain.value ?? 1,
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
      if (isOpeningActive()) {
        playOpening({ resumed: true });
        return;
      }
      startAmbient(state.page);
      scheduleWorldStateCue();
      if (gameRunning && state.page === 'game') startGameLoop(gameIntensity);
      const phase = state.oracle.phase;
      if (['descent', 'cruise', 'signal', 'anomaly', 'judgment', 'verdict'].includes(phase)) {
        const mode = phase === 'descent' ? 'launch'
          : ['signal', 'anomaly'].includes(phase) ? (/reverse|rewind/.test(state.oracle.route) ? 'reverse' : 'anticipation')
            : ['judgment', 'verdict'].includes(phase) ? 'brake' : 'cruise';
        startReelLoop(mode, tierIntensity(state.oracle.tier));
      }
    }).catch(() => { state.unlocked = false; updateControl(); });
  }

  function handlePageChange(event) {
    state.page = event?.detail?.page || document.body?.dataset?.page || 'home';
    if (state.page !== 'game') gameRunning = false;
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

  function bindGalleryAmbient() {
    const gallery = document.getElementById?.('kingdom-gallery');
    const galleryOpen = document.getElementById?.('photo-gallery-open');
    if (!gallery || !galleryOpen) return;
    const enterGallery = () => scheduleTimer(() => startAmbient('gallery'), 0, 'page');
    const leaveGallery = () => scheduleTimer(() => startAmbient(state.page), 0, 'page');
    galleryOpen.addEventListener('click', enterGallery);
    gallery.addEventListener('close', leaveGallery);
  }

  window.addEventListener('naoking:pagechange', handlePageChange);
  window.addEventListener('naoking:oraclephase', handleOraclePhase);
  window.addEventListener('naoking:oraclestop', handleOracleStop);
  window.addEventListener('naoking:oracleresult', event => resultSound(event.detail || {}));
  window.addEventListener('naoking:oraclebeat', handleOracleBeat);
  window.addEventListener('naoking:gameaudio', handleGameAudio);
  window.addEventListener('naoking:opening', handleOpeningAudio);
  window.addEventListener('naoking:transition', event => playTransition(event.detail?.direction));
  window.addEventListener('naoking:audio', event => {
    const detail = event.detail || {};
    if (detail.action === 'stop') stopLayer(detail.layer || 'event');
    else if (detail.action === 'silence') silence(Number(detail.duration) || 650);
    else if (detail.action === 'world') world(detail);
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
    districts: Object.freeze(Object.keys(DISTRICT_AUDIO_PROFILES)),
    get enabled() { return state.enabled; },
    get unlocked() { return state.unlocked; },
    get volume() { return state.volume; },
    enable,
    disable,
    toggle,
    unlock,
    setVolume,
    cue,
    world,
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

  function initialize() {
    createControl();
    bindGalleryAmbient();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
