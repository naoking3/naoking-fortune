import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const moduleRoot = process.env.CODEX_NODE_MODULES;
assert.ok(moduleRoot, 'set CODEX_NODE_MODULES to the bundled node_modules directory');
const { chromium } = await import(pathToFileURL(join(moduleRoot, 'playwright', 'index.mjs')).href);
const baseUrl = process.env.NAOKING_TEST_URL || 'http://127.0.0.1:4173/';
const browser = await chromium.launch({
  headless: true,
  ...(process.env.NAOKING_CHROME ? { executablePath: process.env.NAOKING_CHROME } : {})
});

const overlaps = (a, b) => !(
  a.x + a.width <= b.x
  || b.x + b.width <= a.x
  || a.y + a.height <= b.y
  || b.y + b.height <= a.y
);

async function inspectViewport(width, height) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('#kingdom-sound-control').waitFor({ state: 'attached' });
  const skip = page.locator('#skip-opening');
  if (await skip.isVisible()) await skip.click();
  await page.waitForFunction(() => !document.body.classList.contains('is-opening-active'));

  const destinations = ['home', 'videos', 'fortune', 'game', 'submit', 'join'];
  for (const destination of destinations) {
    await page.evaluate(name => document.querySelector(`[data-tab="${name}"]`)?.click(), destination);
    await page.waitForFunction(name => document.body.dataset.page === name, destination);
    const state = await page.evaluate(name => {
      const alert = name === 'game' ? getComputedStyle(document.querySelector('.game-page-hero'), '::before') : null;
      return {
        activePages: [...document.querySelectorAll('.page:not([hidden])')].map(element => element.id),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        headingVisible: Boolean(document.querySelector(`#${name} h1`)?.getClientRects().length),
        gameAlertHeight: alert ? Number.parseFloat(alert.height) : null
      };
    }, destination);
    assert.deepEqual(state.activePages, [destination], `${width}px: exactly one destination must be visible`);
    assert.ok(state.overflow <= 1, `${width}px: ${destination} creates ${state.overflow}px horizontal overflow`);
    assert.equal(state.headingVisible, true, `${width}px: ${destination} heading must remain visible`);
    if (destination === 'game') {
      assert.ok(state.gameAlertHeight <= 40, `${width}px: CURRENT ALERT must remain a compact label, got ${state.gameAlertHeight}px`);
    }
  }

  const logbook = page.locator('#kingdom-logbook-open');
  const sound = page.locator('#kingdom-sound-control');
  await page.evaluate(() => window.scrollTo(0, Math.min(900, document.documentElement.scrollHeight - innerHeight)));
  await page.waitForTimeout(80);
  const [logbookBox, soundBox] = await Promise.all([logbook.boundingBox(), sound.boundingBox()]);
  assert.ok(logbookBox && soundBox, `${width}px: both floating controls must be visible`);
  assert.ok(logbookBox.y >= 0 && logbookBox.y + logbookBox.height <= height, `${width}px: logbook must remain in the viewport after scroll`);
  assert.equal(overlaps(logbookBox, soundBox), false, `${width}px: logbook and sound controls must not overlap`);

  if (width <= 1100) {
    await page.locator('#menu-button').click();
    assert.equal(
      await logbook.evaluate(element => getComputedStyle(element).visibility),
      'hidden',
      `${width}px: logbook control must not cover the open navigation`
    );
    await page.keyboard.press('Escape');
  }

  await logbook.click();
  const dialogState = await page.locator('#kingdom-logbook').evaluate(dialog => ({
    open: dialog.open,
    describedBy: dialog.getAttribute('aria-describedby'),
    focusContained: dialog.contains(document.activeElement),
    rect: dialog.getBoundingClientRect().toJSON()
  }));
  assert.equal(dialogState.open, true, `${width}px: logbook dialog should open`);
  assert.equal(dialogState.describedBy, 'kingdom-logbook-intro');
  assert.equal(dialogState.focusContained, true, `${width}px: dialog must receive focus`);
  assert.ok(dialogState.rect.left >= -1 && dialogState.rect.right <= width + 1, `${width}px: dialog must fit horizontally`);
  await page.locator('#kingdom-logbook-close').click();

  assert.deepEqual(runtimeErrors, [], `${width}px: no page errors expected`);
  await context.close();
}

try {
  await inspectViewport(390, 844);
  await inspectViewport(1440, 900);
  console.log('kingdom world responsive tests passed: mobile/desktop switching, overflow, controls, menu and dialog verified');
} finally {
  await browser.close();
}
