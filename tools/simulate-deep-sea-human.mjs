import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const GAME_SOURCE = fs.readFileSync(path.join(HERE, '..', 'deep-sea-game.js'), 'utf8');
const phaseMatch = GAME_SOURCE.match(/const PHASES = \[([\s\S]*?)\n\s*\];/);
if (!phaseMatch) throw new Error('PHASES configuration was not found.');

const PHASES = [...phaseMatch[1].matchAll(/\{([^}]+)\}/g)].map((entry) =>
  Object.fromEntries([...entry[1].matchAll(/(\w+)\s*:\s*([\d.]+)/g)].map((pair) => [pair[1], Number(pair[2])]))
);
if (PHASES.length !== 5) throw new Error(`Expected 5 phases, found ${PHASES.length}.`);

function sourceNumber(name) {
  const match = GAME_SOURCE.match(new RegExp(`const ${name} = ([\\d.]+);`));
  if (!match) throw new Error(`${name} configuration was not found.`);
  return Number(match[1]);
}

const phaseTimesMatch = GAME_SOURCE.match(/const PHASE_TIMES = \[([^\]]+)\];/);
if (!phaseTimesMatch) throw new Error('PHASE_TIMES configuration was not found.');
const PHASE_TIMES = phaseTimesMatch[1].split(',').map(Number);
const DOUBLE_GATE_OFFSET = sourceNumber('DOUBLE_GATE_OFFSET');
const SWEEP_GATE_OFFSET = sourceNumber('SWEEP_GATE_OFFSET');
const LATE_SPEED_RAMP = sourceNumber('LATE_SPEED_RAMP');

const WORLD = { width: 960, height: 540 };
const PLAYER = { width: 112, height: 62, y: WORLD.height - 92 };
const GAME_DURATION = 30;
const OXYGEN_START = 78;
const DT = 1 / 120;
const RUNS = Number(process.env.NAOKING_SIM_RUNS || 12000);

const MODELS = [
  { name: 'first-play', reaction: 0.44, reactionJitter: 0.15, decision: 0.19, aimNoise: 25, mistake: 0.045, riskThreshold: 74, controlGain: 4.2 },
  { name: 'learning', reaction: 0.31, reactionJitter: 0.11, decision: 0.13, aimNoise: 16, mistake: 0.021, riskThreshold: 88, controlGain: 5.1 },
  { name: 'practiced', reaction: 0.22, reactionJitter: 0.07, decision: 0.09, aimNoise: 9, mistake: 0.008, riskThreshold: 96, controlGain: 6.1 },
  { name: 'expert', reaction: 0.14, reactionJitter: 0.04, decision: 0.055, aimNoise: 4, mistake: 0.002, riskThreshold: 100, controlGain: 7.2 },
  { name: 'near-optimal', reaction: 0.045, reactionJitter: 0.01, decision: 0.02, aimNoise: 0.7, mistake: 0, riskThreshold: 100, controlGain: 9.5 }
];

function mulberry32(seed) {
  return () => {
    let value = seed += 0x6d2b79f5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function clamp(value, minimum, maximum) { return Math.max(minimum, Math.min(maximum, value)); }
function phaseIndex(time) {
  if (time >= PHASE_TIMES[3]) return 4;
  if (time >= PHASE_TIMES[2]) return 3;
  if (time >= PHASE_TIMES[1]) return 2;
  if (time >= PHASE_TIMES[0]) return 1;
  return 0;
}
function hazardHeight(type) { return type === 'netGate' ? 68 : type === 'mineGate' ? 58 : 64; }
function normal(random) {
  const u = Math.max(Number.EPSILON, random());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
}

function run(seed, model) {
  const random = mulberry32(seed);
  let time = 0;
  let oxygen = OXYGEN_START;
  let playerX = WORLD.width / 2;
  let velocityX = 0;
  let input = 0;
  let nextDecision = 0;
  let nextPattern = 1.95;
  let lastSafeX = WORLD.width / 2;
  let recentPatterns = [];
  let currentUntil = 0;
  let currentStrength = 0;
  let collectedRisk = 0;
  const events = [];
  const pendingCurrents = [];
  const death = { cause: 'clear', time: GAME_DURATION };

  function chooseGap(forceShift = true, shiftLimit = null) {
    const phase = PHASES[phaseIndex(time)];
    const maximumShift = shiftLimit ?? phase.shift;
    let shift = (random() * 2 - 1) * maximumShift;
    if (forceShift && Math.abs(shift) < Math.min(105, maximumShift * 0.68)) {
      const minimumShift = Math.min(105, maximumShift * 0.68);
      shift = (shift < 0 ? -1 : 1) * (minimumShift + random() * (maximumShift - minimumShift));
    }
    const edge = phase.gap / 2 + 46;
    lastSafeX = clamp(lastSafeX + shift, edge, WORLD.width - edge);
    return { gapX: lastSafeX, gapWidth: phase.gap };
  }

  function addGate(start, type, speed, gap, reward = false, rewardBoost = 0) {
    const warning = PHASES[phaseIndex(start)].warning;
    const height = hazardHeight(type);
    const playerHitHeight = PLAYER.height * 0.56;
    const collisionDistance = PLAYER.y + height - (height + playerHitHeight) / 2;
    const spawnTime = start + warning;
    const hitTime = spawnTime + collisionDistance / speed;
    const phase = PHASES[phaseIndex(start)];
    const playerHitHalf = PLAYER.width * 0.61 / 2;
    const safeOffset = clamp(gap.gapWidth / 2 - playerHitHalf - 6, 28, 50);
    const riskX = reward ? gap.gapX + safeOffset * (random() < 0.5 ? -1 : 1) : null;
    const reactionAt = start + Math.max(0.06, model.reaction + normal(random) * model.reactionJitter);
    const riskReactionAt = spawnTime + Math.max(0.05, model.reaction * 0.72 + normal(random) * model.reactionJitter * 0.55);
    events.push({
      type, speed, ...gap, reward, rewardBoost, riskX, spawnTime, hitTime, reactionAt, riskReactionAt,
      aimBias: normal(random) * model.aimNoise, resolved: false
    });
    return { warning, height };
  }

  function spawnPattern() {
    const phaseNo = phaseIndex(time);
    const phase = PHASES[phaseNo];
    const pool = ['rock-gate', 'mine-gate', 'net-gate'];
    if (phaseNo >= 1) pool.push('double-gate');
    if (phaseNo >= 2) pool.push('current-gate');
    if (phaseNo >= 3) pool.push('sweep-gate');
    const fresh = pool.filter((name) => !recentPatterns.includes(name));
    const candidates = fresh.length ? fresh : pool;
    const pattern = candidates[Math.floor(random() * candidates.length)];
    recentPatterns.push(pattern);
    if (recentPatterns.length > 3) recentPatterns.shift();
    const speed = phase.speed + random() * 18 + Math.max(0, time - PHASE_TIMES[3]) * LATE_SPEED_RAMP;
    let lastType = 'rockGate';
    let lastSpeed = speed;
    let lastOffset = 0;

    if (pattern === 'rock-gate') addGate(time, 'rockGate', speed, chooseGap(), true);
    else if (pattern === 'mine-gate') {
      lastType = 'mineGate'; lastSpeed = speed + 18;
      addGate(time, lastType, lastSpeed, chooseGap(), true);
    } else if (pattern === 'net-gate') {
      lastType = 'netGate'; lastSpeed = speed + 8;
      addGate(time, lastType, lastSpeed, chooseGap(), true);
    } else if (pattern === 'double-gate') {
      addGate(time, 'rockGate', speed, chooseGap(), false);
      lastOffset = DOUBLE_GATE_OFFSET;
      lastType = random() < 0.5 ? 'netGate' : 'rockGate';
      addGate(time + lastOffset, lastType, speed, chooseGap(true, 155), true, 4);
    } else if (pattern === 'current-gate') {
      const direction = random() < 0.5 ? -1 : 1;
      pendingCurrents.push({ at: time + phase.warning, until: time + phase.warning + 2.35, strength: direction * phase.current });
      lastType = 'netGate';
      addGate(time + 0.2, lastType, speed, chooseGap(), true, 3);
      lastOffset = 0.2;
    } else {
      lastType = 'netGate'; lastOffset = SWEEP_GATE_OFFSET * 2;
      addGate(time, 'mineGate', speed, chooseGap(), false);
      addGate(time + SWEEP_GATE_OFFSET, 'rockGate', speed, chooseGap(true, 145), false);
      addGate(time + lastOffset, lastType, speed, chooseGap(true, 145), true, 8);
    }

    const height = hazardHeight(lastType);
    const playerHitHeight = PLAYER.height * 0.56;
    const distanceUntilClear = PLAYER.y + (height + playerHitHeight) / 2 + height;
    nextPattern = time + lastOffset + phase.warning + distanceUntilClear / (lastSpeed * 0.84) + 0.16;
  }

  while (time < GAME_DURATION) {
    const phase = PHASES[phaseIndex(time)];
    oxygen -= phase.drain * DT;
    if (oxygen <= 0) { death.cause = 'oxygen'; death.time = time; break; }
    if (time >= nextPattern) spawnPattern();

    for (const flow of pendingCurrents) {
      if (time >= flow.at && time < flow.until) { currentUntil = flow.until; currentStrength = flow.strength; }
    }
    if (time >= currentUntil) currentStrength = 0;

    if (time >= nextDecision) {
      nextDecision = time + model.decision * (0.72 + random() * 0.56);
      const targetEvent = events
        .filter((event) => !event.resolved && event.hitTime >= time && event.reactionAt <= time)
        .sort((a, b) => a.hitTime - b.hitTime)[0];
      let targetX = WORLD.width / 2;
      if (targetEvent) {
        const pursueRisk = targetEvent.reward && oxygen <= model.riskThreshold && time >= targetEvent.riskReactionAt;
        targetX = (pursueRisk ? targetEvent.riskX : targetEvent.gapX) + targetEvent.aimBias;
      }
      const error = targetX - playerX;
      const desiredVelocity = clamp(error * model.controlGain, -465, 465);
      const velocityError = desiredVelocity - velocityX;
      input = Math.abs(error) < 6 + model.aimNoise * 0.1 && Math.abs(velocityX) < 38
        ? 0
        : Math.sign(velocityError);
      if (random() < model.mistake) input *= -1;
    }

    const acceleration = 1500;
    const maxSpeed = 465;
    velocityX += input * acceleration * DT;
    velocityX *= Math.pow(input ? 0.16 : 0.009, DT);
    velocityX = clamp(velocityX, -maxSpeed, maxSpeed);
    playerX += (velocityX + currentStrength) * DT;
    playerX = clamp(playerX, PLAYER.width / 2 + 12, WORLD.width - PLAYER.width / 2 - 12);

    for (const event of events) {
      if (event.resolved || time < event.hitTime) continue;
      event.resolved = true;
      const safeTolerance = (event.gapWidth - PLAYER.width * 0.61) / 2;
      if (Math.abs(playerX - event.gapX) >= safeTolerance) {
        death.cause = event.type;
        death.time = time;
        break;
      }
      if (event.reward && Math.abs(playerX - event.riskX) < (24 + PLAYER.width * 0.12) / 2) {
        oxygen = clamp(oxygen + PHASES[phaseIndex(time)].reward + event.rewardBoost, 0, 100);
        collectedRisk += 1;
      }
    }
    if (death.cause !== 'clear') break;
    time += DT;
  }
  return { ...death, risk: collectedRisk, oxygen: Math.max(0, oxygen) };
}

function percentile(sorted, p) { return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))]; }

console.log(`Deep-sea human simulation: ${RUNS.toLocaleString()} runs/model, deterministic seed range, regular pickups/crown ignored`);
console.log('PHASES', JSON.stringify(PHASES));
const playerHitWidth = PLAYER.width * 0.61;
console.log('REACHABILITY', JSON.stringify(PHASES.map((phase, index) => {
  const lateRamp = index === PHASES.length - 1 ? (GAME_DURATION - PHASE_TIMES[3]) * LATE_SPEED_RAMP : 0;
  const worstMineSpeed = phase.speed + 36 + lateRamp;
  const mineHeight = hazardHeight('mineGate');
  const playerHitHeight = PLAYER.height * 0.56;
  const collisionDistance = PLAYER.y + mineHeight - (mineHeight + playerHitHeight) / 2;
  const decisionWindow = phase.warning + collisionDistance / worstMineSpeed;
  const requiredAverageSpeed = phase.shift / decisionWindow;
  return {
    phase: index + 1,
    decisionWindow: Number(decisionWindow.toFixed(3)),
    maximumShift: phase.shift,
    requiredAverageSpeed: Number(requiredAverageSpeed.toFixed(1)),
    againstCurrentMargin: Number((465 - phase.current - requiredAverageSpeed).toFixed(1)),
    safeCenterTolerance: Number(((phase.gap - playerHitWidth) / 2).toFixed(1))
  };
})));
for (const [modelIndex, model] of MODELS.entries()) {
  const results = Array.from({ length: RUNS }, (_, index) => run(0x51a7 + modelIndex * 1000003 + index * 97, model));
  const times = results.map((result) => result.time).sort((a, b) => a - b);
  const clear = results.filter((result) => result.cause === 'clear').length;
  const oxygen = results.filter((result) => result.cause === 'oxygen').length;
  const riskAverage = results.reduce((sum, result) => sum + result.risk, 0) / results.length;
  console.log(JSON.stringify({
    model: model.name,
    clearRate: Number((clear / results.length * 100).toFixed(2)),
    oxygenDeathRate: Number((oxygen / results.length * 100).toFixed(2)),
    survivalP25: Number(percentile(times, 0.25).toFixed(2)),
    survivalMedian: Number(percentile(times, 0.5).toFixed(2)),
    survivalP75: Number(percentile(times, 0.75).toFixed(2)),
    averageRiskFood: Number(riskAverage.toFixed(2))
  }));
}

let oxygen = OXYGEN_START;
let oxygenTime = 0;
while (oxygen > 0 && oxygenTime < GAME_DURATION) {
  oxygen -= PHASES[phaseIndex(oxygenTime)].drain * DT;
  oxygenTime += DT;
}
console.log(JSON.stringify({ noFoodOxygenDeathSeconds: Number(oxygenTime.toFixed(3)) }));
