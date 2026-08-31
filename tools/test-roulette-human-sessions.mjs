import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const SESSION_SPINS = 100;
const SESSION_SEEDS = Object.freeze([
  4810, 20260831, 73, 99991, 42, 314159,
  271828, 8675309, 13579, 24680, 777, 65537
]);

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
      setProperty:(name, value) => properties.set(name, String(value)),
      removeProperty:name => properties.delete(name),
      getPropertyValue:name => properties.get(name) || ''
    };
  }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = [...children]; }
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

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Injected only into the test VM. Production source and probabilities remain untouched.
const diagnosticHook = String.raw`
  function runHumanSessionDiagnostics(iterations = 100) {
    const sampleSize = Math.max(1, Math.min(1000, Math.floor(Number(iterations) || 100)));
    const snapshot = snapshotDrawState();
    const cinematicRoutes = new Set([
      'crown-goal-challenge', 'naoking-race', 'machine-power-cycle', 'power-failure',
      'abyssal-blackout-revival', 'abyss-dawn-jackpot', 'golden-ocean-jackpot',
      'fish-celebration-jackpot', 'naoking-overload-jackpot', 'small-fish-school',
      'royal-fish-school', 'golden-fish-school', 'abyss-fish-school', 'naoking-school-overload'
    ]);
    const counts = { soccer:0, race:0, powerFailure:0, trueBlackout:0, fishSchool:0, fullAnimation:0, siteWide:0, jackpot:0, textOnly:0 };
    const resultKinds = { normal:0, win:0, loss:0 };
    const routes = {};
    const formats = {};
    let lastResult = '';
    let lastRoute = '';
    let rareDrought = 0;
    let previousFormat = '';
    let currentRun = 0;
    let longestRun = 0;
    let longestFormat = '';
    try {
      normalHistory.splice(0);
      presentationHistory.splice(0);
      presentationCategoryHistory.splice(0);
      presentationFormatHistory.splice(0);
      messageBags.clear();
      lastMessageByResult.clear();
      spinsSinceWin = 0;
      for (let index = 0; index < sampleSize; index += 1) {
        const result = resolveFinalResult();
        const presentation = choosePresentation(result, {
          spinNumber:index + 1,
          isFirstToday:index === 0,
          lastResult,
          lastRoute,
          rareDrought
        }, true);
        const category = presentation.category || presentationCategory(presentation);
        const isPowerFailure = ['machine-power-cycle', 'power-failure', 'abyssal-blackout-revival'].includes(presentation.id);
        const isFishSchool = Boolean(presentation.fishSchool || presentation.family === 'fish-school');
        const isJackpot = presentation.family === 'premium' || presentation.family === 'secret' || category === 'jackpot-family';
        const isFullAnimation = Boolean(presentation.scene || cinematicRoutes.has(presentation.id));
        const isSiteWide = Boolean(presentation.blackout || presentation.premium || isFishSchool);
        const isTextOnly = category === 'text-cutin';
        if (presentation.id === 'crown-goal-challenge') counts.soccer += 1;
        if (presentation.id === 'naoking-race') counts.race += 1;
        if (isPowerFailure) counts.powerFailure += 1;
        if (presentation.id === 'abyssal-blackout-revival') counts.trueBlackout += 1;
        if (isFishSchool) counts.fishSchool += 1;
        if (isFullAnimation) counts.fullAnimation += 1;
        if (isSiteWide) counts.siteWide += 1;
        if (isJackpot) counts.jackpot += 1;
        if (isTextOnly) counts.textOnly += 1;
        resultKinds[result.kind] += 1;
        routes[presentation.id] = (routes[presentation.id] || 0) + 1;

        const format = presentation.id === 'crown-goal-challenge' ? 'soccer'
          : presentation.id === 'naoking-race' ? 'race'
          : isPowerFailure ? 'power-failure'
          : isFishSchool ? 'fish-school'
          : isJackpot ? 'jackpot'
          : isFullAnimation ? 'full-animation'
          : isSiteWide ? 'site-wide'
          : isTextOnly ? 'text-only'
          : category;
        formats[format] = (formats[format] || 0) + 1;
        if (format === previousFormat) currentRun += 1;
        else { previousFormat = format; currentRun = 1; }
        if (currentRun > longestRun) { longestRun = currentRun; longestFormat = format; }

        lastResult = result.key;
        lastRoute = presentation.id;
        rareDrought = result.kind === 'win' ? 0 : rareDrought + 1;
      }
    } finally {
      restoreDrawState(snapshot);
    }
    return Object.freeze({
      spins:sampleSize,
      counts:Object.freeze(counts),
      resultKinds:Object.freeze(resultKinds),
      routes:Object.freeze(routes),
      formats:Object.freeze(formats),
      longestConsecutiveSamePerceivedFormat:longestRun,
      longestConsecutiveFormat:longestFormat
    });
  }

`;

const selectors = new Map([
  ['#card', new Element()], ['#slot', new Element()], ['#reel', new Element()],
  ['#fortune-name', new Element()], ['#message', new Element()], ['#roulette-status', new Element()],
  ['#spin', new Element()], ['#blast', new Element()], ['#fortune-history', new Element()],
  ['.result', new Element()]
]);

const rawExpansionSource = fs.readFileSync(new URL('../roulette-entertainment.js', import.meta.url), 'utf8');
const rawControllerSource = fs.readFileSync(new URL('../roulette-controller.js', import.meta.url), 'utf8');
const testOnlyWeightOverrides = Object.freeze(JSON.parse(process.env.NAOKING_TEST_ROUTE_WEIGHTS || '{}'));
const tunedSources = Object.entries(testOnlyWeightOverrides).reduce((sources, [routeId, rawWeight]) => {
  const weight = Number(rawWeight);
  assert.ok(Number.isFinite(weight) && weight > 0, `Invalid test-only weight for ${routeId}.`);
  const escapedId = routeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = `(id:'${escapedId}'[^\\n]*?weight:)([0-9.]+)`;
  const matcher = new RegExp(pattern);
  const matches = [sources.expansion, sources.controller]
    .reduce((count, source) => count + [...source.matchAll(new RegExp(pattern, 'g'))].length, 0);
  assert.equal(matches, 1, `Could not locate one weight for ${routeId}.`);
  return {
    expansion:sources.expansion.replace(matcher, `$1${weight}`),
    controller:sources.controller.replace(matcher, `$1${weight}`)
  };
}, { expansion:rawExpansionSource, controller:rawControllerSource });
const expansionSource = tunedSources.expansion;
const controllerSource = tunedSources.controller;
const diagnosticAnchor = '  function runDiagnostics(iterations = 10000) {';
const exportAnchor = 'runDiagnostics, runMessageBagDiagnostics, runPresentationDiagnostics, runCutinDiagnostics';

assert.equal(controllerSource.split(diagnosticAnchor).length - 1, 1, 'Could not locate the diagnostic insertion point.');
assert.equal(controllerSource.split(exportAnchor).length - 1, 1, 'Could not locate the debug export insertion point.');

const instrumentedControllerSource = controllerSource
  .replace(diagnosticAnchor, `${diagnosticHook}\n${diagnosticAnchor}`)
  .replace(exportAnchor, `${exportAnchor}, runHumanSessionDiagnostics`);

function createSessionContext(seed) {
  const sessionSelectors = new Map([...selectors].map(([key]) => [key, new Element()]));
  const windowListeners = new Map();
  const documentListeners = new Map();
  const seededMath = Object.create(Math);
  seededMath.random = mulberry32(seed);

  class CustomEventMock {
    constructor(type, init = {}) { this.type = type; this.detail = init.detail || {}; }
  }

  const windowMock = {
    setTimeout,
    clearTimeout,
    CustomEvent:CustomEventMock,
    location:{ hostname:'localhost', search:'' },
    innerWidth:1280,
    matchMedia:() => ({ matches:false, addEventListener() {}, removeEventListener() {} }),
    addEventListener(type, listener) {
      const listeners = windowListeners.get(type) || [];
      listeners.push(listener);
      windowListeners.set(type, listeners);
    },
    dispatchEvent(event) {
      (windowListeners.get(event.type) || []).forEach(listener => listener(event));
      return true;
    }
  };

  const documentMock = {
    hidden:false,
    documentElement:new Element(),
    body:new Element(),
    querySelector:selector => sessionSelectors.get(selector) || null,
    createElement:() => new Element(),
    createDocumentFragment:() => new Element(),
    addEventListener(type, listener) {
      const listeners = documentListeners.get(type) || [];
      listeners.push(listener);
      documentListeners.set(type, listeners);
    }
  };

  const context = {
    window:windowMock,
    document:documentMock,
    console,
    Math:seededMath,
    Map,
    Set,
    Object,
    Date
  };

  vm.runInNewContext(expansionSource, context, { filename:'roulette-entertainment.js' });
  vm.runInNewContext(instrumentedControllerSource, context, { filename:'roulette-controller.js' });
  return { context, windowMock };
}

function runSession(seed) {
  const { windowMock } = createSessionContext(seed);
  const debug = windowMock.NaokingRouletteDebug;
  assert.ok(debug, `Debug interface was not installed for seed ${seed}.`);
  assert.equal(typeof debug.runHumanSessionDiagnostics, 'function', 'Human-session diagnostic hook was not exported.');
  const diagnostic = debug.runHumanSessionDiagnostics(SESSION_SPINS);
  assert.equal(diagnostic.spins, SESSION_SPINS, `Seed ${seed} did not complete ${SESSION_SPINS} spins.`);
  assert.equal(Object.values(diagnostic.resultKinds).reduce((sum, count) => sum + count, 0), SESSION_SPINS, `Seed ${seed} lost a result.`);
  assert.equal(Object.values(diagnostic.formats).reduce((sum, count) => sum + count, 0), SESSION_SPINS, `Seed ${seed} lost a perceived format.`);
  return Object.freeze({ seed, ...diagnostic });
}

const sessions = SESSION_SEEDS.map(runSession);
const metricNames = Object.keys(sessions[0].counts);
const countSummary = Object.fromEntries(metricNames.map(metric => {
  const values = sessions.map(session => session.counts[metric]);
  const total = values.reduce((sum, value) => sum + value, 0);
  return [metric, Object.freeze({
    total,
    averagePer100:Number((total / sessions.length).toFixed(2)),
    minimum:Math.min(...values),
    maximum:Math.max(...values),
    zeroSessions:values.filter(value => value === 0).length
  })];
}));

const resultKinds = { normal:0, win:0, loss:0 };
const formatTotals = {};
const routeTotals = {};
for (const session of sessions) {
  Object.entries(session.resultKinds).forEach(([kind, count]) => { resultKinds[kind] += count; });
  Object.entries(session.formats).forEach(([format, count]) => { formatTotals[format] = (formatTotals[format] || 0) + count; });
  Object.entries(session.routes).forEach(([route, count]) => { routeTotals[route] = (routeTotals[route] || 0) + count; });
}

const longestSession = sessions.reduce((longest, session) => (
  session.longestConsecutiveSamePerceivedFormat > longest.longestConsecutiveSamePerceivedFormat ? session : longest
));
const flagshipZeroSessions = sessions.filter(session => (
  session.counts.soccer + session.counts.race + session.counts.powerFailure === 0
)).map(session => session.seed);
const flagshipTrueBlackoutZeroSessions = sessions.filter(session => (
  session.counts.soccer + session.counts.race + session.counts.trueBlackout === 0
)).map(session => session.seed);

const report = Object.freeze({
  deterministic:true,
  productionProbabilitiesModified:false,
  testOnlyWeightOverrides,
  sessionCount:sessions.length,
  spinsPerSession:SESSION_SPINS,
  totalSpins:sessions.length * SESSION_SPINS,
  sessions:Object.freeze(sessions.map(session => Object.freeze({
    seed:session.seed,
    ...session.counts,
    longestSameFormat:session.longestConsecutiveSamePerceivedFormat,
    longestFormat:session.longestConsecutiveFormat
  }))),
  aggregate:Object.freeze({
    counts:Object.freeze(countSummary),
    resultKinds:Object.freeze(resultKinds),
    perceivedFormats:Object.freeze(Object.fromEntries(Object.entries(formatTotals).sort((a, b) => b[1] - a[1]))),
    flagshipRoutes:Object.freeze({
      'crown-goal-challenge':routeTotals['crown-goal-challenge'] || 0,
      'naoking-race':routeTotals['naoking-race'] || 0,
      'machine-power-cycle':routeTotals['machine-power-cycle'] || 0,
      'power-failure':routeTotals['power-failure'] || 0,
      'abyssal-blackout-revival':routeTotals['abyssal-blackout-revival'] || 0
    }),
    sessionsWithoutSoccerRaceOrPower:Object.freeze(flagshipZeroSessions),
    sessionsWithoutSoccerRaceOrTrueBlackout:Object.freeze(flagshipTrueBlackoutZeroSessions),
    longestSamePerceivedFormat:Object.freeze({
      count:longestSession.longestConsecutiveSamePerceivedFormat,
      format:longestSession.longestConsecutiveFormat,
      seed:longestSession.seed
    })
  })
});

assert.deepEqual(
  flagshipZeroSessions,
  [],
  'A 100-spin session missed every flagship presentation (soccer, race, and power failure).'
);
assert.equal(countSummary.race.zeroSessions, 0, 'Race must remain discoverable in every sampled 100-spin session.');
assert.equal(countSummary.powerFailure.zeroSessions, 0, 'Power Failure must remain discoverable in every sampled 100-spin session.');
assert.ok(countSummary.trueBlackout.total >= 6, 'The dedicated true-blackout revival route became effectively invisible.');
assert.ok(
  longestSession.longestConsecutiveSamePerceivedFormat <= 4,
  `A perceived presentation format repeated ${longestSession.longestConsecutiveSamePerceivedFormat} times in a row.`
);
assert.ok(resultKinds.normal >= 780 && resultKinds.normal <= 900, 'Normal-result frequency drifted unexpectedly.');
assert.ok(resultKinds.win >= 180 && resultKinds.win <= 300, 'Win frequency drifted unexpectedly.');
assert.ok(resultKinds.loss >= 70 && resultKinds.loss <= 160, 'Loss frequency drifted unexpectedly.');

console.log(JSON.stringify(report, null, 2));
