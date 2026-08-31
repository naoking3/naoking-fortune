import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const repo = resolve(import.meta.dirname, '..');
const moduleRoot = process.env.CODEX_NODE_MODULES;
const baseUrl = process.env.NAOKING_TEST_URL;
const screenshotDir = process.env.RO_VISUAL_SCREENSHOTS ? resolve(process.env.RO_VISUAL_SCREENSHOTS) : '';
assert.ok(moduleRoot, 'set CODEX_NODE_MODULES to the bundled node_modules directory');
assert.ok(baseUrl, 'set NAOKING_TEST_URL to a local server URL');
if (screenshotDir) mkdirSync(screenshotDir, { recursive:true });

const { chromium } = await import(pathToFileURL(join(moduleRoot, 'playwright', 'index.mjs')).href);
const browser = await chromium.launch({ headless:true, ...(process.env.NAOKING_CHROME ? { executablePath:process.env.NAOKING_CHROME } : {}) });

async function inspectRoute(viewport, route, verify) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${baseUrl}/#fortune`, { waitUntil:'networkidle', timeout:15000 });
  await page.locator('#skip-opening').click();
  await page.waitForFunction(() => Boolean(window.NaokingRouletteDebug));
  await page.locator('.slot-window').scrollIntoViewIfNeeded();
  await page.evaluate(routeId => window.NaokingRouletteDebug.previewRoute(routeId, 'signal'), route);
  // CCTV panes intentionally boot in order; wait until the final pane is readable.
  await page.waitForTimeout(760);
  await verify(page);
  assert.deepEqual(errors, [], `${route} must not raise page errors at ${viewport.width}px`);
  if (screenshotDir) await page.screenshot({ path:join(screenshotDir, `${route}-${viewport.width}.png`), fullPage:false });
  await context.close();
}

try {
  for (const viewport of [{ width:1440, height:900 }, { width:390, height:844 }]) {
    await inspectRoute(viewport, 'deep-sea-duel', async page => {
      const scene = await page.evaluate(() => ({
        fighters:document.querySelectorAll('.oracle-duel-fighter').length,
        vs:document.querySelector('.oracle-duel-vs')?.textContent,
        sources:[...document.querySelectorAll('.oracle-duel-fighter img')].map(image => image.getAttribute('src'))
      }));
      assert.equal(scene.fighters, 2);
      assert.equal(scene.vs, 'VS');
      assert.deepEqual(scene.sources, ['assets/characters/naoking-1.webp', 'assets/characters/naoking-2.webp']);
    });
    await inspectRoute(viewport, 'cctv-result-chase', async page => {
      const scene = await page.evaluate(() => ({
        feeds:document.querySelectorAll('.oracle-cctv-feed').length,
        labels:[...document.querySelectorAll('.oracle-cctv-feed small')].map(node => node.textContent),
        populated:[...document.querySelectorAll('.oracle-cctv-feed')].every(feed => feed.children.length > 1)
      }));
      assert.equal(scene.feeds, 4);
      assert.deepEqual(scene.labels, ['CAM 01', 'CAM 02', 'CAM 03', 'CAM 04']);
      assert.equal(scene.populated, true);
    });
    await inspectRoute(viewport, 'royal-fish-school', async page => {
      const state = await page.evaluate(() => {
        const school = document.querySelector('.oracle-fish-school');
        const slot = document.querySelector('.slot-window');
        const rect = slot.getBoundingClientRect();
        return {
          visible:school.classList.contains('is-visible'),
          motion:school.dataset.motion,
          count:school.querySelectorAll('.oracle-fish').length,
          anchorX:parseFloat(school.style.getPropertyValue('--fish-anchor-x')),
          anchorY:parseFloat(school.style.getPropertyValue('--fish-anchor-y')),
          slotX:Math.round(rect.left + rect.width / 2),
          slotY:Math.round(rect.top + rect.height / 2)
        };
      });
      assert.equal(state.visible, true);
      assert.equal(state.motion, 'orbit');
      assert.ok(state.count > 0);
      assert.ok(Math.abs(state.anchorX - state.slotX) <= 1, `fish anchor x ${state.anchorX} must follow slot ${state.slotX}`);
      assert.ok(Math.abs(state.anchorY - state.slotY) <= 1, `fish anchor y ${state.anchorY} must follow slot ${state.slotY}`);
    });
  }
  console.log('royal oracle visual checks passed: duel, CCTV, and roulette-anchored fish school at 1440px and 390px');
} finally {
  await browser.close();
}
