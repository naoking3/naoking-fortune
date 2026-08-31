(() => {
  'use strict';

  if (window.NaokingRoyalOracleAudio) return;

  const VERSION = '1.0.0';
  const BASE_PATH = new URL('assets/audio/royal-oracle/', document.currentScript?.src || location.href).href;
  const ASSETS = Object.freeze({
    spin:Object.freeze({ file:'normal-underwater-spin.wav', volume:.56, loop:true }),
    sports:Object.freeze({ file:'crown-goal.wav', volume:.78 }),
    race:Object.freeze({ file:'naoking-race.wav', volume:.72 }),
    powerCut:Object.freeze({ file:'power-cut.wav', volume:.82 }),
    distantSignal:Object.freeze({ file:'distant-signal.wav', volume:.68 }),
    restart:Object.freeze({ file:'restart-surge.wav', volume:.82 }),
    revival:Object.freeze({ file:'revival-rise.wav', volume:.78 }),
    jackpot:Object.freeze({ file:'jackpot-burst.wav', volume:.88 }),
    premium:Object.freeze({ file:'premium-crown.wav', volume:.76 })
  });
  const SCENE_ASSETS = Object.freeze({
    sports:'sports',
    race:'race',
    'power-failure':'powerCut',
    'jackpot-golden':'premium',
    'jackpot-fish':'premium',
    'jackpot-dawn':'premium',
    'jackpot-overload':'premium'
  });
  const BLACKOUT_CUES = new Set(['blackout', 'abyssal-blackout']);
  const PREMIUM_EFFECTS = new Set(['rainbow', 'crown', 'comet', 'abyss', 'revival']);

  const initialPrimary = readPrimarySnapshot();
  const state = {
    enabled:Boolean(initialPrimary.enabled),
    unlocked:Boolean(initialPrimary.unlocked),
    hidden:Boolean(document.hidden),
    volume:clamp(initialPrimary.volume ?? .64),
    page:initialPrimary.page || document.body?.dataset?.page || 'home',
    route:'',
    phase:'resting',
    scene:'',
    stopCount:0,
    blackoutStage:'',
    stats:{ loads:0, loadFailures:0, plays:0, dropped:0, silences:0, cleanups:0 }
  };

  let context = null;
  let master = null;
  let compressor = null;
  const buffers = new Map();
  const loading = new Map();
  const active = new Map();
  const timers = new Set();
  const slotTokens = new Map();
  const playedKeys = [];

  function clamp(value, minimum = 0, maximum = 1) {
    return Math.max(minimum, Math.min(maximum, Number(value) || 0));
  }

  function readPrimarySnapshot() {
    try { return window.NaokingAudio?.snapshot?.() || {}; }
    catch { return {}; }
  }

  function canPlay({ duringBlackout = false } = {}) {
    return Boolean(
      state.enabled && state.unlocked && !state.hidden && context?.state === 'running'
      && (duringBlackout || state.blackoutStage !== 'silent')
    );
  }

  function outputLevel(multiplier = 1) {
    return clamp(state.volume) * .7 * clamp(multiplier);
  }

  function setMaster(multiplier, seconds = .035) {
    if (!master || !context) return;
    const stamp = context.currentTime;
    const target = outputLevel(multiplier);
    master.gain.cancelScheduledValues(stamp);
    master.gain.setValueAtTime(master.gain.value, stamp);
    if (seconds <= 0) master.gain.setValueAtTime(target, stamp);
    else master.gain.linearRampToValueAtTime(target, stamp + seconds);
  }

  async function ensureContext({ force = false } = {}) {
    if (context) {
      if (context.state !== 'running' && (state.unlocked || force)) {
        try { await context.resume(); } catch { return null; }
      }
      return context;
    }
    if (!force && !state.unlocked) return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    try { context = new AudioContextClass({ latencyHint:'interactive' }); }
    catch { context = new AudioContextClass(); }
    master = context.createGain();
    compressor = typeof context.createDynamicsCompressor === 'function'
      ? context.createDynamicsCompressor()
      : context.createGain();
    if (compressor.threshold) {
      compressor.threshold.value = -16;
      compressor.knee.value = 18;
      compressor.ratio.value = 7;
      compressor.attack.value = .004;
      compressor.release.value = .22;
    }
    master.gain.value = state.blackoutStage === 'silent' ? 0 : outputLevel();
    master.connect(compressor);
    compressor.connect(context.destination);
    if (context.state !== 'running') {
      try { await context.resume(); } catch { return null; }
    }
    return context;
  }

  async function decodeAudio(arrayBuffer) {
    if (!context) return null;
    const copy = arrayBuffer.slice(0);
    try {
      const promise = context.decodeAudioData(copy);
      if (promise?.then) return await promise;
    } catch { /* Legacy callback form below. */ }
    return await new Promise((resolve, reject) => context.decodeAudioData(copy, resolve, reject));
  }

  async function loadAsset(key) {
    if (buffers.has(key)) return buffers.get(key);
    if (loading.has(key)) return loading.get(key);
    const definition = ASSETS[key];
    if (!definition || !context) return null;
    const request = (async () => {
      try {
        const response = await fetch(new URL(definition.file, BASE_PATH));
        if (!response.ok) throw new Error(`Audio asset request failed: ${response.status}`);
        const buffer = await decodeAudio(await response.arrayBuffer());
        if (!buffer) throw new Error('Audio asset decode failed');
        buffers.set(key, buffer);
        state.stats.loads += 1;
        return buffer;
      } catch (error) {
        state.stats.loadFailures += 1;
        if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) console.warn('[ROYAL ORACLE AUDIO]', key, error);
        return null;
      } finally {
        loading.delete(key);
      }
    })();
    loading.set(key, request);
    return request;
  }

  async function preload() {
    if (!await ensureContext()) return false;
    await Promise.all(Object.keys(ASSETS).map(loadAsset));
    return buffers.size === Object.keys(ASSETS).length;
  }

  function stopSlot(slot, fadeSeconds = .025) {
    const entry = active.get(slot);
    slotTokens.set(slot, (slotTokens.get(slot) || 0) + 1);
    if (!entry) return;
    active.delete(slot);
    try {
      const stamp = context?.currentTime || 0;
      entry.gain.gain.cancelScheduledValues(stamp);
      entry.gain.gain.setValueAtTime(Math.max(.0001, entry.gain.gain.value), stamp);
      entry.gain.gain.exponentialRampToValueAtTime(.0001, stamp + Math.max(.008, fadeSeconds));
      entry.source.stop(stamp + Math.max(.01, fadeSeconds) + .015);
    } catch { /* Already ended. */ }
  }

  function stopAll({ keep = [] } = {}) {
    const protectedSlots = new Set(keep);
    Array.from(active.keys()).forEach(slot => {
      if (!protectedSlots.has(slot)) stopSlot(slot);
    });
    state.stats.cleanups += 1;
  }

  async function playAsset(key, options = {}) {
    const definition = ASSETS[key];
    if (!definition) return false;
    const duringBlackout = Boolean(options.duringBlackout);
    if (!await ensureContext() || !canPlay({ duringBlackout })) {
      state.stats.dropped += 1;
      return false;
    }
    const slot = options.slot || key;
    if (options.replace !== false) stopSlot(slot, options.fadeOut ?? .025);
    const currentToken = (slotTokens.get(slot) || 0) + 1;
    slotTokens.set(slot, currentToken);
    const buffer = await loadAsset(key);
    if (!buffer || slotTokens.get(slot) !== currentToken || !canPlay({ duringBlackout })) {
      state.stats.dropped += 1;
      return false;
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = options.loop ?? definition.loop ?? false;
    if (source.playbackRate) source.playbackRate.value = clamp(options.rate ?? 1, .72, 1.28);
    gain.gain.value = .0001;
    source.connect(gain);
    gain.connect(master);
    const stamp = context.currentTime;
    const peak = clamp((options.volume ?? definition.volume ?? .7) * clamp(options.intensity ?? 1, .15, 1), .02, 1);
    gain.gain.setValueAtTime(.0001, stamp);
    gain.gain.linearRampToValueAtTime(peak, stamp + Math.max(.008, options.fadeIn ?? .035));
    const entry = { key, slot, source, gain };
    active.set(slot, entry);
    source.onended = () => {
      if (active.get(slot) === entry) active.delete(slot);
      try { source.disconnect(); gain.disconnect(); } catch { /* Already disconnected. */ }
    };
    source.start(0, Math.max(0, Number(options.offset) || 0));
    state.stats.plays += 1;
    playedKeys.push(key);
    if (playedKeys.length > 48) playedKeys.shift();
    return true;
  }

  function schedule(callback, delay) {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, Math.max(0, delay));
    timers.add(timer);
    return timer;
  }

  function clearTimers() {
    timers.forEach(timer => window.clearTimeout(timer));
    timers.clear();
  }

  function primaryStopLayers(...layers) {
    const primary = window.NaokingAudio;
    layers.forEach(layer => {
      try { primary?.stopLayer?.(layer); } catch { /* Optional integration. */ }
    });
  }

  function primaryHardStop() {
    try { window.NaokingAudio?.stop?.(); } catch { /* Optional integration. */ }
  }

  function restorePrimaryAmbient(delay = 520) {
    schedule(() => {
      try { window.NaokingAudio?.cue?.('ambient-start', { page:state.page }); } catch { /* Optional integration. */ }
    }, delay);
  }

  function enterBlackout(delay = 0) {
    const commit = () => {
      stopAll();
      primaryHardStop();
      state.blackoutStage = 'silent';
      setMaster(0, 0);
      state.stats.silences += 1;
    };
    if (delay > 0) schedule(commit, delay);
    else commit();
  }

  function distantSignal() {
    stopAll();
    primaryStopLayers('ambient', 'reel', 'signal', 'tension', 'event', 'result', 'transition');
    state.blackoutStage = 'signal';
    setMaster(.2, .14);
    playAsset('distantSignal', { slot:'blackout', duringBlackout:true, fadeIn:.24, intensity:.8 });
  }

  function reboot() {
    stopAll();
    primaryStopLayers('reel', 'signal', 'tension', 'event', 'result');
    state.blackoutStage = '';
    setMaster(1, .12);
    playAsset('restart', { slot:'event', duringBlackout:true, fadeIn:.035 });
    restorePrimaryAmbient(760);
  }

  function resetBlackout({ restoreAmbient = false } = {}) {
    if (!state.blackoutStage) return;
    state.blackoutStage = '';
    setMaster(1, .04);
    if (restoreAmbient) restorePrimaryAmbient(80);
  }

  function startSpin(detail = {}) {
    clearTimers();
    stopAll();
    resetBlackout({ restoreAmbient:true });
    state.scene = '';
    primaryStopLayers('reel', 'tension', 'event', 'result');
    const intensity = detail.tier === 'extreme' ? 1 : detail.tier === 'hot' || detail.tier === 'superhot' ? .9 : .74;
    playAsset('spin', { slot:'spin', loop:true, intensity, rate:.96 + Math.min(.08, intensity * .06), fadeIn:.12 });
  }

  function playScene(scene, beat, detail = {}) {
    const key = SCENE_ASSETS[scene];
    if (!key) return false;
    state.scene = scene;
    primaryStopLayers('reel', 'event', 'tension');
    stopSlot('spin', .12);
    if (scene === 'power-failure') {
      if (beat === 'twist') {
        reboot();
      } else {
        stopAll();
        state.blackoutStage = 'cutting';
        playAsset('powerCut', { slot:'blackout', intensity:detail.intensity ?? .9 });
        enterBlackout(680);
      }
      return true;
    }
    const offset = beat === 'twist' ? (scene === 'sports' ? 1.32 : scene === 'race' ? 1.18 : .72) : 0;
    playAsset(key, { slot:'event', intensity:detail.intensity ?? .8, offset, fadeIn:.025 });
    return true;
  }

  function handleOraclePhase(event) {
    const detail = event?.detail || {};
    state.phase = detail.phase || '';
    state.route = detail.route || state.route;
    if (!state.enabled || !state.unlocked) return;
    switch (state.phase) {
      case 'descent':
        state.stopCount = 0;
        startSpin(detail);
        break;
      case 'cruise':
      case 'signal':
      case 'anomaly':
      case 'judgment':
      case 'verdict':
        primaryStopLayers('reel');
        break;
      case 'fake':
        stopSlot('spin', .09);
        break;
      case 'revival':
        if (state.route !== 'abyssal-blackout-revival') {
          stopAll();
          resetBlackout();
          primaryStopLayers('reel', 'event', 'result', 'tension');
          playAsset('revival', { slot:'event', intensity:1, fadeIn:.02 });
        }
        break;
      case 'revealed':
        stopSlot('spin', .08);
        break;
      case 'locked':
        clearTimers();
        stopAll();
        break;
      case 'resting':
      case '':
        clearTimers();
        stopAll();
        resetBlackout({ restoreAmbient:true });
        state.scene = '';
        break;
      default:
        break;
    }
  }

  function handleOracleDraw(event) {
    const detail = event?.detail || {};
    state.route = detail.route || state.route;
    state.scene = detail.scene || state.scene;
    state.stopCount = 0;
    if (state.enabled && state.unlocked && !state.hidden) preload();
  }

  function handleOracleStop(event) {
    const detail = event?.detail || {};
    const order = Number(detail.order ?? detail.orderIndex ?? state.stopCount);
    state.stopCount = Number.isFinite(order) ? Math.max(state.stopCount, order + 1) : state.stopCount + 1;
    primaryStopLayers('reel');
    if (detail.final || detail.isLast || detail.last) stopSlot('spin', .11);
  }

  function handleOracleBeat(event) {
    const detail = event?.detail || {};
    const cue = String(detail.cue || detail.name || '');
    if (cue === 'abyssal-blackout') {
      clearTimers();
      stopAll();
      state.blackoutStage = 'cutting';
      primaryStopLayers('reel', 'event', 'result', 'tension');
      playAsset('powerCut', { slot:'blackout', intensity:.82 });
      enterBlackout(650);
      return;
    }
    if (cue === 'abyssal-distant-signal') {
      distantSignal();
      return;
    }
    if (cue === 'abyssal-reboot') {
      reboot();
      return;
    }
    if (detail.scene && playScene(String(detail.scene), String(detail.beat || 'signal'), detail)) return;
    if (BLACKOUT_CUES.has(cue)) {
      stopAll();
      state.blackoutStage = 'cutting';
      playAsset('powerCut', { slot:'blackout', intensity:detail.intensity ?? .8 });
      enterBlackout(650);
      return;
    }
    if (cue === 'revival') {
      primaryStopLayers('event', 'result', 'tension');
      playAsset('revival', { slot:'event', intensity:detail.intensity ?? 1 });
      return;
    }
    if (cue === 'crown' || /premium|jackpot|palace|gold/.test(cue)) {
      primaryStopLayers('event', 'result');
      stopSlot('spin', .09);
      playAsset('premium', { slot:'event', intensity:detail.intensity ?? .9 });
    }
  }

  function handleOracleResult(event) {
    const detail = event?.detail || {};
    stopSlot('spin', .08);
    const result = detail.result || {};
    const kind = detail.resultKind || detail.kind || result.kind || '';
    const effect = detail.effect || result.effect || '';
    const tier = detail.tier || '';
    const premium = kind === 'win' && (
      tier === 'jackpot' || tier === 'extreme' || PREMIUM_EFFECTS.has(effect)
      || /jackpot|palace|golden|audience|4810/.test(String(detail.route || state.route))
    );
    if (!premium) return;
    stopAll();
    resetBlackout();
    primaryStopLayers('reel', 'signal', 'tension', 'event', 'result');
    playAsset('jackpot', { slot:'result', intensity:1, fadeIn:.012 });
  }

  function handleOracleCinematic(event) {
    const detail = event?.detail || {};
    const action = String(detail.action || detail.cue || detail.phase || detail.scene || '').toLowerCase();
    if (/blackout|power-cut|shutdown/.test(action)) {
      clearTimers();
      stopAll();
      state.blackoutStage = 'cutting';
      primaryStopLayers('reel', 'event', 'result', 'tension');
      playAsset('powerCut', { slot:'blackout', intensity:detail.intensity ?? .9 });
      enterBlackout(Number(detail.delayMs) || 650);
    } else if (/distant-signal|far-signal/.test(action) || (detail.trueBlackout && action === 'signal')) {
      distantSignal();
    } else if (/reboot|restart/.test(action)) {
      reboot();
    } else if (/revival/.test(action)) {
      stopAll();
      resetBlackout();
      primaryStopLayers('reel', 'event', 'result', 'tension');
      playAsset('revival', { slot:'event', intensity:detail.intensity ?? 1 });
    } else if (/jackpot/.test(action)) {
      stopAll();
      resetBlackout();
      primaryStopLayers('reel', 'event', 'result', 'tension');
      playAsset('jackpot', { slot:'result', intensity:detail.intensity ?? 1 });
    } else if (/premium|crown/.test(action)) {
      playAsset('premium', { slot:'event', intensity:detail.intensity ?? .9 });
    } else if (/sports|goal/.test(action)) {
      playScene('sports', detail.beat || 'signal', detail);
    } else if (/race/.test(action)) {
      playScene('race', detail.beat || 'signal', detail);
    }
  }

  function syncSoundState(event) {
    const detail = event?.detail || readPrimarySnapshot();
    state.enabled = Boolean(detail.enabled);
    state.unlocked = Boolean(detail.unlocked);
    state.hidden = Boolean(detail.hidden ?? document.hidden);
    state.volume = clamp(detail.volume ?? state.volume);
    state.page = detail.page || state.page;
    if (!state.enabled || state.hidden) {
      clearTimers();
      stopAll();
      resetBlackout();
      if (context?.state === 'running') context.suspend().catch(() => {});
      return;
    }
    if (state.unlocked) {
      ensureContext().then(ready => {
        if (!ready) return;
        setMaster(state.blackoutStage === 'silent' ? 0 : state.blackoutStage === 'signal' ? .2 : 1, .03);
        preload();
      });
    }
  }

  function handlePageChange(event) {
    state.page = event?.detail?.page || document.body?.dataset?.page || 'home';
    state.route = '';
    state.phase = 'resting';
    state.scene = '';
    clearTimers();
    stopAll();
    resetBlackout();
  }

  function handleVisibility() {
    state.hidden = Boolean(document.hidden);
    if (state.hidden) {
      clearTimers();
      stopAll();
      resetBlackout();
      if (context?.state === 'running') context.suspend().catch(() => {});
      return;
    }
    const primary = readPrimarySnapshot();
    state.enabled = Boolean(primary.enabled);
    state.unlocked = Boolean(primary.unlocked);
    if (state.enabled && state.unlocked) ensureContext().then(() => preload());
  }

  function handleTrustedGesture(event) {
    if (event?.isTrusted === false) return;
    const soundControl = event.target?.closest?.('#kingdom-sound-control');
    const primary = readPrimarySnapshot();
    if (!soundControl && !primary.enabled) return;
    state.unlocked = true;
    ensureContext({ force:true }).then(() => {
      if (state.enabled || soundControl) preload();
    });
  }

  function snapshot() {
    return Object.freeze({
      version:VERSION,
      enabled:state.enabled,
      unlocked:state.unlocked,
      hidden:state.hidden,
      volume:state.volume,
      page:state.page,
      route:state.route,
      phase:state.phase,
      scene:state.scene,
      stopCount:state.stopCount,
      contextState:context?.state || 'uncreated',
      blackoutStage:state.blackoutStage,
      masterGain:master?.gain?.value ?? 0,
      loadedAssets:buffers.size,
      activeAssets:Object.freeze(Array.from(active.values(), entry => entry.key)),
      recentAssets:Object.freeze(playedKeys.slice()),
      pendingTimers:timers.size,
      stats:Object.freeze({ ...state.stats })
    });
  }

  const api = Object.freeze({
    version:VERSION,
    assets:Object.freeze(Object.fromEntries(Object.entries(ASSETS).map(([key, value]) => [key, new URL(value.file, BASE_PATH).href]))),
    scenes:SCENE_ASSETS,
    preload,
    play:(key, options) => playAsset(key, options),
    stop:() => { clearTimers(); stopAll(); resetBlackout(); },
    snapshot
  });
  window.NaokingRoyalOracleAudio = api;

  window.addEventListener('naoking:soundstate', syncSoundState);
  window.addEventListener('naoking:oracledraw', handleOracleDraw);
  window.addEventListener('naoking:oraclephase', handleOraclePhase);
  window.addEventListener('naoking:oraclebeat', handleOracleBeat);
  window.addEventListener('naoking:oraclestop', handleOracleStop);
  window.addEventListener('naoking:oracleresult', handleOracleResult);
  window.addEventListener('naoking:oraclecinematic', handleOracleCinematic);
  window.addEventListener('naoking:pagechange', handlePageChange);
  document.addEventListener('visibilitychange', handleVisibility);
  document.addEventListener('pointerdown', handleTrustedGesture, { capture:true, passive:true });
  document.addEventListener('keydown', handleTrustedGesture, { capture:true });
  window.addEventListener('pagehide', () => {
    clearTimers();
    stopAll();
    if (context?.state === 'running') context.suspend().catch(() => {});
  });

  if (state.enabled && state.unlocked && !state.hidden) ensureContext().then(() => preload());
})();
