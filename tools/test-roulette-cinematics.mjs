import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const repo = resolve(import.meta.dirname, '..');
const moduleRoot = process.env.CODEX_NODE_MODULES;
assert.ok(moduleRoot, 'set CODEX_NODE_MODULES to the bundled node_modules directory');
const { chromium } = await import(pathToFileURL(join(moduleRoot, 'playwright', 'index.mjs')).href);
const chrome = process.env.NAOKING_CHROME;
const baseUrl = process.env.NAOKING_TEST_URL || '';
const screenshotDir = process.env.RO_CINEMATIC_SCREENSHOTS ? resolve(process.env.RO_CINEMATIC_SCREENSHOTS) : '';
if (screenshotDir) mkdirSync(screenshotDir, { recursive:true });
const browser = await chromium.launch({ headless:true, ...(chrome ? { executablePath:chrome } : {}) });
const requiredAssets = [
  'naoking-run-1.svg', 'naoking-run-2.svg', 'naoking-run-3.svg', 'naoking-kick-ready.svg',
  'naoking-kick.svg', 'naoking-celebrate.svg', 'naoking-defeat.svg', 'naoking-keeper.svg',
  'crown-ball.svg', 'goal.svg', 'race-gate.svg', 'fish.svg', 'emergency-lamp.svg',
  'naoking-soccer-sprites.webp', 'naoking-race-sprites.webp'
];
requiredAssets.forEach(file => assert.equal(existsSync(join(repo, 'assets', 'oracle-cinematics', file)), true, `${file} is required`));

async function exercise(width, height) {
  const context = await browser.newContext({ viewport:{ width, height }, reducedMotion:'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  if (baseUrl) {
    await page.goto(baseUrl, { waitUntil:'domcontentloaded', timeout:15000 });
    await page.waitForFunction(() => Boolean(window.RoyalOracleCinematics));
  } else {
    await page.setContent('<!doctype html><html><body><main style="min-height:200vh"></main></body></html>');
    await page.addStyleTag({ path:join(repo, 'roulette-cinematics.css') });
    await page.addScriptTag({ path:join(repo, 'roulette-cinematics.js') });
  }

  const contract = await page.evaluate(() => ({
    version:window.RoyalOracleCinematics?.version,
    routeCount:window.RoyalOracleCinematics?.supportedRoutes.length,
    assetCount:window.RoyalOracleCinematics?.assets.length
  }));
  assert.equal(contract.version, '1.0.0');
  assert.ok(contract.routeCount >= 14);
  assert.equal(contract.assetCount, requiredAssets.length);

  await page.evaluate(() => window.dispatchEvent(new CustomEvent('naoking:oracledraw', { detail:{ route:'crown-goal-challenge', family:'full-event', tier:'hot' } })));
  await page.waitForFunction(() => document.querySelector('.ro-scene-soccer')?.classList.contains('is-visible'));
  let state = await page.evaluate(() => ({
    racers:document.querySelectorAll('.ro-soccer-player').length,
    ball:document.querySelectorAll('.ro-crown-ball').length,
    goal:document.querySelectorAll('.ro-soccer-goal').length,
    generatedFrames:document.querySelectorAll('.ro-soccer-sheet').length,
    overflow:document.documentElement.scrollWidth - innerWidth
  }));
  assert.deepEqual({ racers:state.racers, ball:state.ball, goal:state.goal }, { racers:1, ball:1, goal:1 });
  assert.ok(state.generatedFrames >= 4);
  assert.ok(state.overflow <= 1, `${width}px soccer overflow must stay clipped`);
  await page.evaluate(() => window.RoyalOracleCinematics.resolve('win', 'crown'));
  assert.equal(await page.locator('.ro-cinematic').getAttribute('data-stage'), 'soccer-goal');
  if (screenshotDir) await page.screenshot({ path:join(screenshotDir, `soccer-${width}.png`) });
  await page.evaluate(() => window.RoyalOracleCinematics.stop());

  await page.evaluate(() => window.RoyalOracleCinematics.play('naoking-race'));
  await page.waitForSelector('.ro-scene-race.is-visible');
  state = await page.evaluate(() => ({ racers:document.querySelectorAll('.ro-racer').length, gate:document.querySelectorAll('.ro-race-gate').length, generatedFrames:document.querySelectorAll('.ro-race-sheet').length }));
  assert.deepEqual({ racers:state.racers, gate:state.gate }, { racers:5, gate:1 });
  assert.equal(state.generatedFrames, 5);
  await page.evaluate(() => window.RoyalOracleCinematics.resolve('loss', 'net'));
  assert.equal(await page.locator('.ro-cinematic').getAttribute('data-stage'), 'race-lose');
  await page.waitForTimeout(260);
  const racerRects = await page.locator('.ro-racer').evaluateAll((racers) => racers.map(element => {
    const rect = element.getBoundingClientRect();
    return { left:rect.left, right:rect.right, top:rect.top, bottom:rect.bottom, width:rect.width, height:rect.height, opacity:getComputedStyle(element).opacity };
  }));
  const visibleRacers = racerRects.filter(rect => rect.right > 0 && rect.left < width && rect.bottom > 0 && rect.top < height && rect.width > 12 && rect.height > 12 && Number(rect.opacity) > .1).length;
  assert.ok(visibleRacers >= 2, `${width}px race ending needs visible racers, got ${visibleRacers}: ${JSON.stringify(racerRects)}`);
  if (screenshotDir) await page.screenshot({ path:join(screenshotDir, `race-${width}.png`) });
  await page.evaluate(() => window.RoyalOracleCinematics.stop());

  await page.evaluate(() => window.dispatchEvent(new CustomEvent('naoking:oracledraw', { detail:{ route:'abyssal-blackout-revival', family:'revival', tier:'extreme' } })));
  await page.waitForSelector('.ro-scene-blackout.is-visible');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('naoking:oraclephase', { detail:{ route:'abyssal-blackout-revival', phase:'fake' } })));
  assert.equal(await page.locator('.ro-cinematic').getAttribute('data-stage'), 'blackout-off');
  const darkness = await page.locator('.ro-blackout-darkness').evaluate(element => getComputedStyle(element).backgroundColor);
  assert.equal(darkness, 'rgb(0, 0, 0)');
  await page.evaluate(() => window.RoyalOracleCinematics.resolve('win', 'revival'));
  assert.equal(await page.locator('.ro-cinematic').getAttribute('data-stage'), 'blackout-restart');
  if (screenshotDir) await page.screenshot({ path:join(screenshotDir, `blackout-${width}.png`) });
  await page.evaluate(() => window.RoyalOracleCinematics.stop());

  state = await page.evaluate(() => ({ api:window.RoyalOracleCinematics.getState(), root:Boolean(document.querySelector('#royal-oracle-cinematic-root')), classes:[...document.documentElement.classList].filter(value => value.startsWith('royal-oracle-cinematic')) }));
  assert.equal(state.root, false);
  assert.equal(state.api.active, false);
  assert.equal(state.api.timerCount, 0);
  assert.equal(state.api.frameCount, 0);
  assert.deepEqual(state.classes, []);
  assert.deepEqual(errors, []);
  await context.close();
}

try {
  await exercise(390, 844);
  await exercise(1440, 900);
  console.log(`roulette cinematic tests passed: ${requiredAssets.length} assets, soccer/race/blackout, cleanup, mobile and desktop`);
} finally {
  await browser.close();
}
