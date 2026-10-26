// Browser regression: run with Playwright available and tools/serve.cjs running.
// BASE_URL=http://127.0.0.1:8766 node tests/mobile-keyboard.cjs
// Reduced viewports model keyboard space; they do not emulate an OS keyboard.
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:8766';

(async () => {
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  try {
    for (const [width, height] of [[320, 320], [390, 400], [430, 500]]) {
      const page = await browser.newPage({viewport: {width, height}, hasTouch: true});
      await page.goto(`${base}/game/`);
      await page.locator('body[data-ready=true]').waitFor();
      await page.locator('#guess').fill('chicken');
      const bounds = await page.evaluate(() => {
        const box = s => { const r = document.querySelector(s).getBoundingClientRect(); return {top:r.top, bottom:r.bottom, height:r.height}; };
        return {matches:box('.matches'), first:box('[role=option]'), input:box('#guess'), button:box('#guessBtn')};
      });
      assert.ok(bounds.first.top >= bounds.matches.top && bounds.first.bottom <= bounds.matches.bottom, 'one complete suggestion remains visible');
      assert.ok(bounds.input.bottom <= height && bounds.button.bottom <= height, 'entry controls stay above keyboard');
      const last = page.getByRole('option').last();
      const name = await last.locator('.name').textContent();
      await last.scrollIntoViewIfNeeded();
      await last.tap();
      assert.equal(await page.locator('#guess').inputValue(), name, 'last suggestion can be reached and selected');
      assert.equal(await page.locator('#guess').evaluate(e => e === document.activeElement), true, 'selection preserves typing focus');
      assert.equal(await page.locator('#history li').count(), 0, 'selection does not submit');
      await page.locator('#guessBtn').tap();
      assert.equal(await page.locator('#history li').count(), 1, 'Guess submits selected dish');
      assert.equal(await page.locator('body').evaluate(e => e.classList.contains('typing')), false, 'submission restores browsing');
      await page.close();
      console.log(`PASS ${width}x${height}: visible, scrollable, tappable suggestions and separate submission`);
    }
    const page = await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
    await page.addInitScript(() => {
      const viewport = new EventTarget();
      Object.assign(viewport, {height:400, offsetTop:35});
      Object.defineProperty(window, 'visualViewport', {value:viewport});
    });
    await page.goto(`${base}/game/`);
    await page.locator('body[data-ready=true]').waitFor();
    await page.locator('#guess').fill('chicken');
    assert.deepEqual(await page.locator('.app').evaluate(e => {const r=e.getBoundingClientRect();return [r.top,r.height];}), [35,400], 'uses visual viewport offset and height');
    await page.evaluate(() => {visualViewport.height=320;visualViewport.dispatchEvent(new Event('resize'));});
    assert.equal(await page.locator('.app').evaluate(e => e.getBoundingClientRect().height), 320);
    await page.locator('#doneBtn').tap();
    assert.equal(await page.locator('body').evaluate(e => e.classList.contains('typing')), false);
    await page.setViewportSize({width:1280,height:800});
    await page.locator('#guess').fill('chicken');
    assert.equal(await page.locator('body').evaluate(e => e.classList.contains('typing')), false, 'desktop keeps normal layout');
    console.log('PASS visual viewport offset/resize, Done, and desktop layout');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
