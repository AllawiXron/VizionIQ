// node logo-layers.cjs -> layers/logo/<key>.png: each [data-layer] of logo-layers.html alone, on a transparent 1080x1080 canvas
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const dir = path.join(__dirname, 'layers', 'logo');
  fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  await p.goto('file://' + path.join(__dirname, 'logo-layers.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.evaluate(() => document.body.classList.add('solo'));
  const keys = await p.$$eval('[data-layer]', (els) => els.map((e) => e.dataset.layer));
  for (const key of keys) {
    await p.evaluate((k) => document.querySelectorAll('[data-layer]').forEach((e) => e.classList.toggle('on', e.dataset.layer === k)), key);
    await p.locator('#logo').screenshot({ path: path.join(dir, `${key}.png`), omitBackground: true });
  }
  // the full logo, for checking the PSD composite against
  await p.evaluate(() => document.body.classList.remove('solo'));
  await p.locator('#logo').screenshot({ path: path.join(dir, '_flat.png') });
  await b.close();
  console.log(keys.join(' '));
})();
