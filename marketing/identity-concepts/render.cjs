// node render.cjs -> out/<brand>-<n>.png (1080x1350 slides, rendered at 1.5x)
const { chromium } = require('playwright');
const path = require('path');
const SLIDES = { n1: 'nada-1', n2: 'nada-2', n3: 'nada-3', n4: 'nada-4', w1: 'ward-1', w2: 'ward-2', w3: 'ward-3', w4: 'ward-4' };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 1.5 });
  await p.goto('file://' + path.join(__dirname, 'identity.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  for (const [id, name] of Object.entries(SLIDES)) await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', name + '.png') });
  await b.close();
})();
